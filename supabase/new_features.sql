-- ============ NEW TABLES ============

-- 1. Hero Slides
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  slide_order integer not null,
  is_active boolean not null default true,
  headline varchar(60) not null,
  subline varchar(120),
  cta_primary_text text,
  cta_primary_url text,
  cta_secondary_text text,
  cta_secondary_url text,
  image_url text not null,
  image_alt text,
  overlay_opacity numeric(3,2) default 0.4,
  overlay_color varchar(7) default '#000000',
  created_at timestamptz not null default now()
);

-- 2. AI Tools
create table if not exists public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline varchar(100),
  official_url text,
  affiliate_url text,
  logo_url text,
  screenshot_urls text[] not null default '{}',
  category text check (category in ('Writing', 'Coding', 'Image Gen', 'Video', 'Audio', 'Productivity', 'Research', 'Other')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  pricing_model text check (pricing_model in ('free', 'freemium', 'paid', 'enterprise')),
  has_free_tier boolean not null default false,
  starting_price text,
  api_available boolean not null default false,
  overall_score numeric(3,1) check (overall_score >= 0 and overall_score <= 10),
  accuracy_score numeric(3,1) check (accuracy_score >= 0 and accuracy_score <= 10),
  speed_score numeric(3,1) check (speed_score >= 0 and speed_score <= 10),
  ease_of_use_score numeric(3,1) check (ease_of_use_score >= 0 and ease_of_use_score <= 10),
  value_score numeric(3,1) check (value_score >= 0 and value_score <= 10),
  best_for text[] not null default '{}',
  integrations text[] not null default '{}',
  context_window text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  limitations text,
  verdict text check (verdict in ('highly-recommended', 'recommended', 'consider', 'skip')),
  verdict_summary varchar(200),
  review_content text,
  meta_title text,
  meta_description text,
  is_featured boolean not null default false,
  featured_order integer,
  click_count integer not null default 0,
  view_count integer not null default 0,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add updated_at trigger for public.ai_tools
create trigger ai_tools_updated_at
before update on public.ai_tools
for each row execute function public.set_updated_at();

-- 3. Analytics Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'pageview', 'compare', 'affiliate_click', 'email_signup'
  tool_id uuid references public.ai_tools(id) on delete cascade,
  tool_ids uuid[],
  url text,
  source text,
  session_id text,
  created_at timestamptz not null default now()
);

-- 4. Global Settings (Homepage Comparison, Layouts, etc.)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Add updated_at trigger for public.settings
create trigger settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();


-- ============ ALTER STANDING TABLES (STATUS ENUM UPGRADES) ============

-- 1. Reviews
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews alter column status drop default;
alter table public.reviews alter column status set default 'draft';
alter table public.reviews add constraint reviews_status_check check (status in ('draft', 'scheduled', 'published', 'archived'));

alter table public.reviews add column if not exists scheduled_at timestamptz;
alter table public.reviews add column if not exists published_at timestamptz;
alter table public.reviews add column if not exists archived_at timestamptz;
alter table public.reviews add column if not exists is_featured boolean not null default false;
alter table public.reviews add column if not exists featured_order integer;

-- 2. Posts
alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts alter column status drop default;
alter table public.posts alter column status set default 'draft';
alter table public.posts add constraint posts_status_check check (status in ('draft', 'scheduled', 'published', 'archived'));

alter table public.posts add column if not exists scheduled_at timestamptz;
alter table public.posts add column if not exists published_at timestamptz;
alter table public.posts add column if not exists archived_at timestamptz;
alter table public.posts add column if not exists is_featured boolean not null default false;
alter table public.posts add column if not exists featured_order integer;


-- ============ ROW LEVEL SECURITY POLICIES ============

alter table public.hero_slides enable row level security;
alter table public.ai_tools enable row level security;
alter table public.events enable row level security;
alter table public.settings enable row level security;

-- Hero Slides policies
create policy "Public read hero_slides"
  on public.hero_slides for select using (is_active = true or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ));
create policy "Admins/Editors manage hero_slides"
  on public.hero_slides for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- AI Tools policies
create policy "Public read published ai_tools"
  on public.ai_tools for select using (status = 'published' or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  ));
create policy "Admins/Editors manage ai_tools"
  on public.ai_tools for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Events policies
create policy "Anyone can write events"
  on public.events for insert with check (true);
create policy "Admins/Editors select events"
  on public.events for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Settings policies
create policy "Public read settings"
  on public.settings for select using (true);
create policy "Admins/Editors write settings"
  on public.settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- 5. Admin Logs (For auditing and crons)
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_logs enable row level security;

create policy "Admins/Editors read admin_logs"
  on public.admin_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

create policy "Cron/System can insert admin_logs"
  on public.admin_logs for insert
  with check (true);
