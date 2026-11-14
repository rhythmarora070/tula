-- Deleting a deadline in the app replaces its row with a tombstone: data = {"id", "deleted": true, "updatedAt"}.
-- Other phones signed in to the same account drop their copy when they see it.
-- A tombstone is final: a phone still holding an old copy can't bring the deadline back by
-- editing it, because any update to a tombstoned row is ignored.

create function public.keep_deadline_tombstones()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce((old.data ->> 'deleted')::boolean, false) then
    return old; -- leave the tombstone as it is
  end if;
  return new;
end;
$$;

create trigger deadlines_keep_tombstones
  before update on public.deadlines
  for each row execute function public.keep_deadline_tombstones();
