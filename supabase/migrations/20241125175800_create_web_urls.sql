create table if not exists web_urls (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  url text not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
