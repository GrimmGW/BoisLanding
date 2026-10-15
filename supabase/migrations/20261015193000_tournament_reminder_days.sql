alter table public.tournaments_seen
  add column if not exists notified_three boolean not null default false,
  add column if not exists notified_day boolean not null default false,
  add column if not exists registration_closes_at timestamptz;
