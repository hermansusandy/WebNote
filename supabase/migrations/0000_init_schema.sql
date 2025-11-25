-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Pages
create table pages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  parent_id uuid references pages(id) on delete cascade,
  title text not null default 'Untitled',
  icon text,
  cover_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Page Blocks
create table page_blocks (
  id uuid default uuid_generate_v4() primary key,
  page_id uuid references pages(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- heading, paragraph, bullet, checklist
  content jsonb default '{}'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Learning Titles
create table learning_titles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  priority text check (priority in ('Low', 'Medium', 'High', 'Urgent')) default 'Medium',
  status text check (status in ('Planned', 'In Progress', 'Done', 'Paused')) default 'Planned',
  start_date date,
  target_date date,
  duration_days int,
  linked_page_id uuid references pages(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Learning Points
create table learning_points (
  id uuid default uuid_generate_v4() primary key,
  learning_title_id uuid references learning_titles(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_done boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reminders
create table reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  due_at timestamptz,
  repeat_rule text,
  is_done boolean default false,
  linked_page_id uuid references pages(id) on delete set null,
  linked_learning_title_id uuid references learning_titles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Software Categories
create table software_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Software Items
create table software_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references software_categories(id) on delete cascade not null,
  name text not null,
  tags text[],
  url text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index pages_user_parent_idx on pages(user_id, parent_id);
create index learning_titles_user_status_idx on learning_titles(user_id, status, priority);
create index reminders_user_due_idx on reminders(user_id, due_at);
create index software_items_user_category_idx on software_items(user_id, category_id);

-- RLS Policies
alter table profiles enable row level security;
alter table pages enable row level security;
alter table page_blocks enable row level security;
alter table learning_titles enable row level security;
alter table learning_points enable row level security;
alter table reminders enable row level security;
alter table software_categories enable row level security;
alter table software_items enable row level security;

-- Policies (Simple: Users can only see/edit their own data)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can crud own pages" on pages for all using (auth.uid() = user_id);
create policy "Users can crud own page_blocks" on page_blocks for all using (auth.uid() = user_id);
create policy "Users can crud own learning_titles" on learning_titles for all using (auth.uid() = user_id);
create policy "Users can crud own learning_points" on learning_points for all using (auth.uid() = user_id);
create policy "Users can crud own reminders" on reminders for all using (auth.uid() = user_id);
create policy "Users can crud own software_categories" on software_categories for all using (auth.uid() = user_id);
create policy "Users can crud own software_items" on software_items for all using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
