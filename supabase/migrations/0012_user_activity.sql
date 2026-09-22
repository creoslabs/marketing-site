-- Tracks when a user last opened the Workspace overview, so it can show a
-- "since you were last here" recap. Not scoped to Outlier or Signal
-- specifically — a shared, product-agnostic table, same reasoning as
-- notifications.

create table if not exists user_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

alter table user_activity enable row level security;

create policy "select own activity" on user_activity for select using (auth.uid() = user_id);
create policy "insert own activity" on user_activity for insert with check (auth.uid() = user_id);
create policy "update own activity" on user_activity for update using (auth.uid() = user_id);
