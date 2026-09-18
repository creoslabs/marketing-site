-- Outlier: real creators/posts, replacing the empty fixture arrays in
-- src/app/outlier/data.ts. Run this once in the Supabase SQL editor after
-- the Signal migrations.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Creators — the watchlist
-- ---------------------------------------------------------------------
create table if not exists outlier_creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('IG', 'TT')),
  handle text not null,
  display_name text,
  status text not null default 'active' check (status in ('active', 'pulling', 'error')),
  error text,
  last_pulled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, platform, handle)
);

create index if not exists outlier_creators_user_id_idx on outlier_creators(user_id);

-- ---------------------------------------------------------------------
-- Posts — scraped via Apify. Deep analysis (transcript/beats/hook tags)
-- is a separate, user-triggered step per post (see analyze route) rather
-- than automatic for every pulled post — downloading + transcribing +
-- analyzing a whole creator's history in one request isn't feasible
-- within a serverless function's time budget, and most pulled posts
-- aren't outliers worth the cost anyway.
-- ---------------------------------------------------------------------
create table if not exists outlier_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references outlier_creators(id) on delete cascade,
  external_id text not null,
  platform text not null check (platform in ('IG', 'TT')),
  caption text,
  url text not null,
  video_url text,
  thumbnail_url text,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  saves bigint,
  followers bigint,
  duration_seconds numeric,
  posted_at timestamptz not null,
  analysis_status text not null default 'none' check (analysis_status in ('none', 'analyzing', 'done', 'failed')),
  analysis_error text,
  transcript jsonb,
  beats jsonb,
  hook_tags text[],
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (creator_id, external_id)
);

create index if not exists outlier_posts_creator_id_idx on outlier_posts(creator_id, posted_at desc);

-- ---------------------------------------------------------------------
-- Jobs — one row per pull (the fast Apify metadata scrape, not the deep
-- per-post analysis, which tracks its own status on the post row).
-- ---------------------------------------------------------------------
create table if not exists outlier_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creator_id uuid not null references outlier_creators(id) on delete cascade,
  state text not null default 'queued' check (state in ('queued', 'running', 'done', 'failed')),
  stage text,
  new_posts_count int,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists outlier_jobs_user_id_idx on outlier_jobs(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table outlier_creators enable row level security;
alter table outlier_posts enable row level security;
alter table outlier_jobs enable row level security;

create policy "select own creators" on outlier_creators for select using (auth.uid() = user_id);
create policy "insert own creators" on outlier_creators for insert with check (auth.uid() = user_id);
create policy "update own creators" on outlier_creators for update using (auth.uid() = user_id);
create policy "delete own creators" on outlier_creators for delete using (auth.uid() = user_id);

create policy "select own posts" on outlier_posts for select using (
  exists (select 1 from outlier_creators c where c.id = creator_id and c.user_id = auth.uid())
);
-- Posts are written by the server (service role) during a pull/analysis —
-- no client insert policy needed.

create policy "select own jobs" on outlier_jobs for select using (auth.uid() = user_id);
-- Jobs are written by the server (service role) — no client insert policy.
