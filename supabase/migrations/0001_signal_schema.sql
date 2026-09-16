-- Signal: real assets, criteria, and findings, replacing the fixture data
-- in src/app/signal/data.ts. Run this once in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Assets
-- ---------------------------------------------------------------------
create table if not exists signal_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  format text not null check (format in ('video', 'static')),
  platform text,
  storage_path text not null,
  status text not null default 'processing' check (status in ('processing', 'done', 'failed')),
  error text,
  score int,
  failed_checks int,
  duration_seconds numeric,
  width int,
  height int,
  top_fix_title text,
  top_fix_clears int,
  top_fix_body text,
  created_at timestamptz not null default now()
);

create index if not exists signal_assets_user_id_idx on signal_assets(user_id);

-- ---------------------------------------------------------------------
-- Criteria — one row per criterion per asset (16 for video, 7 for static)
-- ---------------------------------------------------------------------
create table if not exists signal_criteria (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references signal_assets(id) on delete cascade,
  name text not null,
  tier int not null check (tier in (1, 2)),
  evidence text not null,
  verdict text not null check (verdict in ('pass', 'partial', 'fail')),
  sort_order int not null default 0
);

create index if not exists signal_criteria_asset_id_idx on signal_criteria(asset_id);

-- ---------------------------------------------------------------------
-- Findings — timestamped (video) or spatial (static)
-- ---------------------------------------------------------------------
create table if not exists signal_findings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references signal_assets(id) on delete cascade,
  criterion_name text not null,
  tier int not null check (tier in (1, 2)),
  body text not null,
  failure boolean not null default false,
  -- video findings:
  t int,
  -- static findings:
  marker text check (marker in ('A', 'B', 'check')),
  region_top numeric,
  region_left numeric,
  region_width numeric,
  region_height numeric,
  sort_order int not null default 0
);

create index if not exists signal_findings_asset_id_idx on signal_findings(asset_id);

-- ---------------------------------------------------------------------
-- Row Level Security — every row is scoped to the user who uploaded it
-- ---------------------------------------------------------------------
alter table signal_assets enable row level security;
alter table signal_criteria enable row level security;
alter table signal_findings enable row level security;

create policy "select own assets" on signal_assets for select using (auth.uid() = user_id);
create policy "insert own assets" on signal_assets for insert with check (auth.uid() = user_id);
create policy "update own assets" on signal_assets for update using (auth.uid() = user_id);
create policy "delete own assets" on signal_assets for delete using (auth.uid() = user_id);

create policy "select own criteria" on signal_criteria for select using (
  exists (select 1 from signal_assets a where a.id = asset_id and a.user_id = auth.uid())
);
create policy "select own findings" on signal_findings for select using (
  exists (select 1 from signal_assets a where a.id = asset_id and a.user_id = auth.uid())
);

-- Criteria/findings are only ever written by the server (service role key,
-- which bypasses RLS entirely) during analysis — no client-side insert
-- policy needed for those two tables.

-- ---------------------------------------------------------------------
-- Storage bucket for uploaded assets — private, one folder per user
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('signal-assets', 'signal-assets', false)
on conflict (id) do nothing;

create policy "upload own signal assets" on storage.objects for insert
  with check (bucket_id = 'signal-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "read own signal assets" on storage.objects for select
  using (bucket_id = 'signal-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own signal assets" on storage.objects for delete
  using (bucket_id = 'signal-assets' and (storage.foldername(name))[1] = auth.uid()::text);
