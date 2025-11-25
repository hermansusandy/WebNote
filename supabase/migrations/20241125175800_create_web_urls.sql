create table if not exists web_urls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table web_urls enable row level security;

create policy "Users can view their own web urls"
  on web_urls for select
  using (auth.uid() = user_id);

create policy "Users can insert their own web urls"
  on web_urls for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own web urls"
  on web_urls for update
  using (auth.uid() = user_id);

create policy "Users can delete their own web urls"
  on web_urls for delete
  using (auth.uid() = user_id);
