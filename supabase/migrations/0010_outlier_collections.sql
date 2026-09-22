-- Outlier: named collections for grouping favourited posts ("Q1 ideas",
-- "Client X") — a post can belong to any number of collections. Membership
-- is a plain join table since a favourite itself is still just the
-- existing outlier_posts.favourited boolean; collections are an additional
-- way to organize that same favourited set, not a replacement for it.

create table if not exists outlier_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists outlier_collections_user_id_idx on outlier_collections(user_id, created_at);

create table if not exists outlier_collection_posts (
  collection_id uuid not null references outlier_collections(id) on delete cascade,
  post_id uuid not null references outlier_posts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, post_id)
);

create index if not exists outlier_collection_posts_post_id_idx on outlier_collection_posts(post_id);

alter table outlier_collections enable row level security;
alter table outlier_collection_posts enable row level security;

create policy "select own collections" on outlier_collections for select using (auth.uid() = user_id);
create policy "insert own collections" on outlier_collections for insert with check (auth.uid() = user_id);
create policy "delete own collections" on outlier_collections for delete using (auth.uid() = user_id);

create policy "select own collection posts" on outlier_collection_posts for select using (
  exists (select 1 from outlier_collections c where c.id = collection_id and c.user_id = auth.uid())
);
-- Insert/delete both check ownership of the collection AND the post being
-- added — without the second check, someone could try to file a post_id
-- they don't own into a collection they do own.
create policy "insert own collection posts" on outlier_collection_posts for insert with check (
  exists (select 1 from outlier_collections c where c.id = collection_id and c.user_id = auth.uid())
  and exists (
    select 1 from outlier_posts p join outlier_handles h on h.id = p.handle_id
    where p.id = post_id and h.user_id = auth.uid()
  )
);
create policy "delete own collection posts" on outlier_collection_posts for delete using (
  exists (select 1 from outlier_collections c where c.id = collection_id and c.user_id = auth.uid())
);
