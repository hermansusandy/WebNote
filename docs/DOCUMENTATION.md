# WebNote Architecture & Functionality Documentation

WebNote is a comprehensive personal workspace application built with Next.js 15, React 19, Tailwind CSS v4, and PostgreSQL. It acts as a centralized hub for note-taking, task tracking, resource management, and AI-assisted productivity.

---

## Global Features & Shell

### `AIAssistant` (Global AI Chat)
- **Location:** `src/components/ai-assistant.tsx`
- **Functionality:** A floating chat interface available on all pages. Powered by the Google Gemini AI model (`gemini-2.5-flash`).
- **Capabilities:** 
  - Natural language chat and reasoning.
  - **Tool Execution:** The AI can directly interact with your database to `createPage`, `createLearning`, `createReminder`, `createWebUrl`, `createYoutubeVideo`, `search` across all modules, and `delete` or `update` records without you needing to navigate to those pages.
  
### `Sidebar` & `Shell` (Navigation)
- **Location:** `src/components/sidebar.tsx`, `src/components/shell.tsx`
- **Functionality:** Provides the primary navigation structure. Uses a resizable split-pane layout on desktop and a hamburger menu on mobile.
- **Dynamic Content:** The sidebar automatically fetches and lists your nested `Pages` hierarchy, allowing quick access to your documents.

---

## Core Modules

### 1. Dashboard (`/dashboard`)
- **Location:** `src/app/(main)/dashboard/page.tsx`
- **Functionality:** The landing page providing a high-level overview of your workspace.
- **Features:** 
  - Displays summary cards for "Today's Reminders", "Learning Priorities", and "Recent Pages".
  - *(Currently displays placeholder '0' values, designed to be connected to the respective APIs for at-a-glance metrics).*

### 2. Pages / Notes (`/pages` & `/pages/[id]`)
- **Location:** `src/app/(main)/pages/page.tsx`, `src/app/(main)/pages/[id]/page.tsx`
- **API Route:** `src/app/api/pages/route.ts`
- **Functionality:** A rich-text document editing system similar to Notion.
- **Features:**
  - **Hierarchical Structure:** Pages can be nested within other pages (parent/child relationship).
  - **Rich Text Editor:** Utilizes Tiptap (`src/components/editor.tsx`) to provide a seamless block-based editing experience.
  - **Slash Commands:** Typing `/` opens a menu to insert Headings, Lists, Checkboxes, Code Blocks, and Tables.
  - **Auto-save:** The title and content are automatically debounced and saved to the database as you type.

### 3. Learning Goals (`/learning`)
- **Location:** `src/app/(main)/learning/page.tsx`
- **API Route:** `src/app/api/learning/route.ts`
- **Functionality:** A tracker for subjects, courses, or skills you are studying.
- **Features:**
  - Tracks items by Title, Category, Priority (Low/Medium/High), and Status (Planned/In Progress/Completed).
  - Items can be categorized using customizable color-coded tags via the `CategoryManager`.
  - Supports sorting, filtering, and inline editing.

### 4. Reminders (`/reminders`)
- **Location:** `src/app/(main)/reminders/page.tsx`
- **API Route:** `src/app/api/reminders/route.ts`
- **Functionality:** A task and deadline management system.
- **Features:**
  - Tracks tasks with a specific Due Date.
  - Allows marking tasks as complete (checkbox).
  - Uses the global `CategoryManager` to assign color-coded tags to different types of reminders.

### 5. Tools & URLs (`/tools`)
- **Location:** `src/app/(main)/tools/page.tsx`
- **API Route:** `src/app/api/tools/route.ts`
- **Functionality:** A bookmark manager specifically tailored for development tools, websites, and resources.
- **Features:**
  - Stores the URL, Name, Category, Sub-Category, and optional Remarks.
  - Features a dual-category system (Main Category + Sub Category) to keep large lists of links organized.

### 6. YouTube Manager (`/youtube`)
- **Location:** `src/app/(main)/youtube/page.tsx`
- **API Route:** `src/app/api/youtube/route.ts`
- **Functionality:** A dedicated bookmarking system for educational or important YouTube videos.
- **Features:**
  - Stores Video Title, URL, Category, and personal Notes.
  - Keeps video links separate from general web tools for better organization of video-based learning material.

---

## Shared Infrastructure

### `CategoryManager`
- **Location:** `src/components/category-manager.tsx`, `src/app/api/categories/route.ts`
- **Functionality:** A reusable component that handles the creation, editing, and deletion of categorical tags across the application. 
- **Usage:** Used by Learning, Reminders, Tools, and YouTube modules to ensure a consistent tagging experience. Supports custom color assignments for visual organization.

### Authentication & Database
- **Auth:** Currently utilizes a self-healing local authentication stub (`src/lib/auth.ts`) that assigns a default `admin@webnote.local` user to ensure the app works out-of-the-box on local/NAS deployments without complex OAuth setup.
- **Database:** Uses PostgreSQL via the `pg` driver (`src/lib/db.ts`). The schema is managed via raw SQL migrations located in the `supabase/migrations/` folder.