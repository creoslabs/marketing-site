-- Signal: track a re-uploaded, revised creative as an iteration of an
-- existing asset rather than a brand-new unrelated one. A simple
-- predecessor link (like a linked list) rather than a full version-tree
-- model — "what did I just try before this" is the useful question, not
-- an arbitrary branching history.

alter table signal_assets add column if not exists revision_of uuid references signal_assets(id) on delete set null;

create index if not exists signal_assets_revision_of_idx on signal_assets(revision_of);
