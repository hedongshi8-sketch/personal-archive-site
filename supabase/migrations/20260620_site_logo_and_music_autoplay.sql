-- Add a dedicated site logo field for the sidebar/brand mark editor.

alter type public.asset_kind add value if not exists 'site-logo';

alter table public.site_settings
  add column if not exists site_logo_url text;
