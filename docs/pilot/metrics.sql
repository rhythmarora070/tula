-- Pilot metrics. Run in the Supabase SQL editor (as the project owner).
-- Set the pilot's first day once, in the params line of each query.
-- A "student" is a signed-up account; a "capture" is one tap of Save on the confirm card.

-- 1. Sign-ups and first use: how many signed up, and how many saved a deadline within 3 days.
with params as (select date '2026-11-23' as start)
select count(*) as signed_up,
       count(*) filter (where exists (
         select 1 from public.capture_events e
         where e.user_id = u.id and e.at < u.created_at + interval '3 days')) as saved_within_3_days
from auth.users u, params
where u.created_at >= params.start;

-- 2. Captures per active student, by pilot week (target: 3 or more).
with params as (select date '2026-11-23' as start)
select floor(extract(epoch from (e.at - params.start)) / 604800)::int + 1 as pilot_week,
       count(distinct e.user_id) as active_students,
       count(*) as captures,
       round(count(*)::numeric / nullif(count(distinct e.user_id), 0), 1) as captures_per_active_student
from public.capture_events e, params
where e.at >= params.start
group by 1 order by 1;

-- 3. Still capturing in week 4 (target: 30% or more of everyone who signed up in week 1).
--    Week 4 is days 21 to 27 after each student's own sign-up.
with params as (select date '2026-11-23' as start),
cohort as (
  select u.id, u.created_at from auth.users u, params
  where u.created_at >= params.start and u.created_at < params.start + interval '7 days'
)
select count(*) as week_1_signups,
       count(*) filter (where exists (
         select 1 from public.capture_events e
         where e.user_id = c.id
           and e.at >= c.created_at + interval '21 days'
           and e.at < c.created_at + interval '28 days')) as capturing_in_week_4,
       round(100.0 * count(*) filter (where exists (
         select 1 from public.capture_events e
         where e.user_id = c.id
           and e.at >= c.created_at + interval '21 days'
           and e.at < c.created_at + interval '28 days')) / nullif(count(*), 0), 0) as pct
from cohort c;

-- 4. Saved without edits (target: 85% or more), split by AI vs plain-code reading and by input.
--    "edited" counts saved items whose title, date, what-to-submit, link or stakes were changed.
with params as (select date '2026-11-23' as start)
select ai, input,
       sum(saved + merged) as items_saved,
       sum(edited) as items_edited,
       round(100 * (1 - sum(edited)::numeric / nullif(sum(saved + merged), 0)), 0) as pct_saved_without_edits
from public.capture_events e, params
where e.at >= params.start
group by 1, 2 order by 1, 2;

-- 5. How students capture: share sheet vs paste vs typing, and screenshots vs text.
with params as (select date '2026-11-23' as start)
select source, input, count(*) as captures, count(distinct user_id) as students
from public.capture_events e, params
where e.at >= params.start
group by 1, 2 order by 3 desc;

-- 6. Error reports in the last 2 days, most common first. Check every morning.
select message, count(*) as reports, count(distinct user_id) as students,
       min(at) as first_seen, max(at) as last_seen,
       string_agg(distinct app_version, ', ') as app_versions,
       string_agg(distinct os_version, ', ') as android_versions
from public.client_errors
where at > now() - interval '2 days'
group by 1 order by 2 desc
limit 20;

-- 7. AI reads per day, and the heaviest users (cost watch; the cap is 100 per student per day).
select date_trunc('day', at) as day, count(*) as ai_reads, count(distinct user_id) as students,
       count(*) filter (where input = 'image') as screenshots,
       count(*) filter (where input = 'pdf') as pdfs
from public.extract_usage
where at > now() - interval '14 days'
group by 1 order by 1 desc;
