# 02-IA-UX.md
## Information Architecture
- **App**
  - **Dashboard**
    - Today Reminders
    - Learning Titles (priority sorted)
    - Recent Pages
  - **Pages**
    - Page Tree (left sidebar)
    - Page Editor (main)
  - **Learning Planner**
    - List View
    - Detail View
  - **Software List**
    - Category Filter
    - List/Grid view
  - **Settings**
    - Profile
    - Theme
    - Data export

## Primary Navigation
Left sidebar:
- Dashboard
- Pages
- Learning
- Reminders
- Software
- Settings

## UX Flows
### Create a Learning Title
Dashboard/Learning → “New Learning Title” → fill form → save → add subpoints.

### Add sub-points
Learning Detail → “Add Point” → bullet/checklist format → save.

### Create Page
Pages → “+ Page” → name → open editor → add blocks.

### Link learning title to page
Learning Detail → “Linked Page” → select existing page OR create new.

## Sorting Rules (Learning Titles)
Default sort:
1. Status != Done first
2. Priority: Urgent > High > Med > Low
3. Target date soonest

## Block Types (Editor MVP)
- Heading H1/H2/H3
- Paragraph
- Bullets
- Checklist (toggle done)

## Nice-to-have UX
- Cmd/Ctrl+K quick search
- Slash / block menu
- Drag-reorder learning points
