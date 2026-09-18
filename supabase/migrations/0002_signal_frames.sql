-- Signal: persisted keyframes for video reports. Video source files are no
-- longer kept after analysis (see analyze/route.ts) — the report shows
-- exactly the frames Claude actually looked at, which is both more honest
-- (the analysis never covered continuous video, only these samples) and far
-- cheaper to store than the original upload. Run this once in the Supabase
-- SQL editor after 0001_signal_schema.sql.

create table if not exists signal_frames (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references signal_assets(id) on delete cascade,
  t int not null,
  storage_path text not null
);

create index if not exists signal_frames_asset_id_idx on signal_frames(asset_id);

alter table signal_frames enable row level security;

create policy "select own frames" on signal_frames for select using (
  exists (select 1 from signal_assets a where a.id = asset_id and a.user_id = auth.uid())
);

-- Frames are only ever written by the server (service role) during
-- analysis, same as signal_criteria/signal_findings — no client insert policy.
