# Folder Structure

> How the repository is organized and why.

**→ [Home](Home) · [Architecture](Architecture) · [Contributing](Contributing)**

---

## Table of Contents

- [Root](#root)
- [src/app](#srcapp)
- [src/components](#srccomponents)
- [src/hooks](#srchooks)
- [src/lib](#srclib)
- [src/types](#srctypes)
- [public](#public)
- [wiki](#wiki)
- [Naming Conventions](#naming-conventions)

---

## Root

```
semua/
├── src/                    # All application source code
├── public/                 # Static assets served at /
├── wiki/                   # Project documentation (this file)
├── image/                  # Source design assets (not served)
├── .env.local              # Local environment variables (gitignored)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── components.json         # shadcn/ui configuration
```

---

## src/app

Next.js App Router. Every folder is a route segment.

```
src/app/
├── (auth)/                 # Auth route group (no layout)
│   └── login/
│       └── page.tsx        # Login page
│
├── (dashboard)/            # Dashboard route group (shared layout)
│   ├── layout.tsx          # Auth guard + Sidebar + Topbar
│   ├── dashboard/
│   │   ├── page.tsx        # RSC: fetches user, renders DashboardClient
│   │   └── dashboard-client.tsx  # Client: TanStack Query, widgets
│   ├── tasks/
│   │   ├── page.tsx
│   │   └── tasks-client.tsx
│   ├── finance/
│   │   ├── page.tsx
│   │   └── finance-client.tsx
│   ├── habits/
│   │   ├── page.tsx
│   │   └── habits-client.tsx
│   ├── goals/
│   │   ├── page.tsx
│   │   └── goals-client.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   └── settings-client.tsx
│   └── assistant/
│       └── page.tsx        # AI Agent page (AssistantPanel)
│
├── api/
│   └── assistant/
│       ├── route.ts        # POST /api/assistant (Gemini)
│       └── execute/
│           └── route.ts    # POST /api/assistant/execute
│
├── globals.css             # Global styles, Tailwind imports
├── layout.tsx              # Root layout (html, body, QueryProvider)
└── page.tsx                # Landing page (/)
```

### Pattern: RSC + Client Split

Every page uses the **server-then-client** pattern:

```typescript
// page.tsx (RSC) — runs on server
export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <TasksClient user={user} />
}

// tasks-client.tsx (Client) — runs in browser
'use client'
export function TasksClient({ user }) {
  const { data: tasks } = useTasks()
  // ... interactive UI
}
```

The RSC handles auth and initial props. The client handles interactivity and data fetching via TanStack Query.

---

## src/components

Reusable UI components.

```
src/components/
├── layout/
│   ├── sidebar.tsx         # Main navigation sidebar
│   └── topbar.tsx          # Top header bar with title + avatar
│
├── assistant/
│   ├── AssistantPanel.tsx  # Full AI chat UI
│   ├── MessageBubble.tsx   # Individual message rendering
│   └── ConfirmationCard.tsx # Action confirmation UI
│
├── ai/
│   └── ai-widget.tsx       # Dashboard AI insights widget
│
├── ui/                     # shadcn/ui primitives (generated)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── sheet.tsx
│   ├── dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   └── ...
│
├── CommandBar.tsx          # Quick Add command bar (⌘K)
└── KeyboardShortcut.tsx    # Global ⌘K listener
```

### Rule

- `src/components/ui/` — Never edit. Regenerate with `npx shadcn add`.
- `src/components/layout/` — App shell, not feature-specific.
- `src/components/assistant/` — AI Agent UI components.

---

## src/hooks

Custom React hooks for data fetching.

```
src/hooks/
├── use-tasks.ts            # useTasks(), useCreateTask(), useUpdateTask(), useDeleteTask()
├── use-finance.ts          # useTransactions(), useCreateTransaction(), ...
├── use-habits.ts           # useHabits(), useHabitLogs(), useToggleHabit(), ...
└── use-goals.ts            # useGoals(), useCreateGoal(), ...
```

Every hook follows the same pattern:

```typescript
export function useTasks() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateTask() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (task: CreateTaskInput) => {
      const { error } = await supabase.from('tasks').insert(task)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
```

---

## src/lib

Utility functions, AI logic, and service clients.

```
src/lib/
├── supabase/
│   ├── client.ts           # createBrowserClient() for client components
│   └── server.ts           # createServerClient() for RSC/API routes
│
├── ai/
│   ├── gemini.ts           # Gemini client singleton + callGemini()
│   ├── prompts.ts          # buildSystemPrompt() with date injection
│   └── parser.ts           # parseGeminiResponse(), actionLabel(), isReadOnly()
│
├── router/
│   └── actionRouter.ts     # executeActions() — routes to tool executors
│
├── tools/
│   ├── tasks.ts            # executeTasks() — task CRUD
│   ├── finance.ts          # executeFinance() — finance CRUD
│   ├── habits.ts           # executeHabits() — habit CRUD + streak
│   └── goals.ts            # executeGoals() — goal CRUD
│
├── ai-suggestions.ts       # Client-side dashboard insight generation
├── parser.ts               # Rule-based NLP parser for Quick Add
├── commandHandler.ts       # Quick Add command executor
└── utils.ts                # cn() (Tailwind class merger)
```

---

## src/types

TypeScript type definitions shared across the app.

```
src/types/
└── database.ts             # Generated Supabase types (run: supabase gen types)
```

---

## public

Static files served at the root URL.

```
public/
├── bg.jpg                  # Pastel gradient background image
└── favicon.ico             # App icon
```

---

## wiki

Project documentation (this folder).

```
wiki/
├── Home.md
├── Product-Roadmap.md
├── Architecture.md
├── Database.md
├── Authentication.md
├── Dashboard.md
├── Trackers.md
├── AI-Assistant.md
├── API.md
├── Folder-Structure.md
├── UI-Design-System.md
├── Security.md
├── Deployment.md
├── Contributing.md
└── Changelog.md
```

---

## Naming Conventions

| Pattern | Example | Rule |
|---------|---------|------|
| Page RSC | `page.tsx` | Always `page.tsx`, no suffix |
| Page client | `dashboard-client.tsx` | `[route]-client.tsx` |
| Hooks | `use-tasks.ts` | `use-[resource].ts` |
| Components | `AssistantPanel.tsx` | PascalCase |
| Lib utilities | `commandHandler.ts` | camelCase |
| Tool executors | `tasks.ts` | noun, no prefix |
| API routes | `route.ts` | Always `route.ts` |

---

*See also: [Architecture](Architecture) · [Contributing](Contributing)*
