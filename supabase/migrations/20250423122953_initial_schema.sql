-- Migration: Initial Schema for Project Manager
-- Description: Creates the initial database schema including all tables, indexes, and RLS policies
-- Author: Cascade AI
-- Date: 2025-04-23

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create project status enum
create type project_status as enum ('new', 'in_progress', 'completed');

-- Create tables
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status project_status not null default 'new',
  prd jsonb not null default '{}'::jsonb,
  
  constraint projects_name_not_empty check (char_length(trim(name)) > 0)
);

comment on table projects is 'Tabela przechowująca projekty użytkowników';

create table tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  name text not null,
  color text not null default '#808080',
  
  constraint tags_name_not_empty check (char_length(trim(name)) > 0),
  constraint tags_name_user_unique unique (user_id, name)
);

comment on table tags is 'Tabela przechowująca tagi do kategoryzacji projektów';

create table project_tags (
  project_id uuid not null references projects(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  
  primary key (project_id, tag_id)
);

comment on table project_tags is 'Tabela łącząca (junction) do relacji many-to-many między projektami a tagami';

create table ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  cost decimal(10, 6) not null default 0,
  created_at timestamptz not null default now()
);

comment on table ai_interactions is 'Tabela logująca interakcje z AI, w tym koszty';

create table ai_questions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  sequence_number integer not null,
  question text not null,
  answer text,
  created_at timestamptz not null default now(),
  
  constraint ai_questions_sequence unique (project_id, sequence_number)
);

comment on table ai_questions is 'Tabela przechowująca pytania i odpowiedzi AI w procesie generowania PRD';

-- Create indexes
create index idx_projects_user_id on projects(user_id);
create index idx_projects_status on projects(status);
create index idx_projects_created_at on projects(created_at);
create index idx_projects_name on projects(name);

create index idx_project_tags_project_id on project_tags(project_id);
create index idx_project_tags_tag_id on project_tags(tag_id);

create index idx_ai_interactions_user_id on ai_interactions(user_id);
create index idx_ai_interactions_project_id on ai_interactions(project_id);
create index idx_ai_interactions_created_at on ai_interactions(created_at);

create index idx_ai_questions_project_id on ai_questions(project_id);
create index idx_ai_questions_sequence on ai_questions(project_id, sequence_number);

-- Enable Row Level Security
alter table projects enable row level security;
alter table tags enable row level security;
alter table project_tags enable row level security;
alter table ai_interactions enable row level security;
alter table ai_questions enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

create policy "Users can view their own tags"
  on tags for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tags"
  on tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tags"
  on tags for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on tags for delete
  using (auth.uid() = user_id);

create policy "Users can view project tags they own"
  on project_tags for select
  using (auth.uid() = (select user_id from projects where id = project_id));

create policy "Users can insert project tags they own"
  on project_tags for insert
  with check (auth.uid() = (select user_id from projects where id = project_id));

create policy "Users can delete project tags they own"
  on project_tags for delete
  using (auth.uid() = (select user_id from projects where id = project_id));

create policy "Users can view their own AI interactions"
  on ai_interactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AI interactions"
  on ai_interactions for insert
  with check (auth.uid() = user_id);

create policy "Users can view AI questions for their projects"
  on ai_questions for select
  using (auth.uid() = (select user_id from projects where id = project_id));

create policy "Users can insert AI questions for their projects"
  on ai_questions for insert
  with check (auth.uid() = (select user_id from projects where id = project_id));

-- Create updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for projects table
create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();
