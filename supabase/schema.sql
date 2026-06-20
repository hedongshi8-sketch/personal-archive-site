create type public.site_role as enum ('owner', 'visitor');
create type public.owner_post_visibility as enum ('public', 'draft');
create type public.asset_kind as enum (
  'design-doc',
  'game-demo',
  'music-cover',
  'gallery-image',
  'music-audio',
  'site-logo',
  'site-cover',
  'site-avatar',
  'reading-cover'
);
create type public.reading_note_kind as enum ('book', 'video');
create type public.portfolio_kind as enum (
  'pdf',
  'excel',
  'docx',
  'html-prototype',
  'image',
  'archive',
  'markdown',
  'text'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null default '',
  avatar_url text,
  role public.site_role not null default 'visitor',
  created_at timestamptz not null default now()
);

create table public.owner_posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  visibility public.owner_post_visibility not null default 'public',
  created_at timestamptz not null default now()
);

create table public.public_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author text not null,
  avatar_url text,
  body text not null,
  likes integer not null default 0,
  approved boolean not null default true,
  client_elapsed_ms integer not null default 0,
  honeypot text not null default '',
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  kind public.asset_kind not null,
  title text not null,
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now()
);

create table public.portfolio_projects (
  id text primary key,
  title text not null,
  summary text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.portfolio_projects(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  kind public.portfolio_kind not null,
  summary text not null default '',
  tags text[] not null default '{}',
  public_url text not null,
  preview_url text,
  thumbnail_url text,
  source_path text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_files (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.portfolio_items(id) on delete cascade,
  title text not null,
  kind public.portfolio_kind not null,
  storage_path text not null,
  public_url text,
  byte_size bigint,
  created_at timestamptz not null default now()
);

create table public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  artist text not null default '',
  mood text not null default '',
  duration text,
  audio_url text not null,
  cover_url text,
  is_background boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  category text not null default '概念',
  description text,
  image_url text not null,
  is_cover boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reading_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  kind public.reading_note_kind not null,
  title text not null,
  creator text not null,
  source_url text,
  cover_url text,
  quote text not null,
  reflection text not null,
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id text primary key default 'main',
  owner_id uuid references public.profiles(id) on delete set null,
  brand_name text not null default 'LinX',
  brand_subtitle text not null default '游戏策划 / 关卡设计',
  hero_title text not null default '这里不只是一座策划档案馆。',
  hero_description text not null default '这是我的个人网站：作品、Demo、音乐、图片、书摘、灵感和阶段性更新都会慢慢放进来。HR 可以快速看作品，朋友也可以登录留言。',
  site_logo_url text,
  site_avatar_url text,
  hero_cover_url text,
  background_music_url text,
  background_music_title text,
  background_music_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'main')
);

alter table public.profiles enable row level security;
alter table public.owner_posts enable row level security;
alter table public.public_comments enable row level security;
alter table public.assets enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.portfolio_files enable row level security;
alter table public.music_tracks enable row level security;
alter table public.gallery_items enable row level security;
alter table public.reading_notes enable row level security;
alter table public.site_settings enable row level security;

create index portfolio_items_project_id_idx on public.portfolio_items(project_id);
create index portfolio_items_kind_idx on public.portfolio_items(kind);
create index portfolio_items_published_updated_idx on public.portfolio_items(published, updated_at desc);
create index portfolio_files_item_id_idx on public.portfolio_files(item_id);
create index profiles_role_idx on public.profiles(role);
create index public_comments_author_id_idx on public.public_comments(author_id) where author_id is not null;
create index public_comments_approved_created_idx on public.public_comments(approved, created_at desc);
create index music_tracks_published_created_idx on public.music_tracks(published, created_at desc);
create index gallery_items_published_created_idx on public.gallery_items(published, created_at desc);
create index reading_notes_published_created_idx on public.reading_notes(published, created_at desc);

insert into storage.buckets (id, name, public)
values ('portfolio-public', 'portfolio-public', true)
on conflict (id) do update set public = excluded.public;

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

create or replace function public.increment_comment_likes(comment_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.public_comments
  set likes = likes + 1
  where id = comment_id
    and approved = true
  returning likes;
$$;

create policy "profiles can read own profile"
on public.profiles for select
using (auth.uid() = id);

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

create policy "published owner posts are public"
on public.owner_posts for select
using (visibility = 'public');

create policy "approved comments are public"
on public.public_comments for select
using (approved = true);

create policy "signed in users can create comments"
on public.public_comments for insert
with check (
  (select auth.uid()) = author_id
  and
  length(author) between 1 and 80
  and length(body) between 1 and 1200
  and honeypot = ''
  and client_elapsed_ms >= 2000
);

create policy "owner can moderate comments"
on public.public_comments for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

create policy "owner can delete comments"
on public.public_comments for delete
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'owner'
  )
);

create policy "assets are readable when public url exists"
on public.assets for select
using (public_url is not null);

create policy "owner can manage assets"
on public.assets for all
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

create policy "published portfolio projects are public"
on public.portfolio_projects for select
using (published = true);

create policy "owner can manage portfolio projects"
on public.portfolio_projects for all
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

create policy "published portfolio items are public"
on public.portfolio_items for select
using (published = true);

create policy "owner can manage portfolio items"
on public.portfolio_items for all
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

create policy "files for published portfolio items are public"
on public.portfolio_files for select
using (
  public_url is not null
  and exists (
    select 1 from public.portfolio_items
    where portfolio_items.id = portfolio_files.item_id
      and portfolio_items.published = true
  )
);

create policy "owner can manage portfolio files"
on public.portfolio_files for all
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

create policy "published music tracks are public"
on public.music_tracks for select
using (published = true);

create policy "owner can manage music tracks"
on public.music_tracks for all
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

create policy "published gallery items are public"
on public.gallery_items for select
using (published = true);

create policy "owner can manage gallery items"
on public.gallery_items for all
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

create policy "published reading notes are public"
on public.reading_notes for select
using (published = true);

create policy "owner can manage reading notes"
on public.reading_notes for all
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

create policy "site settings are public"
on public.site_settings for select
using (id = 'main');

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

create policy "public portfolio storage is readable"
on storage.objects for select
using (bucket_id = 'portfolio-public');

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
