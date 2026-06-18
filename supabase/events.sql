-- Drop existing events table if it exists
drop table if exists public.events cascade;

-- Create the events table matching the specification
create table public.events (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references public.ai_tools(id) on delete cascade,
  tool_slug text,
  event_type text not null default 'click',
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;

-- Policies for public.events
create policy "Anyone can insert events" 
  on public.events for insert 
  with check (true);

create policy "Admins/Editors read events" 
  on public.events for select 
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );
