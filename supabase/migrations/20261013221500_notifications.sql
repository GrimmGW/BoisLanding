create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.tournaments_seen (
  id text primary key,
  name text not null,
  start_at timestamptz,
  url text,
  notified_new boolean not null default false,
  notified_window boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
alter table public.tournaments_seen enable row level security;

revoke all on public.push_subscriptions from anon, authenticated;
revoke all on public.tournaments_seen from anon, authenticated;

-- El valor de 'tournament_watch_cron_secret' se crea aparte con vault.create_secret para que no quede en git.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'tournament-watch') then
    perform cron.unschedule('tournament-watch');
  end if;
end
$$;

select cron.schedule(
  'tournament-watch',
  '*/5 * * * *',
  $job$
  select net.http_post(
    url := 'https://gbojyljhpfltlgxslibd.supabase.co/functions/v1/tournament-watch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'tournament_watch_cron_secret'
        limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
  $job$
);
