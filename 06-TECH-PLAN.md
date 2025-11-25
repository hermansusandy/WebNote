# 06-TECH-PLAN.md
## Stack
- Next.js (App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- Supabase (auth + db + storage)
- Zustand or React Query for state
- TipTap or Lexical for editor MVP

## Folder Structure
/apps
  /web
    /app
      /(auth)
      /dashboard
      /pages
      /learning
      /software
      /reminders
    /components
    /lib (supabase client, helpers)
    /styles
/supabase
  /migrations
  seed.sql

## Editor MVP Choice
- Use TipTap starter kit
- Map blocks to `page_blocks` table
- Simple JSON content

## Security
- Supabase Auth email+password
- RLS enforced
- No public data by default

## Performance
- Paginate lists (learning/software)
- Lazy load page tree children
