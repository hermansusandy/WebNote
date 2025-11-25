# 00-README.md
## Project Name
**Hweb Notes** (working name)

## One-line Vision
A personal Notion-style workspace for **reminders, learning plans, and categorized software lists**, optimized for simple daily use and fast organization.

## Core Modules
1. **Pages (Notion-like)**
   - Create unlimited pages
   - Nested pages
   - Rich text blocks (MVP: heading, bullets, checklist)
2. **Learning Planner**
   - Create “Learning Titles” (main topics)
   - Sort/filter by priority, date, duration, status
   - Each title has sub-titles / learning points
3. **Reminders**
   - Simple reminders tied to pages or learning titles
   - Due date + optional repeat
4. **Software List**
   - Save software/tools
   - Categories + tags
   - Quick search and filter

## Success Criteria (MVP)
- User can create pages + learning titles + software entries with zero confusion.
- Priorities, dates, and durations are clearly visible.
- Works smoothly on desktop + mobile web.

## Assumptions
- Single-user app first (auth required).
- Multi-user collaboration can be Phase 2.
- Offline mode not required for MVP.

## Tech Summary
- Frontend: Next.js (React) + Tailwind
- Backend/DB/Auth: Supabase
- Design: Figma (high-fidelity UI)
