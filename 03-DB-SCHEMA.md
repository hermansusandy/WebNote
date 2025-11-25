# 03-DB-SCHEMA.md
## Supabase Schema (Postgres)

### Table: profiles
- id (uuid, pk, references auth.users)
- display_name (text)
- avatar_url (text)
- created_at (timestamptz)

### Table: pages
- id (uuid, pk)
- user_id (uuid, fk -> profiles.id)
- parent_id (uuid, fk -> pages.id, nullable)
- title (text)
- icon (text, nullable)
- cover_url (text, nullable)
- sort_order (int, default 0)
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: page_blocks
- id (uuid, pk)
- page_id (uuid, fk -> pages.id)
- user_id (uuid)
- type (text)  // heading, paragraph, bullet, checklist
- content (jsonb) // { text, checked?, level? }
- sort_order (int)
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: learning_titles
- id (uuid, pk)
- user_id (uuid)
- title (text)
- priority (text) // low, medium, high, urgent
- status (text) // planned, in_progress, done, paused
- start_date (date, nullable)
- target_date (date, nullable)
- duration_days (int, nullable)
- linked_page_id (uuid, fk -> pages.id, nullable)
- notes (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: learning_points
- id (uuid, pk)
- learning_title_id (uuid, fk -> learning_titles.id)
- user_id (uuid)
- content (text)
- is_done (boolean, default false)
- sort_order (int)
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: reminders
- id (uuid, pk)
- user_id (uuid)
- title (text)
- due_at (timestamptz)
- repeat_rule (text, nullable) // later phase
- is_done (boolean, default false)
- linked_page_id (uuid, nullable)
- linked_learning_title_id (uuid, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: software_categories
- id (uuid, pk)
- user_id (uuid)
- name (text)
- color (text, nullable)
- sort_order (int)

### Table: software_items
- id (uuid, pk)
- user_id (uuid)
- category_id (uuid, fk -> software_categories.id)
- name (text)
- tags (text[], nullable)
- url (text, nullable)
- note (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

## Indexes
- pages(user_id, parent_id, sort_order)
- learning_titles(user_id, priority, status, target_date)
- reminders(user_id, due_at, is_done)
- software_items(user_id, category_id)

## RLS Policies (summary)
Enable RLS on all tables.  
Policy: user can CRUD only rows where user_id = auth.uid().
