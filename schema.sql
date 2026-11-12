-- MY QUEEN — owner-only cloud data and private photo storage.
-- Run this entire script in Supabase SQL Editor while signed in as project owner.

create table if not exists public.app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null,
  state_value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key)
);

alter table public.app_state enable row level security;
revoke all on public.app_state from anon;
grant select, insert, update, delete on public.app_state to authenticated;

drop policy if exists "owner reads own app state" on public.app_state;
drop policy if exists "owner inserts own app state" on public.app_state;
drop policy if exists "owner updates own app state" on public.app_state;
drop policy if exists "owner deletes own app state" on public.app_state;
create policy "owner reads own app state" on public.app_state for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts own app state" on public.app_state for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates own app state" on public.app_state for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own app state" on public.app_state for delete to authenticated using (auth.uid() = user_id);

-- A private bucket. Image paths must begin with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('queen-private', 'queen-private', false, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "owner reads private photos" on storage.objects;
drop policy if exists "owner uploads private photos" on storage.objects;
drop policy if exists "owner deletes private photos" on storage.objects;
create policy "owner reads private photos" on storage.objects for select to authenticated
using (bucket_id = 'queen-private' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner uploads private photos" on storage.objects for insert to authenticated
with check (bucket_id = 'queen-private' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes private photos" on storage.objects for delete to authenticated
using (bucket_id = 'queen-private' and (storage.foldername(name))[1] = auth.uid()::text);
