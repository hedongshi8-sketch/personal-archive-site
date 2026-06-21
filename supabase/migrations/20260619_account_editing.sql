-- Upgrade the site from magic-link owner-only auth to account profiles,
-- signed-in comments, public owner updates, and editable site copy.
-- Safe to run after the original supabase/schema.sql.

alter table public.profiles
  add column if not exists username text not null default '',
  add column if not exists avatar_url text;

update public.profiles
set username = split_part(email, '@', 1)
where username = '';

alter table public.public_comments
  add column if not exists author_id uuid references public.profiles(id) on delete set null,
  add column if not exists avatar_url text;

alter table public.owner_posts enable row level security;
alter table public.public_comments enable row level security;
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;

alter type public.asset_kind add value if not exists 'site-avatar';
alter type public.asset_kind add value if not exists 'site-cover';

drop policy if exists "owner can manage private posts" on public.owner_posts;
drop policy if exists "owner can manage public updates" on public.owner_posts;
drop policy if exists "published owner posts are public" on public.owner_posts;

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'owner_post_visibility'
      and e.enumlabel = 'private'
  ) or not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'owner_post_visibility'
      and e.enumlabel = 'public'
  ) then
    drop type if exists public.owner_post_visibility_next;
    create type public.owner_post_visibility_next as enum ('public', 'draft');

    alter table public.owner_posts
      alter column visibility drop default;

    alter table public.owner_posts
      alter column visibility type public.owner_post_visibility_next
      using (
        case
          when visibility::text = 'private' then 'public'
          when visibility::text = 'public' then 'public'
          when visibility::text = 'draft' then 'draft'
          else 'draft'
        end
      )::public.owner_post_visibility_next;

    drop type public.owner_post_visibility;
    alter type public.owner_post_visibility_next rename to owner_post_visibility;
  end if;
end $$;

alter table public.owner_posts
  alter column visibility set default 'public';

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists public_comments_author_id_idx
on public.public_comments(author_id)
where author_id is not null;

alter table public.site_settings
  add column if not exists brand_name text not null default 'LinX',
  add column if not exists brand_subtitle text not null default '游戏策划 / 关卡设计',
  add column if not exists hero_title text not null default '这里不只是一座策划档案馆。',
  add column if not exists hero_description text not null default '这是我的个人网站：作品、Demo、音乐、图片、书摘、灵感和阶段性更新都会慢慢放进来。HR 可以快速看作品，朋友也可以登录留言。',
  add column if not exists site_avatar_url text,
  add column if not exists hero_cover_url text,
  add column if not exists background_music_url text,
  add column if not exists background_music_title text,
  add column if not exists background_music_enabled boolean not null default false;

insert into public.site_settings (id)
values ('main')
on conflict (id) do nothing;

update public.site_settings
set
  brand_name = coalesce(nullif(brand_name, ''), 'LinX'),
  brand_subtitle = coalesce(nullif(brand_subtitle, ''), '游戏策划 / 关卡设计'),
  hero_title = coalesce(nullif(hero_title, ''), '这里不只是一座策划档案馆。'),
  hero_description = coalesce(nullif(hero_description, ''), '这是我的个人网站：作品、Demo、音乐、图片、书摘、灵感和阶段性更新都会慢慢放进来。HR 可以快速看作品，朋友也可以登录留言。'),
  background_music_enabled = coalesce(background_music_enabled, false)
where id = 'main';

alter table public.site_settings
  alter column brand_name set default 'LinX',
  alter column brand_name set not null,
  alter column brand_subtitle set default '游戏策划 / 关卡设计',
  alter column brand_subtitle set not null,
  alter column hero_title set default '这里不只是一座策划档案馆。',
  alter column hero_title set not null,
  alter column hero_description set default '这是我的个人网站：作品、Demo、音乐、图片、书摘、灵感和阶段性更新都会慢慢放进来。HR 可以快速看作品，朋友也可以登录留言。',
  alter column hero_description set not null,
  alter column background_music_enabled set default false,
  alter column background_music_enabled set not null;

insert into storage.buckets (id, name, public)
values ('portfolio-public', 'portfolio-public', true)
on conflict (id) do update set public = excluded.public;

update storage.buckets
set file_size_limit = 104857600
where id = 'portfolio-public';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email, ''), '@', 1), '访客'),
    'visitor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_own_profile(next_username text, next_avatar_url text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required.';
  end if;

  update public.profiles
  set
    username = left(trim(coalesce(next_username, '')), 40),
    avatar_url = nullif(trim(coalesce(next_avatar_url, '')), '')
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found.';
  end if;

  return updated_profile;
end;
$$;

drop policy if exists "visitors can create comments" on public.public_comments;
drop policy if exists "approved comments are public" on public.public_comments;
create policy "approved comments are public"
on public.public_comments for select
using (approved = true);

drop policy if exists "signed in users can create comments" on public.public_comments;
create policy "signed in users can create comments"
on public.public_comments for insert
with check (
  (select auth.uid()) = author_id
  and length(author) between 1 and 80
  and length(body) between 1 and 1200
  and honeypot = ''
  and client_elapsed_ms >= 2000
);

drop policy if exists "owner can moderate comments" on public.public_comments;
create policy "owner can moderate comments"
on public.public_comments for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

drop policy if exists "owner can delete comments" on public.public_comments;
create policy "owner can delete comments"
on public.public_comments for delete
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

drop policy if exists "profiles can read own profile" on public.profiles;
create policy "profiles can read own profile"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "public profiles are readable for signed in users" on public.profiles;
create policy "public profiles are readable for signed in users"
on public.profiles for select
using ((select auth.uid()) is not null);

create policy "owner can manage public updates"
on public.owner_posts for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

drop policy if exists "published owner posts are public" on public.owner_posts;
create policy "published owner posts are public"
on public.owner_posts for select
using (visibility = 'public');

drop policy if exists "site settings are public" on public.site_settings;
create policy "site settings are public"
on public.site_settings for select
using (id = 'main');

drop policy if exists "owner can manage site settings" on public.site_settings;
create policy "owner can manage site settings"
on public.site_settings for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
)
with check (
  id = 'main'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

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
