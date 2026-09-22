-- Outlier: the "insert own handles" policy only checked that the new row's
-- user_id matched the caller — it never verified that creator_id actually
-- points at a creator that same user owns. The one app route that inserts
-- handles (POST /api/outlier/creators/[id]/handles) already guards against
-- this with an app-level ownership check before inserting, so this isn't
-- currently exploitable — but the policy itself should enforce it directly
-- rather than depend on every future caller remembering to check first.

drop policy if exists "insert own handles" on outlier_handles;

create policy "insert own handles" on outlier_handles for insert with check (
  auth.uid() = user_id
  and exists (select 1 from outlier_creators c where c.id = creator_id and c.user_id = auth.uid())
);
