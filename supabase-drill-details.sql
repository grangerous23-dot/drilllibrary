-- Run this once in Supabase (SQL Editor -> New query -> paste -> Run)
-- if your drills table was made before these were added. Safe to run more than once.

-- The name shown as "Created by ..." (empty means the coach posted anonymously)
alter table public.drills
  add column if not exists author_name text check (char_length(author_name) between 1 and 60);

-- Setup, numbered steps and coaching points from the Add a drill form
alter table public.drills
  add column if not exists setup text check (char_length(setup) <= 600);

alter table public.drills
  add column if not exists steps jsonb
  check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) <= 15);

alter table public.drills
  add column if not exists coaching_points jsonb
  check (jsonb_typeof(coaching_points) = 'array' and jsonb_array_length(coaching_points) <= 15);
