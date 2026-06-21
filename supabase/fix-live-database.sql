-- Run this once in Supabase SQL Editor.
-- Paste this SQL content into the editor. Do not paste the local file path.
-- It fixes the current live database for the logo editor and hides internal portfolio assembly files.

alter type public.asset_kind add value if not exists 'site-logo';

alter table public.site_settings
  add column if not exists site_logo_url text;

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
