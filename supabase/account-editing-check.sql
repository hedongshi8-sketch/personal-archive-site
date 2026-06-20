-- Read-only checks for account login, owner editing, signed-in comments,
-- public owner updates, editable site settings, and profile avatars.

select
  'site_settings editable columns' as check_name,
  case
    when count(*) = 9 then 'ok'
    else 'missing'
  end as status,
  string_agg(column_name, ', ' order by column_name) as observed
from information_schema.columns
where table_schema = 'public'
  and table_name = 'site_settings'
  and column_name in (
    'brand_name',
    'brand_subtitle',
    'hero_title',
    'hero_description',
    'site_logo_url',
    'site_avatar_url',
    'hero_cover_url',
    'background_music_url',
    'background_music_title',
    'background_music_enabled'
  );

select
  'profile username/avatar columns' as check_name,
  case
    when count(*) = 2 then 'ok'
    else 'missing'
  end as status,
  string_agg(column_name, ', ' order by column_name) as observed
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('username', 'avatar_url');

select
  'comments require profile author' as check_name,
  case
    when count(*) = 2 then 'ok'
    else 'missing'
  end as status,
  string_agg(column_name, ', ' order by column_name) as observed
from information_schema.columns
where table_schema = 'public'
  and table_name = 'public_comments'
  and column_name in ('author_id', 'avatar_url');

select
  'owner post visibility enum' as check_name,
  case
    when bool_or(enumlabel = 'public') and bool_or(enumlabel = 'draft') and not bool_or(enumlabel = 'private') then 'ok'
    else 'missing'
  end as status,
  string_agg(enumlabel, ', ' order by enumsortorder) as observed
from pg_enum
where enumtypid = 'public.owner_post_visibility'::regtype;

select
  'site owner account' as check_name,
  case
    when exists (
      select 1
      from public.profiles
      where email = 'hedongshi8@gmail.com'
        and role = 'owner'
    ) then 'ok'
    when exists (
      select 1
      from public.profiles
      where email = 'hedongshi8@gmail.com'
    ) then 'registered but not owner'
    else 'missing account'
  end as status,
  coalesce(
    (
      select id::text || ' / ' || email || ' / ' || role::text
      from public.profiles
      where email = 'hedongshi8@gmail.com'
      limit 1
    ),
    'Register or log in once with this email, then rerun supabase/set-owner.sql.'
  ) as observed;

select
  'expected RLS policies' as check_name,
  case
    when count(*) = 9 then 'ok'
    else 'missing'
  end as status,
  string_agg(policyname, ', ' order by policyname) as observed
from pg_policies
where schemaname = 'public'
  and policyname in (
    'profiles can read own profile',
    'public profiles are readable for signed in users',
    'approved comments are public',
    'signed in users can create comments',
    'owner can moderate comments',
    'owner can delete comments',
    'owner can manage public updates',
    'published owner posts are public',
    'owner can manage site settings'
  );

select
  'public portfolio item count' as check_name,
  case
    when count(*) = 17 then 'ok'
    else 'check'
  end as status,
  count(*)::text as observed
from public.portfolio_items
where published = true;

select
  'internal portfolio items hidden' as check_name,
  case
    when count(*) = 0 then 'ok'
    else 'visible'
  end as status,
  coalesce(string_agg(title, ', ' order by title), 'none') as observed
from public.portfolio_items
where published = true
  and (
    title in ('简历 + 作品集合并版', '系统策划投递说明')
    or public_url like '%待替换个人信息%'
    or public_url like '%投递说明_只看这个%'
  );

select
  'public storage bucket' as check_name,
  case
    when exists (
      select 1
      from storage.buckets
      where id = 'portfolio-public'
        and public = true
    ) then 'ok'
    else 'missing'
  end as status,
  coalesce(
    (
      select id || ' / public=' || public::text
      from storage.buckets
      where id = 'portfolio-public'
    ),
    'portfolio-public bucket is missing'
  ) as observed;
