-- Shared in-app notifications, not scoped to a single product — Signal's
-- analyze route writes to this now; Outlier's pull pipeline can write to it
-- the same way once it exists. Run this once in the Supabase SQL editor
-- after 0001_signal_schema.sql and 0002_signal_frames.sql.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx on notifications(user_id, created_at desc);

alter table notifications enable row level security;

create policy "select own notifications" on notifications for select using (auth.uid() = user_id);
create policy "update own notifications" on notifications for update using (auth.uid() = user_id);

-- Notifications are only ever created by the server (service role) when
-- something worth surfacing happens — no client insert policy needed.
