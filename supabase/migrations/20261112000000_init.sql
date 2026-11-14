-- Tula: deadlines synced from the app, capture events for pilot metrics,
-- and extraction usage for the daily cap. Every table is private to its owner.

-- One row per deadline. The app is local-first; this is the backup and cross-device copy.
create table public.deadlines (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at bigint not null,
  primary key (user_id, id)
);

alter table public.deadlines enable row level security;

create policy "Read own deadlines" on public.deadlines
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own deadlines" on public.deadlines
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own deadlines" on public.deadlines
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own deadlines" on public.deadlines
  for delete to authenticated using ((select auth.uid()) = user_id);

-- One row each time a student saves from the confirm card. No notice text is stored.
-- Pilot metrics: captures per student per week, and the share saved without edits.
create table public.capture_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  source text not null check (source in ('share', 'paste', 'quick')),
  input text not null check (input in ('text', 'image', 'pdf', 'typed')),
  ai boolean not null,
  found int not null check (found >= 0),
  saved int not null check (saved >= 0),
  edited int not null check (edited >= 0),
  merged int not null default 0 check (merged >= 0)
);

create index capture_events_user_at on public.capture_events (user_id, at);

alter table public.capture_events enable row level security;

create policy "Read own capture events" on public.capture_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own capture events" on public.capture_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete own capture events" on public.capture_events
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Written only by the extract function (service role), so a student can't reset their own cap.
create table public.extract_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  input text not null
);

create index extract_usage_user_at on public.extract_usage (user_id, at);

alter table public.extract_usage enable row level security;
-- No policies: not readable or writable from the app.
