-- Create sub-categories table
create table if not exists web_url_sub_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add sub_category column to web_urls
alter table web_urls add column if not exists sub_category text;
