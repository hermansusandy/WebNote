create table learning_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

alter table learning_categories enable row level security;

create policy "Users can crud own learning_categories" on learning_categories for all using (auth.uid() = user_id);

-- Add category_id to learning_titles
alter table learning_titles add column category_id uuid references learning_categories(id) on delete set null;
create index learning_titles_category_id_idx on learning_titles(category_id);
