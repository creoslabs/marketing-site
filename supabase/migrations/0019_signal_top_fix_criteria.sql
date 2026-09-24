-- Claude already computes which criteria a top-fix would resolve
-- (addressesCriteria in lib/signal/claude.ts) but only the count ever
-- reached the database (top_fix_clears) — the new PDF report template's
-- "top fix" checklist needs the actual criterion names, not just a number.
alter table signal_assets add column if not exists top_fix_criteria text[] not null default '{}';
