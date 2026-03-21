create table learning_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

-- Add category_id to learning_titles
alter table learning_titles add column category_id uuid references learning_categories(id) on delete set null;
create index learning_titles_category_id_idx on learning_titles(category_id);
