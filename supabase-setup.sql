-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- It creates the table that holds coaches' saved sessions.

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  -- Which coach the session belongs to. Filled in automatically from whoever is logged in.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  -- The drills in the session, exactly as the session planner stores them
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions (user_id);

-- Row Level Security: each coach can only see and change their OWN sessions.
-- Without this, anyone with the site's public key could read everyone's sessions.
alter table public.sessions enable row level security;

create policy "Coaches can view their own sessions"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Coaches can add their own sessions"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Coaches can update their own sessions"
  on public.sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Coaches can delete their own sessions"
  on public.sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Let logged-in users reach the table through the API (the policies above still apply)
grant select, insert, update, delete on public.sessions to authenticated;
