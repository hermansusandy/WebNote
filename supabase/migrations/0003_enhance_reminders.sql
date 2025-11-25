create table reminder_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

alter table reminder_categories enable row level security;

create policy "Users can crud own reminder_categories" on reminder_categories for all using (auth.uid() = user_id);

-- Add category_id and priority to reminders
alter table reminders add column category_id uuid references reminder_categories(id) on delete set null;
alter table reminders add column priority text check (priority in ('Low', 'Medium', 'High', 'Urgent')) default 'Medium';

create index reminders_category_id_idx on reminders(category_id);
create index reminders_priority_idx on reminders(priority);
