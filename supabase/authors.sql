-- ============ CREATE AUTHORS TABLE ============
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  title text,
  avatar_url text,
  bio text,
  credentials text,
  twitter_url text,
  linkedin_url text,
  website_url text,
  created_at timestamptz not null default now()
);

-- ============ UPDATE FOREIGN KEY CONSTRAINTS ============

-- 1. Reviews table fkey
alter table public.reviews drop constraint if exists reviews_author_id_fkey;
alter table public.reviews 
  add constraint reviews_author_id_fkey 
  foreign key (author_id) 
  references public.authors(id) 
  on delete set null;

-- 2. Posts table fkey
alter table public.posts drop constraint if exists posts_author_id_fkey;
alter table public.posts 
  add constraint posts_author_id_fkey 
  foreign key (author_id) 
  references public.authors(id) 
  on delete set null;

-- 3. AI Tools table fkey
alter table public.ai_tools drop constraint if exists ai_tools_author_id_fkey;
alter table public.ai_tools 
  add constraint ai_tools_author_id_fkey 
  foreign key (author_id) 
  references public.authors(id) 
  on delete set null;

-- ============ ROW LEVEL SECURITY (RLS) ============
alter table public.authors enable row level security;

-- Policies for public.authors
create policy "Public read authors" 
  on public.authors for select 
  using (true);

create policy "Admins/Editors manage authors" 
  on public.authors for all 
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- ============ AUTOMATIC SYNC FROM PROFILES ============

-- Trigger function to automatically maintain an author profile for admins, editors, and authors
create or replace function public.sync_profile_to_author()
returns trigger language plpgsql security definer as $$
begin
  if new.role in ('admin', 'editor', 'author') then
    insert into public.authors (id, slug, display_name, title, avatar_url, bio)
    values (
      new.id,
      coalesce(nullif(lower(regexp_replace(new.display_name, '[^a-zA-Z0-9]+', '-', 'g')), ''), split_part(new.email, '@', 1)),
      coalesce(new.display_name, 'Optura Vibe Contributor'),
      case when new.role = 'admin' then 'Senior Editor' else 'Staff Writer' end,
      new.avatar_url,
      new.bio
    )
    on conflict (id) do update set
      display_name = coalesce(excluded.display_name, public.authors.display_name),
      avatar_url = coalesce(excluded.avatar_url, public.authors.avatar_url),
      bio = coalesce(excluded.bio, public.authors.bio);
  end if;
  return new;
end;
$$;

drop trigger if exists sync_profile_to_author_trigger on public.profiles;

create trigger sync_profile_to_author_trigger
after insert or update of role, display_name, avatar_url, bio on public.profiles
for each row execute function public.sync_profile_to_author();

-- ============ SEED & BACKFILL ============

-- 1. Insert Default "Editorial Staff" Author
insert into public.authors (id, slug, display_name, title, bio, avatar_url)
values (
  '11111111-1111-1111-1111-111111111111',
  'editorial-staff',
  'Editorial Staff',
  'Optura Vibe Staff',
  'Optura Vibe''s dedicated team of writers, product analysts, and editors.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  title = excluded.title,
  bio = excluded.bio;

-- 2. Backfill existing admin/editor profiles into the authors table
insert into public.authors (id, slug, display_name, title, avatar_url, bio)
select 
  id,
  coalesce(nullif(lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g')), ''), split_part(email, '@', 1)),
  coalesce(display_name, 'Optura Vibe Contributor'),
  case when role = 'admin' then 'Senior Editor' else 'Staff Writer' end,
  avatar_url,
  bio
from public.profiles
where role in ('admin', 'editor', 'author')
on conflict (id) do nothing;

-- 3. Point existing rows with null author_id to the default Editorial Staff row
update public.reviews 
set author_id = '11111111-1111-1111-1111-111111111111' 
where author_id is null;

update public.posts 
set author_id = '11111111-1111-1111-1111-111111111111' 
where author_id is null;

update public.ai_tools 
set author_id = '11111111-1111-1111-1111-111111111111' 
where author_id is null;
