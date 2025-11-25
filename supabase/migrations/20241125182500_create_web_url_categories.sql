create table if not exists web_url_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table web_url_categories enable row level security;

create policy "Users can view their own web url categories"
  on web_url_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own web url categories"
  on web_url_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own web url categories"
  on web_url_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own web url categories"
  on web_url_categories for delete
  using (auth.uid() = user_id);
