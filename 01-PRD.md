# 01-PRD.md
## 1. Problem
I need a personal workspace to:
- write notes like Notion
- track learning topics with priority + timeline
- store a categorized list of software/tools
…all in one place, clean UI, fast to use.

## 2. Goals
### User goals
- Capture notes quickly into pages.
- Plan learning topics with structure.
- See what to learn next by priority/date.
- Maintain a personal “toolbox” list.

### Product goals
- Be simpler than Notion for a single user.
- Beautiful minimal UI.
- Highly flexible structure (pages can grow forever).

## 3. Personas
1. **Solo Learner**
   - Makes learning plans
   - Needs subpoints & schedule
2. **Busy Professional**
   - Wants reminders + structured notes
3. **Tool Collector**
   - Keeps categorized software list

## 4. User Stories (MVP)
### Pages
- As a user, I can create a new page.
- I can rename a page.
- I can create nested sub-pages.
- I can add/edit blocks (heading, text, bullet, checklist).
- I can search pages by title/content.

### Learning Planner
- I can add a Learning Title with:
  - main title
  - priority (Low/Med/High/Urgent)
  - start date / target date
  - duration (days)
  - status (Planned/In Progress/Done/Paused)
- I can add sub-titles/points per learning title.
- I can sort/filter learning titles by priority, date, status.
- I can link a learning title to a page.

### Reminders
- I can add reminders with due date/time.
- I can link reminders to a page or learning title.
- I can mark reminders done.
- I can see reminders in “Today / Upcoming / Overdue”.

### Software List
- I can add software with:
  - name
  - category
  - tags
  - link
  - short note
- I can filter by category/tags and search by name.

## 5. Non-Goals (MVP)
- Real-time collaboration
- AI writing assistant
- Offline-first sync
- Complex databases (graphs, backlinks)

## 6. Key Screens (MVP)
1. Dashboard (home)
2. Pages workspace
3. Learning planner list + detail drawer
4. Reminders panel
5. Software list

## 7. Metrics
- Time to create first page (< 30s)
- Weekly active usage
- % learning titles completed
- # pages created per week

## 8. Risks & Mitigation
- Too close to Notion → keep features minimal, focus on clarity.
- UI becomes messy with growth → enforce consistent layout patterns.
