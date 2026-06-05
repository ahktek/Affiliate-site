-- Enable citext for case-insensitive emails
create extension if not exists "citext";

-- ============ ENUMS & CUSTOM TYPES ============
create type public.app_role as enum ('admin', 'editor', 'author', 'user');

-- ============ UPDATED_AT TRIGGER FUNCTION ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Trigger to auto-insert a profile when a new user signs up in auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  is_first_user boolean;
  assigned_role public.app_role;
begin
  -- Check if this is the first user in the database
  select not exists (select 1 from public.profiles limit 1) into is_first_user;
  
  -- Assign 'admin' to the first user, otherwise 'user'
  if is_first_user then
    assigned_role := 'admin';
  else
    assigned_role := 'user';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    assigned_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  featured_image text,
  category_id uuid references public.categories(id) on delete set null,
  overall_rating numeric(3,1) check (overall_rating >= 0 and overall_rating <= 5),
  scores jsonb not null default '{"performance": 0, "value": 0, "design": 0, "easeOfUse": 0}'::jsonb,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  cta_links jsonb not null default '[]'::jsonb,
  compare_with text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references auth.users(id) on delete set null,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create trigger reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- ============ POSTS ============
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  featured_image text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references auth.users(id) on delete set null,
  views integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create trigger posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- ============ SUBSCRIBERS ============
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  name text,
  source text,
  timestamp bigint not null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- ============ RLS POLICIES ============

-- Profiles policies
create policy "Public read profiles"
  on public.profiles for select using (true);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Categories policies
create policy "Public read categories"
  on public.categories for select using (true);
create policy "Admins/Editors write categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Reviews policies
create policy "Public read published reviews"
  on public.reviews for select using (status = 'published' or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ));
create policy "Admins/Editors manage reviews"
  on public.reviews for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Posts policies
create policy "Public read published posts"
  on public.posts for select using (status = 'published' or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ));
create policy "Admins/Editors manage posts"
  on public.posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Subscribers policies
create policy "Anyone can subscribe"
  on public.subscribers for insert with check (true);
create policy "Admins/Editors read subscribers"
  on public.subscribers for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );
create policy "Admins delete subscribers"
  on public.subscribers for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============ STORAGE BUCKETS ============
-- Storage configuration policies should be enabled via dashboard or SQL
-- Bucket inserts for reference
insert into storage.buckets (id, name, public) values
  ('images', 'images', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read images"
  on storage.objects for select using (bucket_id = 'images');
create policy "Admins/Editors write images"
  on storage.objects for insert
  with check (bucket_id = 'images' and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ));

create policy "Public read avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users write own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
