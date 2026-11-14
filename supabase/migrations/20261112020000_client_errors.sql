-- Crash and error reports from the app, so problems on students' phones reach the team during the pilot.
-- Only sent by signed-in students; holds the error message (trimmed), where it happened, the app
-- version and the Android version. No deadlines, notices or device identifiers. Deleted with the account.

create table public.client_errors (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  source text not null check (source in ('screen', 'global')),
  message text not null check (char_length(message) <= 500),
  stack text check (char_length(stack) <= 2000),
  app_version text check (char_length(app_version) <= 40),
  os_version text check (char_length(os_version) <= 40)
);

create index client_errors_at on public.client_errors (at);

alter table public.client_errors enable row level security;

-- Students can file reports but not read anyone's, their own included; the team reads them in the SQL editor.
create policy "Insert own error reports" on public.client_errors
  for insert to authenticated with check ((select auth.uid()) = user_id);
