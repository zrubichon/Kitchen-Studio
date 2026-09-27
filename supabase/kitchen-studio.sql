-- Kitchen Studio cloud state schema
-- Run on the dedicated Kitchen Studio Supabase project.

create table if not exists public.kitchen_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kitchen_user_state enable row level security;

grant select, insert, update, delete on table public.kitchen_user_state to authenticated;

drop policy if exists "kitchen_state_select_own" on public.kitchen_user_state;
create policy "kitchen_state_select_own"
on public.kitchen_user_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "kitchen_state_insert_own" on public.kitchen_user_state;
create policy "kitchen_state_insert_own"
on public.kitchen_user_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "kitchen_state_update_own" on public.kitchen_user_state;
create policy "kitchen_state_update_own"
on public.kitchen_user_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "kitchen_state_delete_own" on public.kitchen_user_state;
create policy "kitchen_state_delete_own"
on public.kitchen_user_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Manual-page images belong in a PRIVATE Storage bucket named "manual-pages".
-- Create that bucket in Storage, then these policies keep every user's pages private.
drop policy if exists "manual_pages_insert_own" on storage.objects;
create policy "manual_pages_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'manual-pages'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "manual_pages_select_own" on storage.objects;
create policy "manual_pages_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'manual-pages'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "manual_pages_update_own" on storage.objects;
create policy "manual_pages_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'manual-pages'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'manual-pages'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "manual_pages_delete_own" on storage.objects;
create policy "manual_pages_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'manual-pages'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
