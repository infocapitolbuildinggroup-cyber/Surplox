-- Surplox MVP: schema + security (RLS) + helpers
-- Run in Supabase SQL editor.

create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Trades
create table if not exists public.trades (
  id bigserial primary key,
  slug text unique not null,
  name text not null
);

-- Admin list
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ZIP lookup
create table if not exists public.zipcodes (
  zip text primary key,
  city text,
  state text,
  lat double precision,
  lon double precision,
  point geography(point, 4326) generated always as
    (st_setsrid(st_makepoint(lon, lat), 4326)::geography) stored
);

-- Profiles (public-ish fields; no phone/email here)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  trade_id bigint references public.trades(id),
  home_zip text,
  home_point geography(point, 4326),
  travel_radius_miles int default 50,
  crew_size int,
  equipment_tags text[],
  bio text,
  created_at timestamptz default now()
);

-- Contact info (admin-only)
create table if not exists public.contact_private (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  email text,
  city text,
  notes text,
  verified_level int default 0,
  created_at timestamptz default now()
);

-- Posts (radius-targeted)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  trade_id bigint references public.trades(id),
  title text not null,
  body text not null,
  center_zip text not null,
  center_point geography(point, 4326) not null,
  radius_miles int not null default 50,
  created_at timestamptz default now()
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Votes
create table if not exists public.votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  voter_id uuid not null references public.profiles(user_id) on delete cascade,
  value int not null check (value in (-1, 1)),
  created_at timestamptz default now(),
  primary key (post_id, voter_id)
);

create index if not exists posts_trade on public.posts(trade_id);
create index if not exists posts_geo on public.posts using gist(center_point);
create index if not exists profiles_geo on public.profiles using gist(home_point);

-- Seed trades (edit as you wish)
insert into public.trades (slug, name) values
  ('concrete', 'Concrete & Flatwork'),
  ('welding', 'Welding & Fabrication'),
  ('fencing', 'Fencing & Gates'),
  ('sitework', 'Site Work / Excavation'),
  ('framing', 'Framing / Carpentry'),
  ('roofing', 'Roofing'),
  ('masonry', 'Masonry'),
  ('drywall', 'Drywall'),
  ('painting', 'Painting'),
  ('electrical', 'Electrical'),
  ('plumbing', 'Plumbing'),
  ('hvac', 'HVAC')
on conflict (slug) do nothing;

-- --- RLS ---
alter table public.admin_users enable row level security;
alter table public.zipcodes enable row level security;
alter table public.profiles enable row level security;
alter table public.contact_private enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

-- zipcodes: allow authenticated users to read (needed for UI lookup)
create policy if not exists "zipcodes_select_auth"
on public.zipcodes for select
to authenticated
using (true);

-- trades: allow all authenticated to read
alter table public.trades enable row level security;
create policy if not exists "trades_select_auth"
on public.trades for select
to authenticated
using (true);

-- profiles: members can read profiles and edit their own
create policy if not exists "profiles_select_auth"
on public.profiles for select
to authenticated
using (true);

create policy if not exists "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- contact_private: only admins can select; members can insert/update their own
create policy if not exists "contact_private_admin_select"
on public.contact_private for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy if not exists "contact_private_insert_own"
on public.contact_private for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "contact_private_update_own"
on public.contact_private for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- posts/comments/votes: authenticated read; write own
create policy if not exists "posts_select_auth"
on public.posts for select
to authenticated
using (true);

create policy if not exists "posts_insert_own"
on public.posts for insert
to authenticated
with check (auth.uid() = author_id);

create policy if not exists "posts_update_own"
on public.posts for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy if not exists "comments_select_auth"
on public.comments for select
to authenticated
using (true);

create policy if not exists "comments_insert_own"
on public.comments for insert
to authenticated
with check (auth.uid() = author_id);

create policy if not exists "votes_select_auth"
on public.votes for select
to authenticated
using (true);

create policy if not exists "votes_insert_own"
on public.votes for insert
to authenticated
with check (auth.uid() = voter_id);

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

-- Helper: set profile home_point by ZIP
create or replace function public.set_my_home_zip(p_zip text)
returns void
language plpgsql
security invoker
as $$
declare
  z public.zipcodes%rowtype;
begin
  select * into z from public.zipcodes where zip = p_zip;
  if not found then
    raise exception 'ZIP not found: %', p_zip;
  end if;

  update public.profiles
     set home_zip = p_zip,
         home_point = z.point
   where user_id = auth.uid();
end;
$$;

-- Helper: get posts near me (distance filter using post radius)
create or replace function public.get_posts_near_me(p_limit int default 50, p_offset int default 0)
returns table(
  id uuid,
  title text,
  body text,
  trade_id bigint,
  trade_name text,
  center_zip text,
  radius_miles int,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  score int,
  comment_count int
)
language sql
stable
as $$
  with me as (
    select user_id, home_point from public.profiles where user_id = auth.uid()
  ),
  base as (
    select p.*,
      t.name as trade_name,
      pr.display_name as author_name
    from public.posts p
    join me on true
    left join public.trades t on t.id = p.trade_id
    join public.profiles pr on pr.user_id = p.author_id
    where me.home_point is not null
      and st_dwithin(me.home_point, p.center_point, (p.radius_miles * 1609.34))
  ),
  scores as (
    select post_id, coalesce(sum(value),0)::int as score
    from public.votes
    group by post_id
  ),
  comments_ct as (
    select post_id, count(*)::int as comment_count
    from public.comments
    group by post_id
  )
  select
    b.id, b.title, b.body, b.trade_id, b.trade_name, b.center_zip, b.radius_miles,
    b.created_at, b.author_id, b.author_name,
    coalesce(s.score,0) as score,
    coalesce(c.comment_count,0) as comment_count
  from base b
  left join scores s on s.post_id = b.id
  left join comments_ct c on c.post_id = b.id
  order by b.created_at desc
  limit p_limit offset p_offset;
$$;

-- Helper: search posts (within my radius filter) by text + optional trade
create or replace function public.search_posts_near_me(p_q text, p_trade_id bigint default null, p_limit int default 50, p_offset int default 0)
returns table(
  id uuid,
  title text,
  body text,
  trade_id bigint,
  trade_name text,
  center_zip text,
  radius_miles int,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  score int,
  comment_count int
)
language sql
stable
as $$
  with me as (
    select user_id, home_point from public.profiles where user_id = auth.uid()
  ),
  base as (
    select p.*,
      t.name as trade_name,
      pr.display_name as author_name
    from public.posts p
    join me on true
    left join public.trades t on t.id = p.trade_id
    join public.profiles pr on pr.user_id = p.author_id
    where me.home_point is not null
      and st_dwithin(me.home_point, p.center_point, (p.radius_miles * 1609.34))
      and (p_trade_id is null or p.trade_id = p_trade_id)
      and (p.title ilike ('%'||p_q||'%') or p.body ilike ('%'||p_q||'%'))
  ),
  scores as (
    select post_id, coalesce(sum(value),0)::int as score
    from public.votes
    group by post_id
  ),
  comments_ct as (
    select post_id, count(*)::int as comment_count
    from public.comments
    group by post_id
  )
  select
    b.id, b.title, b.body, b.trade_id, b.trade_name, b.center_zip, b.radius_miles,
    b.created_at, b.author_id, b.author_name,
    coalesce(s.score,0) as score,
    coalesce(c.comment_count,0) as comment_count
  from base b
  left join scores s on s.post_id = b.id
  left join comments_ct c on c.post_id = b.id
  order by b.created_at desc
  limit p_limit offset p_offset;
$$;
