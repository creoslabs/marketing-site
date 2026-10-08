-- Integrations: send Outlier and Signal results to Slack, email, Google Sheets
-- and Notion. Connections belong to the Creos Labs account (not to either
-- product), so connecting once in Outlier makes it available in Signal too.
--
-- Tokens live in secrets_encrypted (AES-256-GCM, key held in the server
-- environment). RLS is enabled with NO policies on purpose: the browser and
-- the RLS-scoped client can never read these tables. Everything goes through
-- the service-role client in server-only code, which strips secrets before
-- anything is returned to a page.

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('slack', 'email', 'sheets', 'notion')),
  -- connected: working. attention: token revoked/expired, needs reconnecting.
  status text not null default 'connected' check (status in ('connected', 'attention')),
  -- Short human label shown on the card, e.g. "Acme · #marketing-alerts".
  label text,
  -- Non-secret provider details: team/channel names, sheet URL, database id,
  -- email address list with confirmation state.
  config jsonb not null default '{}'::jsonb,
  -- Per-event routing: { "<event>": { "enabled": bool, "frequency": "instant" | "daily" | "weekly" } }.
  -- A missing key falls back to the defaults in src/lib/integrations/events.ts.
  routing jsonb not null default '{}'::jsonb,
  secrets_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists integrations_user_idx on integrations(user_id);

alter table integrations enable row level security;

-- Every delivery attempt chain is logged: event, destination, status, time.
-- The card reads the latest row to show the last success or failure, and the
-- retry worker reads queued rows whose next_attempt_at has passed.
create table if not exists integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_id uuid not null references integrations(id) on delete cascade,
  provider text not null,
  event text not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  -- Rendered message data (no secrets). Rebuilt into a provider-specific
  -- payload at send time.
  payload jsonb not null,
  -- True for rows released as part of a daily/weekly digest.
  digest boolean not null default false,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists integration_deliveries_due_idx
  on integration_deliveries(status, next_attempt_at)
  where status in ('queued', 'sending');
create index if not exists integration_deliveries_integration_idx
  on integration_deliveries(integration_id, created_at desc);

alter table integration_deliveries enable row level security;
