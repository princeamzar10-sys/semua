# Contributing

> How to work on Semua effectively.

**→ [Home](Home) · [Folder Structure](Folder-Structure) · [Deployment](Deployment) · [Changelog](Changelog)**

---

## Table of Contents

- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Style](#commit-style)
- [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Common Patterns](#common-patterns)
- [What Not to Do](#what-not-to-do)

---

## Development Workflow

```bash
# 1. Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feat/task-subtasks

# 2. Run the dev server
npm run dev

# 3. Make changes, verify in browser

# 4. Type check
npm run build   # catches TypeScript errors before commit

# 5. Stage and commit
git add src/...
git commit -m "feat(tasks): add subtask support"

# 6. Push and open PR
git push origin feat/task-subtasks
```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<topic>` | `feat/habit-reminders` |
| Bug fix | `fix/<topic>` | `fix/ai-agent-auth` |
| Refactor | `refactor/<topic>` | `refactor/finance-hooks` |
| Documentation | `docs/<topic>` | `docs/api-reference` |
| Chore | `chore/<topic>` | `chore/update-deps` |

---

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

**Types:**

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, missing semi-colons, etc. |
| `docs` | Documentation only |
| `chore` | Build process, dependencies |
| `perf` | Performance improvement |

**Scopes:** `tasks`, `finance`, `habits`, `goals`, `ai-agent`, `auth`, `layout`, `db`, `api`

**Examples:**
```
feat(ai-agent): add voice input support
fix(finance): correct monthly total calculation
refactor(habits): extract streak logic to utility function
docs(wiki): add deployment troubleshooting section
chore: update @google/genai to 1.4.0
```

---

## Pull Requests

### PR title

Same format as commit messages:
```
feat(goals): add deadline reminder notifications
```

### PR description template

```markdown
## What
Brief description of what changed.

## Why
The reason for the change — user pain point, bug report, etc.

## How
Key implementation decisions.

## Testing
- [ ] Tested locally on dev server
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Tested the golden path (create → read → update → delete)
- [ ] Tested edge cases (empty states, validation errors)
```

### Review checklist

- [ ] No hardcoded secrets or API keys
- [ ] No `console.log` left in production code
- [ ] TypeScript — no `any` casts without a comment explaining why
- [ ] RLS — new tables have policies created
- [ ] New API routes check `auth.getUser()` before processing
- [ ] Components added to the right folder (see [Folder Structure](Folder-Structure))

---

## Coding Standards

### TypeScript

Strict mode is on. Obey it.

```typescript
// Good: explicit types where they aren't inferred
const tasks: Task[] = data ?? []

// Bad: silence the compiler
const tasks = data as any

// Good: narrow types before use
if (!user) return null

// Bad: non-null assertion without certainty
const id = user!.id
```

Supabase `.data` returns `any[]`. Cast it explicitly:

```typescript
type TaskRow = { id: string; status: string }
const rows: TaskRow[] = (data ?? []) as TaskRow[]
```

### React / Next.js

- New pages: follow the RSC + client split pattern (see [Folder Structure](Folder-Structure))
- Keep server components lean — auth check + pass props
- All interactivity in client components with `'use client'`
- Data fetching in hooks (`src/hooks/`) using TanStack Query

```typescript
// Good: hook handles all data fetching
const { data: tasks, isLoading } = useTasks()

// Bad: fetch directly in component body
const [tasks, setTasks] = useState([])
useEffect(() => { fetch('/api/tasks').then(...) }, [])
```

### Styling

Tailwind only. No inline styles except where dynamic values require it.

```tsx
// Good: Tailwind
<div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

// OK: dynamic value only
<div style={{ width: `${progress}%` }}>

// Bad: inline style for static value
<div style={{ backgroundColor: 'white', borderRadius: '16px' }}>
```

Don't use Framer Motion `whileHover` for color changes on navigation elements — use Tailwind `hover:` instead. See [UI Design System](UI-Design-System#animation-principles).

### Comments

Write no comments by default. Add one only when the WHY is non-obvious:

```typescript
// Good: explains a non-obvious constraint
// String comparison is intentional — avoids UTC midnight shift from new Date()
const isDue = task.due_date <= today

// Bad: explains what the code already says
// Filter tasks by status
const completed = tasks.filter(t => t.status === 'completed')
```

---

## Testing Guidelines

Currently no automated test suite. Before merging:

1. **TypeScript build passes:** `npm run build` — catches type errors and import problems.
2. **Manual golden path test:** for the feature you changed, walk through the full CRUD flow in the browser.
3. **Regression check:** verify adjacent features still work (e.g., if you touched the habit hook, confirm Finance and Tasks still load).

Future: unit tests for utility functions (`src/lib/`), integration tests for API routes.

---

## Common Patterns

### Adding a new tracker page

1. Create `src/app/(dashboard)/<tracker>/page.tsx` (RSC)
2. Create `src/app/(dashboard)/<tracker>/<tracker>-client.tsx` (Client)
3. Create `src/hooks/use-<tracker>.ts`
4. Add nav item to `src/components/layout/sidebar.tsx`
5. Add DB table + RLS policies in Supabase SQL Editor
6. Update [Database](Database) and [Trackers](Trackers) wiki pages

### Adding a new AI action

1. Define the action type in `src/lib/ai/parser.ts` (`ActionType` union)
2. Add a case to `src/lib/router/actionRouter.ts` routing to the correct executor
3. Add the handler in the relevant `src/lib/tools/<domain>.ts`
4. Add an example to the system prompt in `src/lib/ai/prompts.ts`
5. Update [AI-Assistant](AI-Assistant) wiki page

### Adding a new API route

1. Create `src/app/api/<path>/route.ts`
2. Always start with auth check:
   ```typescript
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   ```
3. Return typed JSON responses
4. Document in [API](API) wiki page

---

## What Not to Do

| Don't | Do instead |
|-------|-----------|
| Use `Set-Content` in PowerShell for files with emoji | Use `git checkout` to restore, then Bash `sed` for ASCII changes |
| Add `motion.div` with `whileHover` color changes on nav items | Use Tailwind `hover:` classes |
| Commit `.env.local` | Use Vercel environment variables for production secrets |
| Trust Gemini-provided IDs for DB operations | Look up IDs from the DB using `ilike` name matching |
| Use `any` to silence TypeScript | Add a proper type alias and cast |
| Skip the auth check in a new API route | Always verify session before processing |
| Push directly to `main` | Open a PR |

---

*See also: [Folder Structure](Folder-Structure) · [Deployment](Deployment) · [Changelog](Changelog)*
