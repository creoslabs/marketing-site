-- Outlier: persist each handle's profile picture URL, captured at pull
-- time (currently only TikTok's scraper reliably returns one). Run once
-- in the Supabase SQL editor after 0005.

alter table outlier_handles add column if not exists avatar_url text;
