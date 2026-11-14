# Tula backend (Supabase)

| Path | What it does |
| --- | --- |
| `migrations/20261112000000_init.sql` | `deadlines` (backup copy of each deadline), `capture_events` (counts only, for pilot metrics), `extract_usage` (daily cap). Row-level security on all three; every row is deleted with its account |
| `migrations/20261112010000_deadline_tombstones.sql` | A deleted deadline becomes a tombstone (id and time only) so every phone on the account drops it; a trigger makes tombstones final |
| `functions/extract` | Reads a notice (text, screenshot or PDF) with Gemini 3.5 Flash-Lite and returns proposed deadlines. Signed-in users only, 100 reads per day by default. The notice is never stored or logged |
| `functions/delete-account` | Deletes the signed-in student's account and, by cascade, all their rows |
| `config.toml` | Project settings: 6-digit email codes that expire in 10 minutes, the sign-in email, and both functions limited to signed-in users |
| `templates/sign-in-code.html` | The sign-in email: shows the code, no link |

## Deploy

From the repo root. `link` asks you to log in to Supabase once.

```bash
npx supabase link
```

```bash
npx supabase db push
```

Before pushing the config, set `site_url` in `config.toml` to the live site. `config push` shows a diff of every change and asks before writing:

```bash
npx supabase config push
```

**Set up email before the pilot.** Supabase's built-in sender only allows a few emails an hour, which means most students wouldn't get their code. Add an SMTP provider under `[auth.email.smtp]` in `config.toml` (keep the password in an environment variable, as the commented example shows) or in the dashboard under Authentication → Emails.

```bash
npx supabase secrets set GEMINI_API_KEY=your-key
```

```bash
npx supabase functions deploy extract
```

```bash
npx supabase functions deploy delete-account
```

Supabase provides `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS` and `SUPABASE_JWKS` to functions automatically. Both functions verify the caller with Supabase's `@supabase/server` package (`createSupabaseContext`, `auth: 'user'`), which checks the student's token against the project's signing keys and builds the admin client from the new secret key. Neither function reads a key itself, so they work with the new API keys and with legacy keys turned off.

Optional secrets:

| Secret | Default | Use |
| --- | --- | --- |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Google's current small model (checked 12 Nov 2026). Switch here when Google moves on |
| `GEMINI_API_VERSION` | `v1beta` | Google also offers a stable `v1` Interactions endpoint |
| `EXTRACT_DAILY_CAP` | `100` | Notices one student can have read per day |

**Turn on billing for the Gemini key before real students use it.** On the free tier Google may use the content to improve its products; the privacy policy promises it won't.

### How extract calls Gemini

It uses the **Interactions API** (`POST /v1beta/interactions`), which Google recommends for new projects, with:
- `store: false`, so Google keeps no copy of the notice
- a JSON schema in `response_format`, so the model can only answer in the shape the app expects
- screenshots sent as `image` input and PDFs as `document` input

The app still re-checks every date with its own resolver before showing the confirm card.

## Pilot metrics

Run in the SQL editor (as the project owner):

```sql
-- captures per active student per week, and the share saved without edits
select date_trunc('week', at) as week,
       count(distinct user_id) as students,
       round(count(*)::numeric / nullif(count(distinct user_id), 0), 1) as captures_per_student,
       round(100 * (1 - sum(edited)::numeric / nullif(sum(saved + merged), 0)), 0) as pct_saved_without_edits
from public.capture_events
group by 1 order by 1;
```

```sql
-- students still capturing in week 4 of the pilot (set the start date)
with s as (select user_id, min(at) as first_at from public.capture_events group by 1)
select count(*) filter (where exists (
         select 1 from public.capture_events e
         where e.user_id = s.user_id and e.at >= s.first_at + interval '21 days' and e.at < s.first_at + interval '28 days'))
       * 100.0 / count(*) as pct_capturing_in_week_4
from s;
```

## Tests

Both functions run against a fake Supabase and a fake model, so the tests need no keys or network. The sign-in checks are real: the tests sign user tokens with a throwaway key published as the project's signing key, and check that missing, forged and expired tokens are refused. They also cover text, screenshot and PDF requests, odd model output, the daily cap, input checks, model failures, and that an account deletion only ever removes the caller.

```bash
cd supabase/functions && npx deno@2 test --allow-env
```

## Not verified yet

Nothing has been deployed, because there is no Supabase project or Gemini key yet. Row-level security, the sign-in email, and Gemini's real responses will only be proven against a live project.
