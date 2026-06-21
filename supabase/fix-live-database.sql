-- Run this once in Supabase SQL Editor.
-- Paste this SQL content into the editor. Do not paste the local file path.
-- It fixes the current live database for owner uploads, the logo editor, and hidden internal portfolio assembly files.

alter type public.asset_kind add value if not exists 'site-logo';

alter table public.site_settings
  add column if not exists site_logo_url text;

insert into storage.buckets (id, name, public)
values ('portfolio-public', 'portfolio-public', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

update storage.buckets
set file_size_limit = 262144000
where id = 'portfolio-public';

-- This bucket limit does not override Supabase's project-level Global file size limit.
-- On Free projects that global limit is still capped at 50 MB.

drop policy if exists "public portfolio storage is readable" on storage.objects;
create policy "public portfolio storage is readable"
on storage.objects for select
using (bucket_id = 'portfolio-public');

drop policy if exists "owner can upload portfolio storage" on storage.objects;
create policy "owner can upload portfolio storage"
on storage.objects for insert
with check (
  bucket_id = 'portfolio-public'
  and (
    name like 'profile-avatars/' || auth.uid()::text || '/%'
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'owner'
    )
  )
);

drop policy if exists "owner can update portfolio storage" on storage.objects;
create policy "owner can update portfolio storage"
on storage.objects for update
using (
  bucket_id = 'portfolio-public'
  and (
    name like 'profile-avatars/' || auth.uid()::text || '/%'
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'owner'
    )
  )
)
with check (
  bucket_id = 'portfolio-public'
  and (
    name like 'profile-avatars/' || auth.uid()::text || '/%'
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'owner'
    )
  )
);

drop policy if exists "owner can delete portfolio storage" on storage.objects;
create policy "owner can delete portfolio storage"
on storage.objects for delete
using (
  bucket_id = 'portfolio-public'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

update public.portfolio_items
set
  published = false,
  featured = false,
  updated_at = now()
where
  id in (
    '70cf8c1d-3fae-0389-4fac-f458ee4a1247',
    'd9caa4e3-bda6-4d1b-9168-89acc6b9a584'
  )
  or preview_url like '%system-planner-submission-note%';

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_settings'
      and column_name = 'site_logo_url'
  ) as site_logo_url_ready,
  exists (
    select 1
    from storage.buckets
    where id = 'portfolio-public'
      and public = true
  ) as public_bucket_ready,
  exists (
    select 1
    from storage.buckets
    where id = 'portfolio-public'
      and coalesce(file_size_limit, 0) >= 262144000
  ) as public_bucket_limit_sql_ready,
  exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'owner can upload portfolio storage'
  ) as owner_storage_upload_policy_ready,
  (
    select count(*)
    from public.portfolio_items
    where published = true
      and (
        id in (
          '70cf8c1d-3fae-0389-4fac-f458ee4a1247',
          'd9caa4e3-bda6-4d1b-9168-89acc6b9a584'
        )
        or preview_url like '%system-planner-submission-note%'
      )
  ) as visible_internal_items;
