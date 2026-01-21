-- Migration to fix duplicate profile rows and prevent future duplicates

-- 1) First, check for existing duplicates
select 'Checking for duplicate profiles:' as info;
select user_id, count(*) as duplicate_count
from public.profiles
group by user_id
having count(*) > 1;

-- 2) If duplicates are found, you'll need to manually resolve them
-- This query shows which duplicates exist and their data
select 'Duplicate profiles found (manual resolution required):' as warning;
select p1.id, p1.user_id, p1.role, p1.plan, p1.created_at
from public.profiles p1
join public.profiles p2 on p1.user_id = p2.user_id and p1.id != p2.id
order by p1.user_id, p1.created_at;

-- 3) Add unique constraint to prevent future duplicates
-- This will fail if duplicates already exist, so you must resolve duplicates first
alter table public.profiles
add constraint profiles_user_id_unique unique (user_id);

-- 4) Add additional helpful indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_plan on public.profiles(plan);

-- 5) Update RLS policies to be more explicit about role access
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6) Create a helper function for safe role updates
create or replace function public.update_user_role_safe(p_user_id uuid, p_new_role text)
returns public.profiles
language plpgsql
as $$
declare 
  v_profile public.profiles;
  v_count integer;
begin
  -- Check for duplicates first
  select count(*) into v_count
  from public.profiles
  where user_id = p_user_id;
  
  if v_count = 0 then
    raise exception 'No profile found for user_id %', p_user_id;
  elsif v_count > 1 then
    raise exception 'Multiple profiles found for user_id %. Resolve duplicates first.', p_user_id;
  end if;
  
  -- Perform the update
  update public.profiles
  set role = p_new_role,
      updated_at = now()
  where user_id = p_user_id
  returning * into v_profile;
  
  return v_profile;
end;
$$;

-- 7) Create a helper function for safe plan updates
create or replace function public.update_user_plan_safe(p_user_id uuid, p_new_plan text)
returns public.profiles
language plpgsql
as $$
declare 
  v_profile public.profiles;
  v_count integer;
begin
  -- Check for duplicates first
  select count(*) into v_count
  from public.profiles
  where user_id = p_user_id;
  
  if v_count = 0 then
    raise exception 'No profile found for user_id %', p_user_id;
  elsif v_count > 1 then
    raise exception 'Multiple profiles found for user_id %. Resolve duplicates first.', p_user_id;
  end if;
  
  -- Perform the update
  update public.profiles
  set plan = p_new_plan,
      updated_at = now()
  where user_id = p_user_id
  returning * into v_profile;
  
  return v_profile;
end;
$$;