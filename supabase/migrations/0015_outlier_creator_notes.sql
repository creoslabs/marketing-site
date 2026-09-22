-- Outlier: a free-text note per creator ("why I'm tracking them") — pure
-- user context, never derived from or shown alongside real metrics.

alter table outlier_creators add column if not exists notes text;
