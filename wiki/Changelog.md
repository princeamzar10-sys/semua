# Changelog

> Release history for Semua.

**→ [Home](Home) · [Product Roadmap](Product-Roadmap) · [Contributing](Contributing)**

All notable changes are documented here. Dates are YYYY-MM-DD format.

---

## [Unreleased]

Features in active development (not yet deployed):

- Dark mode support
- Persistent AI conversation memory
- Habit push notifications / reminders
- Mobile-responsive sidebar

---

## [0.5.0] — 2026-06-30

### AI Action Agent (Gemini 2.5 Flash)

Complete natural language interface for all four trackers.

**Added:**
- `src/lib/ai/gemini.ts` — Gemini client singleton and `callGemini()` function
- `src/lib/ai/prompts.ts` — Runtime system prompt with date injection
- `src/lib/ai/parser.ts` — Structured JSON response parser, `isReadOnly()`, `actionLabel()`
- `src/lib/tools/tasks.ts` — Task CRUD tool executor
- `src/lib/tools/finance.ts` — Finance CRUD tool executor
- `src/lib/tools/habits.ts` — Habit CRUD tool executor with emoji inference and streak tracking
- `src/lib/tools/goals.ts` — Goal CRUD tool executor
- `src/lib/router/actionRouter.ts` — Action Router: routes parsed actions to tool executors; `summarizeDashboard()`, `generateInsights()`
- `src/app/api/assistant/route.ts` — `POST /api/assistant`
- `src/app/api/assistant/execute/route.ts` — `POST /api/assistant/execute`
- `src/components/assistant/AssistantPanel.tsx` — Full chat UI with example prompts and conversation history
- `src/components/assistant/MessageBubble.tsx` — Message rendering (user / assistant / error / question / results)
- `src/components/assistant/ConfirmationCard.tsx` — Write action confirmation UI
- `src/app/(dashboard)/assistant/page.tsx` — AI Agent page

**Changed:**
- Sidebar: added "AI Agent" nav item with Bot icon
- All tracker pages: `bg-[#F9FAFB]` → `bg-transparent` to work with background image

---

## [0.4.0] — 2026-06-28

### Pastel Background & Frosted Glass Layout

**Added:**
- `public/bg.jpg` — Soft pastel gradient background image

**Changed:**
- `src/app/(dashboard)/layout.tsx` — Background image applied to content area
- `src/components/layout/topbar.tsx` — Frosted glass header: `bg-white/70 backdrop-blur-md`
- `src/app/globals.css` — Removed `bg-[#F8F9FB]` from body styles

---

## [0.3.0] — 2026-06-27

### Sidebar Navigation Fix

**Fixed:**
- White text on active nav items when navigating between pages — caused by Framer Motion `whileHover` inline styles persisting briefly during navigation transitions
- Replaced all `motion.div` nav elements with plain `div` + Tailwind `hover:` classes
- AI Agent panel dark theme — converted all AI Agent components to light theme to match the rest of the app

---

## [0.2.0] — 2026-06-20

### Finance Tracker

**Added:**
- `finance_transactions` table with RLS
- `src/hooks/use-finance.ts` — `useTransactions()`, `useCreateTransaction()`, `useUpdateTransaction()`, `useDeleteTransaction()`
- `src/app/(dashboard)/finance/` — Finance page with income/expense tracking, monthly summary, category breakdown
- Income vs expense toggle in create form
- Category filtering

---

## [0.1.0] — 2026-06-10

### Foundation

**Added:**
- Next.js 15 App Router project setup
- Supabase SSR authentication (`@supabase/ssr`)
- Login page at `/login`
- Dashboard layout with Sidebar + Topbar
- `src/lib/supabase/client.ts` and `server.ts`
- TanStack Query v5 (`QueryClientProvider` in root layout)
- shadcn/ui component library
- Tailwind CSS with custom Satoshi font

### Tasks Tracker

**Added:**
- `tasks` table with RLS
- `src/hooks/use-tasks.ts`
- Tasks page: list, create, update status/priority, delete
- Priority labels (low / medium / high / urgent)
- Due date support

### Habits Tracker

**Added:**
- `habits` and `habit_logs` tables with RLS
- `src/hooks/use-habits.ts` — habit CRUD + daily log toggle
- Habits page: streak display, daily completion toggle, weekly grid
- Streak calculation with `update_habit_streak` RPC

### Goals Tracker

**Added:**
- `goals` table with RLS
- `src/hooks/use-goals.ts`
- Goals page: progress bars, update progress modal, status management

### Quick Add Command Bar

**Added:**
- `src/components/CommandBar.tsx` — Cmd+K quick add interface
- `src/lib/parser.ts` — Rule-based NLP for quick commands
- `src/lib/commandHandler.ts` — Command execution

---

*See also: [Product Roadmap](Product-Roadmap) · [Home](Home)*
