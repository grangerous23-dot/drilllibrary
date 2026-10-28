-- Run this once in your Supabase project (after supabase-setup.sql):
-- SQL Editor -> New query -> paste -> Run.
-- It creates the table for drills coaches upload, and the storage space for their photos and videos.

-- ---------- Drills table ----------

create table public.drills (
  id uuid primary key default gen_random_uuid(),
  -- Which coach uploaded it. Filled in automatically from whoever is logged in.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null check (char_length(description) between 1 and 3000),
  category text not null check (category in ('individual', 'group')),
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  phase text check (phase in ('warmup', 'cooldown')),
  player_count int check (player_count between 1 and 50),
  skill text not null check (char_length(skill) between 1 and 300),
  equipment text check (char_length(equipment) <= 200),
  -- The name shown as the drill's creator. Empty (null) means the coach posted anonymously.
  author_name text check (char_length(author_name) between 1 and 60),
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  media_path text,
  -- The animation (pieces and steps), as built in the animator
  animation jsonb check (pg_column_size(animation) < 200000),
  created_at timestamptz not null default now()
);

create index drills_user_id_idx on public.drills (user_id);

-- Row Level Security: everyone can see drills, but coaches can only add, change
-- and delete their OWN drills.
alter table public.drills enable row level security;

create policy "Anyone can view drills"
  on public.drills for select to anon, authenticated
  using (true);

create policy "Coaches can add their own drills"
  on public.drills for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Coaches can update their own drills"
  on public.drills for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Coaches can delete their own drills"
  on public.drills for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.drills to anon, authenticated;
grant insert, update, delete on public.drills to authenticated;

-- ---------- Storage for photos and videos ----------

-- A public bucket: anyone can view the files, so the drill pages can show them.
-- Only images and videos, up to 20 MB each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'drill-media', 'drill-media', true, 20971520,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Each coach uploads into a folder named after their user id, and can only touch their own folder
create policy "Coaches can upload drill media to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'drill-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Coaches can see their own drill media"
  on storage.objects for select to authenticated
  using (bucket_id = 'drill-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Coaches can delete their own drill media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'drill-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
