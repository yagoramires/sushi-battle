-- Sushi Battle schema (applied to Supabase project sushi-battle / ybmaollqxkdmtabzpynh)
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  rodizio_price int not null,            -- cents
  menu text not null default 'rodizio',  -- 'rodizio' | 'executivo'
  host_id uuid references players(id) on delete set null, -- who can finish the table
  ended_at timestamptz,                  -- set when the host finishes; flips everyone to the result page
  created_at timestamptz default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  pieces int not null default 0,
  value_cents int not null default 0,
  counts jsonb not null default '{}',
  joined_at timestamptz default now()
);

create index players_room_idx on players(room_id);

alter table rooms enable row level security;
alter table players enable row level security;

-- ponytail: room code is the only gate; anon can read/write. Tighten later if abused.
create policy rooms_all on rooms for all using (true) with check (true);
create policy players_all on players for all using (true) with check (true);

-- live leaderboard: broadcast player row changes; rooms broadcasts the finish
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rooms;

-- Note: host_id/ended_at were added later via migration sushi_battle_finish_and_host:
--   alter table rooms add column host_id uuid references players(id) on delete set null;
--   alter table rooms add column ended_at timestamptz;
--   alter publication supabase_realtime add table rooms;
