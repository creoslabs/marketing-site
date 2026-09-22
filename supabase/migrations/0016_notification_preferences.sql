-- Opt-out notification preferences, one row per user. Absence of a key (or
-- an empty/missing row entirely) means "enabled" — this is opt-out, not
-- opt-in, so a brand-new user with no row yet still gets every category
-- until they explicitly turn one off.

create table if not exists notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  categories jsonb not null default '{}'::jsonb
);

alter table notification_preferences enable row level security;

create policy "select own notification prefs" on notification_preferences for select using (auth.uid() = user_id);
create policy "upsert own notification prefs" on notification_preferences for insert with check (auth.uid() = user_id);
create policy "update own notification prefs" on notification_preferences for update using (auth.uid() = user_id);
