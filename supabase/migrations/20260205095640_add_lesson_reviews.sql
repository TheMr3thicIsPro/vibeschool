-- Migration: Add lesson_reviews table with RLS and indexes
-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- Create table
create table if not exists public.lesson_reviews (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null,
  user_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_reviews_lesson_id_fkey
    foreign key (lesson_id) references public.lessons(id) on delete cascade,
  constraint lesson_reviews_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint lesson_reviews_unique_user_per_lesson unique (lesson_id, user_id)
);

-- Indexes for performance
create index if not exists lesson_reviews_lesson_id_idx on public.lesson_reviews (lesson_id);
create index if not exists lesson_reviews_user_id_idx on public.lesson_reviews (user_id);
create index if not exists lesson_reviews_rating_idx on public.lesson_reviews (rating);
create index if not exists lesson_reviews_created_at_idx on public.lesson_reviews (created_at desc);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger lesson_reviews_set_updated_at
before update on public.lesson_reviews
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.lesson_reviews enable row level security;

-- Policies
-- Allow authenticated users to read reviews (username masking handled at UI level for anonymous)
create policy if not exists lesson_reviews_select_authenticated
on public.lesson_reviews
for select
to authenticated
using (true);

-- Allow users to insert their own review
create policy if not exists lesson_reviews_insert_self
on public.lesson_reviews
for insert
to authenticated
with check (
  user_id = auth.uid() and rating between 1 and 5
);

-- Allow users to update their own review
create policy if not exists lesson_reviews_update_self
on public.lesson_reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Optional: allow delete of own review (not used currently)
create policy if not exists lesson_reviews_delete_self
on public.lesson_reviews
for delete
to authenticated
using (user_id = auth.uid());