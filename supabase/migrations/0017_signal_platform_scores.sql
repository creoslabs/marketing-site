-- A creative can target more than one ad platform (e.g. the same vertical
-- video running as both a TikTok ad and a Meta Reels/Stories ad), and each
-- platform's UI chrome sits differently — TikTok's caption/CTA cluster and
-- Meta's Reels overlay don't occupy the same safe-zone margins. platforms[0]
-- stays the "primary" platform: its score/criteria continue to live on
-- signal_assets/signal_criteria exactly as before, so every existing feature
-- (failure themes, streaks, recurring passes, benchmarks) keeps working
-- unmodified. signal_platform_scores is purely additive — one row per
-- platform an asset targets, carrying that platform's score and its
-- platform-specific safe-zone verdict.
alter table signal_assets add column if not exists platforms text[] not null default '{}';

update signal_assets set platforms = array[case when platform = 'Instagram' then 'Meta' else platform end]
  where platforms = '{}';
update signal_assets set platform = 'Meta' where platform = 'Instagram';

create table if not exists signal_platform_scores (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references signal_assets(id) on delete cascade,
  platform text not null,
  score int not null,
  failed_checks int not null,
  safe_zone_evidence text not null,
  safe_zone_verdict text not null check (safe_zone_verdict in ('pass', 'partial', 'fail')),
  created_at timestamptz not null default now(),
  unique (asset_id, platform)
);

create index if not exists signal_platform_scores_asset_id_idx on signal_platform_scores(asset_id);

alter table signal_platform_scores enable row level security;

create policy "select own platform scores" on signal_platform_scores for select using (
  exists (select 1 from signal_assets a where a.id = asset_id and a.user_id = auth.uid())
);

-- Only ever written by the server (service role key) during analysis — same
-- reasoning as signal_criteria/signal_findings, no client insert policy.
