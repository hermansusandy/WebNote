create table reminder_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

-- Add category_id and priority to reminders
alter table reminders add column category_id uuid references reminder_categories(id) on delete set null;
alter table reminders add column priority text check (priority in ('Low', 'Medium', 'High', 'Urgent')) default 'Medium';

create index reminders_category_id_idx on reminders(category_id);
create index reminders_priority_idx on reminders(priority);
