
-- ============ EXTENSIONS ============
create extension if not exists "citext";

-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'editor', 'author');
create type public.post_status as enum ('draft', 'scheduled', 'published');
create type public.post_type as enum ('article', 'review', 'comparison', 'guide');
create type public.subscriber_status as enum ('active', 'unsubscribed');

-- ============ UPDATED_AT TRIGGER FUNCTION ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  twitter text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- helper: editor-or-admin
create or replace function public.is_editor_or_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin', 'editor')
  );
$$;

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create trigger categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  vendor text,
  logo_url text,
  website_url text,
  affiliate_url text,
  short_description text,
  long_description jsonb,
  pricing_model text,
  starting_price numeric(10,2),
  currency text default 'USD',
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  pros text[] default '{}',
  cons text[] default '{}',
  best_for text,
  primary_category_id uuid references public.categories(id) on delete set null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create index products_primary_category_idx on public.products(primary_category_id);
create index products_featured_idx on public.products(featured) where featured = true;

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ============ PRODUCT_CATEGORIES (m2m) ============
create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

alter table public.product_categories enable row level security;

-- ============ POSTS ============
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type public.post_type not null default 'article',
  title text not null,
  excerpt text,
  content jsonb,
  cover_image_url text,
  author_id uuid not null references auth.users(id) on delete restrict,
  primary_category_id uuid references public.categories(id) on delete set null,
  status public.post_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  reading_minutes int,
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_url text,
  featured boolean not null default false,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create index posts_status_published_idx on public.posts(status, published_at desc);
create index posts_type_idx on public.posts(type);
create index posts_author_idx on public.posts(author_id);
create index posts_primary_category_idx on public.posts(primary_category_id);
create index posts_featured_idx on public.posts(featured) where featured = true;

create trigger posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- ============ POST_CATEGORIES (m2m) ============
create table public.post_categories (
  post_id uuid not null references public.posts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (post_id, category_id)
);

alter table public.post_categories enable row level security;

-- ============ POST_PRODUCTS (m2m, for reviews/comparisons) ============
create table public.post_products (
  post_id uuid not null references public.posts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  position int not null default 0,
  primary key (post_id, product_id)
);

alter table public.post_products enable row level security;

-- ============ COMPARISON CRITERIA + SCORES ============
create table public.comparison_criteria (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.comparison_criteria enable row level security;
create index comparison_criteria_post_idx on public.comparison_criteria(post_id);

create table public.comparison_scores (
  post_id uuid not null references public.posts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  criterion_id uuid not null references public.comparison_criteria(id) on delete cascade,
  score numeric(3,1),
  note text,
  primary key (post_id, product_id, criterion_id)
);

alter table public.comparison_scores enable row level security;

-- ============ SUBSCRIBERS ============
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  status public.subscriber_status not null default 'active',
  confirmed_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- ============ REDIRECTS (cloaked affiliate links) ============
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  target_url text not null,
  product_id uuid references public.products(id) on delete set null,
  click_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.redirects enable row level security;

create trigger redirects_updated_at
before update on public.redirects
for each row execute function public.set_updated_at();

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles readable by all"
  on public.profiles for select using (true);
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- user_roles
create policy "users see their own roles"
  on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "admins manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- categories
create policy "categories public read"
  on public.categories for select using (true);
create policy "editors manage categories"
  on public.categories for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- products
create policy "products public read"
  on public.products for select using (true);
create policy "editors manage products"
  on public.products for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- product_categories
create policy "product_categories public read"
  on public.product_categories for select using (true);
create policy "editors manage product_categories"
  on public.product_categories for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- posts
create policy "posts public read published"
  on public.posts for select
  using (status = 'published' or auth.uid() = author_id or public.is_editor_or_admin(auth.uid()));
create policy "authors insert own posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and (public.has_role(auth.uid(), 'author')
         or public.is_editor_or_admin(auth.uid()))
  );
create policy "authors update own drafts; editors update any"
  on public.posts for update
  using (
    (auth.uid() = author_id and status = 'draft')
    or public.is_editor_or_admin(auth.uid())
  )
  with check (
    (auth.uid() = author_id) or public.is_editor_or_admin(auth.uid())
  );
create policy "authors delete own drafts; editors delete any"
  on public.posts for delete
  using (
    (auth.uid() = author_id and status = 'draft')
    or public.is_editor_or_admin(auth.uid())
  );

-- post_categories
create policy "post_categories public read"
  on public.post_categories for select using (true);
create policy "editors manage post_categories"
  on public.post_categories for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- post_products
create policy "post_products public read"
  on public.post_products for select using (true);
create policy "editors manage post_products"
  on public.post_products for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- comparison_criteria
create policy "comparison_criteria public read"
  on public.comparison_criteria for select using (true);
create policy "editors manage comparison_criteria"
  on public.comparison_criteria for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- comparison_scores
create policy "comparison_scores public read"
  on public.comparison_scores for select using (true);
create policy "editors manage comparison_scores"
  on public.comparison_scores for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- subscribers
create policy "anyone can subscribe"
  on public.subscribers for insert with check (true);
create policy "editors read subscribers"
  on public.subscribers for select using (public.is_editor_or_admin(auth.uid()));
create policy "editors manage subscribers"
  on public.subscribers for update using (public.is_editor_or_admin(auth.uid()));
create policy "admins delete subscribers"
  on public.subscribers for delete using (public.has_role(auth.uid(), 'admin'));

-- redirects
create policy "redirects public read active"
  on public.redirects for select using (active = true or public.is_editor_or_admin(auth.uid()));
create policy "editors manage redirects"
  on public.redirects for all
  using (public.is_editor_or_admin(auth.uid()))
  with check (public.is_editor_or_admin(auth.uid()));

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('post-covers', 'post-covers', true),
  ('product-logos', 'product-logos', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read post-covers"
  on storage.objects for select using (bucket_id = 'post-covers');
create policy "Editors write post-covers"
  on storage.objects for insert
  with check (bucket_id = 'post-covers' and public.is_editor_or_admin(auth.uid()));
create policy "Editors update post-covers"
  on storage.objects for update
  using (bucket_id = 'post-covers' and public.is_editor_or_admin(auth.uid()));
create policy "Editors delete post-covers"
  on storage.objects for delete
  using (bucket_id = 'post-covers' and public.is_editor_or_admin(auth.uid()));

create policy "Public read product-logos"
  on storage.objects for select using (bucket_id = 'product-logos');
create policy "Editors write product-logos"
  on storage.objects for insert
  with check (bucket_id = 'product-logos' and public.is_editor_or_admin(auth.uid()));
create policy "Editors update product-logos"
  on storage.objects for update
  using (bucket_id = 'product-logos' and public.is_editor_or_admin(auth.uid()));
create policy "Editors delete product-logos"
  on storage.objects for delete
  using (bucket_id = 'product-logos' and public.is_editor_or_admin(auth.uid()));

create policy "Public read avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users write own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
