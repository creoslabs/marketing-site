-- Outlier: repurposing an analyzed outlier post into a new, original script
-- for the user's own content, modeled on the source post's proven hook
-- style and beat structure. One row per generated script.

create table if not exists outlier_repurposes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references outlier_posts(id) on delete cascade,
  creator_id uuid not null references outlier_creators(id) on delete cascade,
  topic text not null,
  source_score numeric not null,
  title text not null,
  hook text not null,
  beats jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists outlier_repurposes_user_id_idx on outlier_repurposes(user_id, created_at desc);

alter table outlier_repurposes enable row level security;

create policy "select own repurposes" on outlier_repurposes for select using (auth.uid() = user_id);
-- Repurposes are written by the server (service role) — no client insert policy.
