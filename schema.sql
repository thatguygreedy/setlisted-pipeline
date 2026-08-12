-- Run this once against your Supabase / Neon Postgres database
-- (Supabase: paste into SQL Editor. Neon: use their SQL console or psql.)

create table if not exists stations (
  id text primary key,               -- e.g. 'diplosrevolution' (xmplaylist station slug)
  dj text not null,                  -- e.g. 'Diplo'
  show text not null,                -- e.g. "Diplo's Revolution"
  network text not null default 'SiriusXM',
  active boolean not null default true
);

create table if not exists tracks (
  id bigserial primary key,
  station_id text not null references stations(id),
  title text not null,
  artist text not null,
  genre text,                        -- filled in by the iTunes genre lookup, nullable
  played_at timestamptz not null,
  dedupe_key text not null unique,   -- station_id + title + artist + played_at, prevents double inserts
  inserted_at timestamptz not null default now()
);

create index if not exists idx_tracks_station_played on tracks (station_id, played_at desc);
create index if not exists idx_tracks_genre on tracks (genre);

-- Seed with the stations from the mock UI. Add/remove rows as you track more shows.
insert into stations (id, dj, show, network) values
  ('diplosrevolution', 'Diplo', 'Diplo''s Revolution', 'SiriusXM'),
  ('tiestoprismatic', 'Tiësto', 'Prismatic', 'SiriusXM')
on conflict (id) do nothing;
