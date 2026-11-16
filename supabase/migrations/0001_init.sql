-- Ønskelisten v1 schema.
-- All access goes through the Next.js server with the service-role key.
-- RLS is enabled with no policies, so the anon and authenticated roles can read or write nothing.

create extension if not exists pgcrypto;

create table public.wishes (
  id               uuid primary key default gen_random_uuid(),
  legacy_id        text unique,                       -- id from the Claude artifact, for idempotent import
  title            text not null check (length(title) between 1 and 200),
  url              text not null default '',
  price_amount     numeric(12,2),
  currency         text check (currency in ('DKK','EUR','GBP','SEK','NOK','USD')),
  price_checked_at timestamptz,
  note             text not null default '',
  category         text not null default 'andet'
                   check (category in ('bryg','baad','boeger','gadget','koekken','oplevelse','toej','andet')),
  priority         smallint not null default 2 check (priority in (1,2,3)),
  occasions        text[] not null default array['jul','fødselsdag'],
  status           text not null default 'active' check (status in ('active','received')),
  suggested        boolean not null default false,
  received_from    text not null default '',
  received_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index wishes_status_idx on public.wishes (status, suggested, priority);

create table public.givers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (length(name) between 1 and 60),
  email            text not null unique,
  active_for_mail  boolean not null default true,
  link_version     integer not null default 1,        -- bump to revoke the personal link
  last_seen_at     timestamptz,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  wish_id     uuid not null unique references public.wishes(id) on delete cascade,
  giver_id    uuid not null references public.givers(id) on delete cascade,
  status      text not null default 'reserved' check (status in ('reserved','bought')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.mail_sends (
  id            uuid primary key default gen_random_uuid(),
  sent_at       timestamptz not null default now(),
  occasion      text not null check (occasion in ('jul','fødselsdag')),
  recipient_ids uuid[] not null default '{}',
  wish_ids      uuid[] not null default '{}',
  wish_titles   jsonb not null default '{}'::jsonb   -- {wish_id: title} to name removed wishes later
);

create table public.price_checks (
  id          uuid primary key default gen_random_uuid(),
  wish_id     uuid not null references public.wishes(id) on delete cascade,
  checked_at  timestamptz not null default now(),
  amount      numeric(12,2),
  currency    text,
  ok          boolean not null,
  error       text
);
create index price_checks_wish_idx on public.price_checks (wish_id, checked_at desc);

-- Keep updated_at honest.
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger wishes_touch before update on public.wishes for each row execute function public.touch_updated_at();
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();

-- Deny-all for client roles.
alter table public.wishes        enable row level security;
alter table public.givers        enable row level security;
alter table public.reservations  enable row level security;
alter table public.mail_sends    enable row level security;
alter table public.price_checks  enable row level security;
revoke all on all tables in schema public from anon, authenticated;
