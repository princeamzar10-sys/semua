# Product Roadmap

> Living document. Updated with every release.

**→ [Home](Home) · [Changelog](Changelog) · [Architecture](Architecture)**

---

## Table of Contents

- [Current Status](#current-status)
- [Completed Features](#completed-features)
- [In Progress](#in-progress)
- [Version Roadmap](#version-roadmap)
- [Backlog](#backlog)

---

## Current Status

**Version:** `0.2 Beta`
**Phase:** Private Beta — founder-led testing
**Deployment:** Vercel (production)
**Database:** Supabase (hosted PostgreSQL)

---

## Completed Features

### Core Infrastructure
- [x] Next.js 15 App Router setup with Turbopack
- [x] Supabase Auth integration (email/password)
- [x] TanStack Query v5 for server state
- [x] Tailwind CSS v4 + shadcn/ui component system
- [x] Framer Motion animations
- [x] Sonner toast notifications
- [x] Global keyboard shortcut system (⌘K)
- [x] Responsive sidebar with collapse

### Dashboard
- [x] Greeting with time-of-day logic
- [x] 4-stat summary bar (tasks, income, expenses, habits)
- [x] Today's Focus (due tasks)
- [x] Financial Snapshot with progress bar
- [x] Habit Status 7-day grid
- [x] Goal Progress panel
- [x] AI Insights widget
- [x] Pastel gradient background

### Task Tracker
- [x] Create / edit / delete tasks
- [x] Priority levels (low / medium / high / urgent)
- [x] Due dates
- [x] Categories
- [x] Status: todo / in-progress / completed
- [x] Grouped view: Overdue / Today / Upcoming / Completed
- [x] Search + filter

### Finance Tracker
- [x] Log income and expenses
- [x] Categories
- [x] Month selector
- [x] Stat cards (income, expenses, net)
- [x] Amber insight card (top spending category)
- [x] Pie chart breakdown
- [x] Transaction list with search + filter
- [x] Edit / delete on hover

### Habit Tracker
- [x] Create habits with emoji + frequency
- [x] Daily completion logging
- [x] Streak tracking (current + longest)
- [x] 7-day grid view
- [x] Streak RPC in Supabase
- [x] Edit / delete habits

### Goal Tracker
- [x] Create goals with target + deadline
- [x] Progress tracking
- [x] Progress bar visualization
- [x] Categories
- [x] Edit / delete goals

### AI Agent
- [x] Gemini 2.5 Flash integration (`@google/genai`)
- [x] Natural language → structured JSON actions
- [x] Action Router (server-side validation)
- [x] Tool executors: tasks, finance, habits, goals
- [x] Confirmation card before destructive writes
- [x] Read-only actions (summarize, insights) run immediately
- [x] Multi-action support
- [x] Follow-up question handling
- [x] Conversation history (in-session)
- [x] Dashboard summary
- [x] AI insights generation

### Quick Add Command Bar
- [x] ⌘K / Ctrl+K global shortcut
- [x] Rule-based NLP parser
- [x] Real-time preview
- [x] Detects: finance, habit, task, goal
- [x] Amount extraction (RM)
- [x] Date resolution (today, tomorrow, next Friday)

### Settings
- [x] Display name save (auth metadata + DB)
- [x] Immediate UI update after save
- [x] Avatar initials

---

## In Progress

- [ ] Mobile layout improvements
- [ ] Recurring tasks support
- [ ] Weekly finance report
- [ ] Habit streak milestones (notifications)
- [ ] Goal deadline reminders

---

## Version Roadmap

### v0.1 — MVP ✅
> *Core four trackers, working dashboard, basic auth*

- [x] Task, Finance, Habit, Goal trackers
- [x] Dashboard overview
- [x] Supabase Auth
- [x] Vercel deployment

### v0.2 — Beta 🔄
> *AI Agent, Quick Add, polish*

- [x] Gemini AI Action Agent
- [x] Quick Add Command Bar (⌘K)
- [x] Full UI/UX overhaul
- [x] Pastel gradient background system
- [x] Bug fixes: timezone, Select defaultValue, encoding
- [ ] Mobile responsiveness pass
- [ ] Error boundary and loading states audit

### v1.0 — Public Launch 📋
> *Production-ready, shareable, polished*

- [ ] Google OAuth login
- [ ] Apple Sign-In
- [ ] Onboarding flow for new users
- [ ] Email notifications (weekly digest)
- [ ] Dark mode
- [ ] Export data (CSV / JSON)
- [ ] PWA support
- [ ] Performance audit (Core Web Vitals)
- [ ] Full mobile layout

### v2.0 — AI Agent Upgrade 📋
> *Smarter, faster, more capable agent*

- [ ] Persistent AI memory across sessions
- [ ] Proactive AI suggestions (push)
- [ ] Voice input support
- [ ] AI-generated weekly review
- [ ] Pattern detection ("You spend most on food on Fridays")
- [ ] Smart scheduling (AI suggests task due dates)
- [ ] Multi-model fallback (Gemini → Claude)

### v3.0 — Team Workspace 📋
> *Shared productivity for small teams*

- [ ] Multi-user workspaces
- [ ] Shared goals
- [ ] Team finance tracking
- [ ] Role-based access control
- [ ] Activity feed
- [ ] Notifications + mentions
- [ ] Admin dashboard

---

## Backlog

| Feature | Priority | Notes |
|---------|----------|-------|
| Recurring tasks | High | Daily/weekly/monthly |
| Sub-tasks | Medium | Nested task hierarchy |
| Finance budgets | High | Monthly category limits |
| Habit streaks milestones | Medium | Badge system |
| Calendar view | Medium | Tasks + habits on calendar |
| Tags | Low | Cross-tracker tagging |
| API access | Low | Personal API keys |
| Zapier integration | Low | Webhook triggers |
| iCal export | Low | Sync with Apple/Google Calendar |

---

*See [Changelog](Changelog) for completed release notes.*
