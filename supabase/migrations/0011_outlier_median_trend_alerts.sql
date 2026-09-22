-- Outlier: lets the pull pipeline notice when a creator's median shifts
-- meaningfully between pulls, instead of the user having to notice
-- themselves. last_median is the creator-level median (across all their
-- handles combined, matching how the UI already computes it) as of the
-- last time it was checked — updated after every pull regardless of
-- whether that pull triggered an alert.

alter table outlier_creators add column if not exists last_median numeric;
