-- Run this once in Supabase (SQL Editor -> New query -> paste -> Run)
-- if your drills table was created before creator names were added.
-- It adds the name shown as "Created by ..." on each drill.
-- Empty (null) means the coach chose to post anonymously.

alter table public.drills
  add column if not exists author_name text check (char_length(author_name) between 1 and 60);
