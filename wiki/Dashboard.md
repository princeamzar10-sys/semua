# Dashboard

> The central hub of Semua — your daily overview at a glance.

**→ [Home](Home) · [Trackers](Trackers) · [AI Assistant](AI-Assistant)**

---

## Table of Contents

- [Philosophy](#philosophy)
- [Layout Structure](#layout-structure)
- [Widgets](#widgets)
- [Data Sources](#data-sources)
- [AI Insights Widget](#ai-insights-widget)
- [Performance Notes](#performance-notes)
- [Future Improvements](#future-improvements)

---

## Philosophy

The dashboard answers one question: **"What matters right now?"**

It is not a report. It is not a metrics page. It is a **daily briefing** — a 5-second read that tells you:
- What tasks need attention today
- Where your money went this month
- Which habits you're maintaining
- How close you are to your goals

Every widget earns its place by answering a question a user actually asks every morning.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Topbar: "Good morning, Amzar 👋"  [Date]  [Avatar] │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Tasks    │ │ Income   │ │ Expenses │ │ Habits │ │
│  │ Summary  │ │ This Mo  │ │ This Mo  │ │ Active │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────┐│
│  │  Today's Focus          │ │  Financial Snapshot  ││
│  │  (tasks due today)      │ │  (income vs expense) ││
│  └─────────────────────────┘ └─────────────────────┘│
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────┐│
│  │  Habit Status           │ │  Goal Progress       ││
│  │  7-day grid             │ │  active goals        ││
│  └─────────────────────────┘ └─────────────────────┘│
├─────────────────────────────────────────────────────┤
│  AI Insights                                        │
│  [dynamic suggestions based on your data]           │
└─────────────────────────────────────────────────────┘
```

---

## Widgets

### 1. Greeting Banner

- Time-aware: "Good morning" / "Good afternoon" / "Good evening"
- Shows first name from `user.full_name`
- Today's date in human format

### 2. Stat Summary Bar (4 cards)

| Card | Data Source | Metric |
|------|-------------|--------|
| Tasks | `tasks` table | Total tasks / completed this week |
| Income | `finance_transactions` | Sum of income this month |
| Expenses | `finance_transactions` | Sum of expenses this month |
| Habits | `habits` | Count of active habits |

### 3. Today's Focus

Lists tasks where `due_date === today` (string comparison) and `status !== 'completed'`.

```typescript
const todayStr = format(now, 'yyyy-MM-dd')
const todayTasks = tasks.filter(t =>
  t.due_date === todayStr && t.status !== 'completed'
)
```

> ⚠️ Uses string comparison, not `new Date()`, to avoid UTC timezone shift on non-UTC systems.

### 4. Financial Snapshot

- Shows monthly income vs expenses
- Progress bar: `expenses / income * 100%`
- Color coding: green (< 80%), amber (80–100%), red (> 100%)

### 5. Habit Status — 7-Day Grid

Displays the last 7 days for each habit as filled/empty circles.

```typescript
const last7 = Array.from({ length: 7 }, (_, i) =>
  format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
)
```

Habit logs are fetched with a 30-day window to ensure the grid is always populated:

```typescript
const { data: habitLogs } = useHabitLogs(
  format(subDays(new Date(), 30), 'yyyy-MM-dd')
)
```

### 6. Goal Progress

Lists all active goals (`status === 'active'`) with:
- Progress bar: `current_progress / target * 100%`
- Percentage label
- Days remaining to deadline

### 7. AI Insights Widget

Calls `generateSuggestions()` from `src/lib/ai-suggestions.ts` with all tracker data. Returns an array of insight strings.

Example insights generated:
- "You have 3 overdue tasks — consider reprioritizing."
- "Expenses are 94% of income this month — watch spending."
- "Your gym streak is at 7 days — keep it up!"

---

## Data Sources

The dashboard client fetches all data in parallel via TanStack Query:

```typescript
const { data: tasks = [] } = useTasks()
const { data: transactions = [] } = useTransactions()
const { data: habits = [] } = useHabits()
const { data: habitLogs = [] } = useHabitLogs(thirtyDaysAgo)
const { data: goals = [] } = useGoals()
```

All hooks use the browser Supabase client. RLS ensures each user only receives their own data.

---

## AI Insights Widget

Located in `src/components/ai/ai-widget.tsx`. Pure client-side computation — no API call needed. It runs `generateSuggestions(tasks, transactions, habits, habitLogs, goals)` and renders the results.

Logic includes:
- Overdue task detection: `isPast(parseISO(t.due_date)) && !isToday(...) && t.status !== 'completed'`
- Finance ratio: `expenses / income`
- Habit consistency: days completed in last 7
- Goal proximity: `(target - current) / target`

---

## Performance Notes

- All dashboard queries run in parallel (not sequential)
- TanStack Query caches for `staleTime: 60_000` (1 minute)
- `habitLogs` is fetched with a date filter (30 days) to avoid loading all history
- No `useEffect` for data — all via `useQuery`

---

## Future Improvements

- [ ] Drag-and-drop widget reordering
- [ ] Widget visibility toggles (hide/show)
- [ ] Weekly/monthly view toggle
- [ ] Notification bell (overdue tasks, missed habits)
- [ ] Quick-complete tasks from dashboard
- [ ] Spending forecast for the rest of the month
- [ ] Streak milestones celebration animation

---

*See also: [Trackers](Trackers) · [AI Assistant](AI-Assistant)*
