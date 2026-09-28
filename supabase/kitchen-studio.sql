-- Kitchen Studio cloud state schema
-- Dedicated Supabase backend for Mise / Kitchen Studio.

create table if not exists public.kitchen_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kitchen_user_state enable row level security;

revoke all on table public.kitchen_user_state from anon;
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

-- Private bucket for appliance-manual photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'manual-pages',
  'manual-pages',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
