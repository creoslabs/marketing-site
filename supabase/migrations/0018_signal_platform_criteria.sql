-- Research into Meta vs TikTok ad best practices (duration, hook-window
-- timing, cut pacing — not just safe-zone) found that eight of Signal's 16
-- video criteria genuinely vary by platform, not just one. Storing only the
-- safe-zone fields per platform no longer covers it, so this replaces those
-- two columns with the platform's full criteria array — the report page
-- swaps the whole array when switching platform tabs instead of patching
-- one row by name.
alter table signal_platform_scores add column if not exists criteria jsonb not null default '[]';
alter table signal_platform_scores drop column if exists safe_zone_evidence;
alter table signal_platform_scores drop column if exists safe_zone_verdict;
