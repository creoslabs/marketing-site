-- Outlier: a repurposed script can be marked public for a read-only share
-- link, viewable without signing in. The share URL uses the row's own id
-- (a cryptographically random UUID, not sequential/guessable) rather than
-- a separate token — simpler, and "unsharing" is just flipping is_public
-- back to false.
--
-- Scoped to repurposes only, not Signal reports — a report's public view
-- would also need public-read policies on signal_criteria/signal_findings
-- and on the storage bucket serving its images/frames, which is
-- meaningfully more surface area to get right in one pass.

alter table outlier_repurposes add column if not exists is_public boolean not null default false;

-- Anyone (including anonymous requests) can read a repurpose once its
-- owner has made it public — Postgres OR's this together with the
-- existing "select own repurposes" policy, so owners keep seeing their
-- private ones regardless.
create policy "select public repurposes" on outlier_repurposes for select using (is_public = true);

-- The owner can flip is_public themselves — everything else about a
-- repurpose (title, hook, beats, topic) is still only ever written by the
-- server during generation.
create policy "update own repurposes" on outlier_repurposes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
