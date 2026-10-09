-- Early-access requests from the website's "Request access" form.
-- RLS is on with no policies: only server code (service role) writes or reads it.
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_idx on waitlist (lower(email));

alter table waitlist enable row level security;
