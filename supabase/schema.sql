-- Job Application Assistant — Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "uuid-ossp";

-- Your profile / contact info (single row per user)
create table profile (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  full_name text not null,
  email text not null,
  phone text,
  location text,
  links jsonb default '{}'::jsonb, -- { github, portfolio, linkedin }
  summary text, -- default professional summary, used as fallback
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Raw source material: jobs, projects, education — the "truth" the tailoring pulls from
create table experience_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  type text not null check (type in ('job', 'project', 'education', 'certification')),
  title text not null,
  organization text,
  start_date date,
  end_date date, -- null = current
  bullets text[] not null default '{}', -- raw, untailored source bullets
  tags text[] not null default '{}', -- skills/keywords this item demonstrates, used for matching
  display_order int default 0,
  created_at timestamptz default now()
);

-- One row per job application
create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  company text not null,
  role_title text not null,
  job_url text,
  job_description text not null, -- raw pasted JD
  status text not null default 'draft' check (status in ('draft', 'applied', 'interview', 'rejected', 'offer', 'withdrawn')),
  matched_experience_ids uuid[] default '{}', -- which experience_items were selected for this app
  tailored_resume jsonb, -- structured tailored resume (see types.ts ResumeDraft)
  tailored_cover_letter text, -- generated cover letter body
  notes text,
  applied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: every user only ever sees their own data
alter table profile enable row level security;
alter table experience_items enable row level security;
alter table applications enable row level security;

create policy "own profile" on profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own experience" on experience_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own applications" on applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_experience_tags on experience_items using gin (tags);
create index idx_applications_status on applications (status);
