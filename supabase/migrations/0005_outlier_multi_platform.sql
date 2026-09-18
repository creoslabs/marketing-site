-- Outlier: a creator can now be tracked on more than one platform under
-- one card (e.g. the same person's TikTok and Instagram), and YouTube
-- Shorts is added alongside TikTok/Instagram. This SUPERSEDES 0004 —
-- run this instead of 0004 if you haven't run 0004 yet; if you already
-- ran 0004, this drops and rebuilds outlier_creators/outlier_posts/
-- outlier_jobs, so IT DELETES ANY CREATORS/POSTS/JOBS ALREADY PULLED.
-- That's expected to be zero or near-zero real rows given how recently
-- 0004 shipped — if you've already pulled real data you want to keep,
-- stop here and ask for a data-preserving version instead.

create extension if not exists "pgcrypto";

drop table if exists outlier_jobs;
drop table if exists outlier_posts;
drop table if exists outlier_creators;

-- ---------------------------------------------------------------------
-- Creators — a person, not a single handle. Display name only; the
-- platforms they're tracked on live in outlier_handles below.
-- ---------------------------------------------------------------------
create table outlier_creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create index outlier_creators_user_id_idx on outlier_creators(user_id);

-- ---------------------------------------------------------------------
-- Handles — one row per (platform, handle) a creator is tracked on. A
-- pull operates on exactly one handle; a creator can have several.
-- ---------------------------------------------------------------------
create table outlier_handles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references outlier_creators(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('IG', 'TT', 'YT')),
  handle text not null,
  status text not null default 'active' check (status in ('active', 'pulling', 'error')),
  error text,
  last_pulled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, platform, handle)
);

create index outlier_handles_creator_id_idx on outlier_handles(creator_id);
create index outlier_handles_user_id_idx on outlier_handles(user_id);

-- ---------------------------------------------------------------------
-- Posts — scraped via Apify, one handle's pull at a time. Deep analysis
-- (transcript/beats/hook tags) is a separate, user-triggered step per
-- post — see analyze route — not automatic for every pulled post.
-- ---------------------------------------------------------------------
create table outlier_posts (
  id uuid primary key default gen_random_uuid(),
  handle_id uuid not null references outlier_handles(id) on delete cascade,
  external_id text not null,
  platform text not null check (platform in ('IG', 'TT', 'YT')),
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
  unique (handle_id, external_id)
);

create index outlier_posts_handle_id_idx on outlier_posts(handle_id, posted_at desc);

-- ---------------------------------------------------------------------
-- Jobs — one row per pull (a single handle's fast Apify metadata scrape).
-- ---------------------------------------------------------------------
create table outlier_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_id uuid not null references outlier_handles(id) on delete cascade,
  state text not null default 'queued' check (state in ('queued', 'running', 'done', 'failed')),
  stage text,
  new_posts_count int,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index outlier_jobs_user_id_idx on outlier_jobs(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table outlier_creators enable row level security;
alter table outlier_handles enable row level security;
alter table outlier_posts enable row level security;
alter table outlier_jobs enable row level security;

create policy "select own creators" on outlier_creators for select using (auth.uid() = user_id);
create policy "insert own creators" on outlier_creators for insert with check (auth.uid() = user_id);
create policy "update own creators" on outlier_creators for update using (auth.uid() = user_id);
create policy "delete own creators" on outlier_creators for delete using (auth.uid() = user_id);

create policy "select own handles" on outlier_handles for select using (auth.uid() = user_id);
create policy "insert own handles" on outlier_handles for insert with check (auth.uid() = user_id);
create policy "update own handles" on outlier_handles for update using (auth.uid() = user_id);
create policy "delete own handles" on outlier_handles for delete using (auth.uid() = user_id);

create policy "select own posts" on outlier_posts for select using (
  exists (select 1 from outlier_handles h where h.id = handle_id and h.user_id = auth.uid())
);
-- Posts are written by the server (service role) during a pull/analysis —
-- no client insert policy needed.

create policy "select own jobs" on outlier_jobs for select using (auth.uid() = user_id);
-- Jobs are written by the server (service role) — no client insert policy.
