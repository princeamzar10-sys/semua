# Semua — Architecture Map

> Updated after the Personal/Workspace mode switch was built and `tasks/finance/habits/goals` were physically nested under `features/personal/`. See [wiki/Changelog.md](wiki/Changelog.md) for prior history and [wiki/Folder-Structure.md](wiki/Folder-Structure.md) for the older (pre-Personal-OS) layout this document supersedes.

---

## 1. Folder Tree & Explanations

```
semua/
├── ARCHITECTURE.md          # this file
├── src/
│   ├── app/                          # Next.js App Router — ROUTES ONLY
│   │   ├── (auth)/login/page.tsx     # /login — public auth page
│   │   ├── (dashboard)/              # authenticated route group, shared layout
│   │   │   ├── layout.tsx            # auth guard + ModeProvider + QuickAddProvider + top mode bar + Sidebar/MobileBottomNav shell
│   │   │   ├── dashboard/{page.tsx, dashboard-client.tsx}
│   │   │   ├── tasks/{page.tsx, tasks-client.tsx}
│   │   │   ├── finance/{page.tsx, finance-client.tsx}
│   │   │   ├── habits/{page.tsx, habits-client.tsx}
│   │   │   ├── goals/{page.tsx, goals-client.tsx}
│   │   │   ├── settings/{page.tsx, settings-client.tsx}
│   │   │   ├── assistant/page.tsx    # AI Agent page (live Gemini integration)
│   │   │   └── workspace/page.tsx    # Workspace placeholder route
│   │   ├── api/assistant/{route.ts, execute/route.ts}   # Gemini + action execution endpoints
│   │   ├── auth/callback/route.ts    # Supabase OAuth callback
│   │   ├── layout.tsx, global-error.tsx, page.tsx
│   │
│   ├── features/                     # FEATURE-BASED MODULES, one per operating mode or cross-cutting concern
│   │   ├── personal/                 # 🏠 Personal mode — everything that was once top-level trackers now lives here
│   │   │   ├── nav.config.ts         # personalNavSections — registered into nav-registry, not hardcoded in the sidebar
│   │   │   ├── tasks/      {components, hooks, services, types}
│   │   │   ├── finance/    {components, hooks, services, types}
│   │   │   ├── habits/     {components, hooks, services, types}
│   │   │   └── goals/      {components, hooks, services, types}
│   │   ├── workspace/                # 💼 Workspace mode — placeholder only
│   │   │   ├── nav.config.ts         # workspaceNavSections (all disabled "Soon" items except Dashboard/Assistant/Settings)
│   │   │   └── components/WorkspacePlaceholder.tsx
│   │   ├── dashboard/     {components}            # StatCard, ai-widget — dashboard-only presentational pieces, used by Personal's dashboard
│   │   ├── ai-assistant/  {components, lib, lib/tools}  # Gemini client, mode-aware prompts, response parser, Action Router, per-domain tool executors
│   │   ├── authentication/{services}              # Supabase client/server/middleware builders — the one feature everything else may depend on
│   │   └── command-bar/   {components, lib}        # Quick Add: NL parser + direct-insert handler, triggered via shared QuickAddContext
│   │
│   ├── components/                   # TRULY CROSS-FEATURE, presentational-only — shared by both Personal and Workspace
│   │   ├── ui/                       # shadcn primitives (button, dialog, select, ...) — never hand-edited
│   │   ├── layout/                   # Topbar, Providers — per-page chrome, used by every route
│   │   ├── sidebar/                  # Sidebar.tsx (mode-aware, registry-driven), MobileBottomNav.tsx
│   │   ├── mode-switch/              # ModeSwitch.tsx — the Personal/Workspace segmented control
│   │   ├── navigation/               # mode-context.tsx (ModeProvider/useMode), quick-add-context.tsx (QuickAddProvider/useQuickAdd), nav-registry.ts (NavItem/NavSection types + getNavSections())
│   │   ├── quick-add/                # QuickAddFAB.tsx, QuickAddRoot.tsx — single shared CommandBar mount + floating trigger
│   │   └── landing/                  # Public landing page sections
│   │
│   ├── constants/                    # Shared, single-source-of-truth values
│   │   ├── categories.ts             # expense/income categories + currency symbol + guessCategory()
│   │   ├── habit-emoji.ts            # merged emoji keyword map + guessHabitEmoji()
│   │   └── priority.ts               # task priority options + color classes
│   │
│   ├── utils/                        # Shared, pure helper functions
│   │   ├── format-currency.ts        # formatCurrency(amount, decimals?)
│   │   ├── date-range.ts             # getMonthRange(date?)
│   │   └── find-by-name.ts           # generic Supabase fuzzy-lookup-by-name helper
│   │
│   ├── lib/                          # Cross-cutting, framework-level utilities (NOT feature-specific)
│   │   ├── utils.ts                  # cn() — shadcn's required Tailwind class merger
│   │   ├── validations.ts            # Zod schemas (taskSchema, transactionSchema, habitSchema, goalSchema) — shared by every Personal module's forms
│   │   └── ai-suggestions.ts         # rule-based dashboard suggestion engine (heuristics, not LLM)
│   │
│   ├── types/index.ts                # ONLY truly global types: User, AISuggestion, DashboardStats
│   └── proxy.ts                      # Next.js middleware entry point (fixed path, required by framework)
│
├── public/bg.jpg                     # dashboard background image
└── wiki/                             # GitHub Wiki documentation (15 pages)
```

### Why this shape

- **`features/personal/{tasks,finance,habits,goals}`** are physically nested — a deliberate change from the prior version of this document, which kept them at top-level `src/features/*` to protect feature-independence. That tradeoff was revisited and the literal mode-ownership tree was adopted instead: these four are Personal-mode-only modules and now live where they conceptually belong. The independence rule itself (point 2 in the Dependency Graph below) still holds — they still never import each other, they're just colocated under their owning mode now.
- **`features/workspace`** mirrors `features/personal`'s shape at the mode level (`nav.config.ts` + its own components) so that when real Workspace modules (Projects, Meetings, etc.) are built, each becomes `features/workspace/<module>/{components,hooks,services,types}` — exactly the same pattern Personal already demonstrates.
- **`components/navigation`, `components/mode-switch`, `components/quick-add`, `components/sidebar`** are mode-switching infrastructure — they know about *both* modes (via the registry) but contain no Personal- or Workspace-specific business logic themselves. This is what "shared infrastructure stays outside the mode folders" means in practice.
- **`components/`** (the rest) is reserved for things with zero feature-specific knowledge — shadcn primitives and per-page chrome. If a component imports a feature hook or service, it belongs inside that feature's `components/`, not here.
- **`constants/` and `utils/`** hold values and pure functions used by *more than one* feature/mode.
- **`lib/`** is intentionally small and is for things tied to the framework/build toolchain (`cn()` is a shadcn CLI convention) or truly used everywhere (`validations.ts`).

---

## 2. Dependency Graph

Arrows mean "imports from." Built by grepping every `@/features/*` and `@/components/{navigation,mode-switch,quick-add,sidebar}/*` import across the tree.

```mermaid
graph LR
    APP["src/app/* (routes)"]

    subgraph Personal Mode
        TASKS[personal/tasks]
        FINANCE[personal/finance]
        HABITS[personal/habits]
        GOALS[personal/goals]
        PNAV[personal/nav.config]
    end

    subgraph Workspace Mode
        WPLACEHOLDER[workspace/components]
        WNAV[workspace/nav.config]
    end

    subgraph Cross-cutting Features
        AUTH[authentication]
        CMDBAR[command-bar]
        AI[ai-assistant]
        DASH[dashboard]
    end

    subgraph Mode-switching Infrastructure
        NAVREG["components/navigation (mode-context, quick-add-context, nav-registry)"]
        MODESWITCH[components/mode-switch]
        QUICKADD[components/quick-add]
        SIDEBAR[components/sidebar]
    end

    APP --> TASKS
    APP --> FINANCE
    APP --> HABITS
    APP --> GOALS
    APP --> AI
    APP --> CMDBAR
    APP --> DASH
    APP --> AUTH
    APP --> WPLACEHOLDER

    TASKS --> AUTH
    FINANCE --> AUTH
    HABITS --> AUTH
    GOALS --> AUTH
    CMDBAR --> AUTH

    NAVREG --> PNAV
    NAVREG --> WNAV
    SIDEBAR --> NAVREG
    MODESWITCH --> NAVREG
    QUICKADD --> NAVREG
    QUICKADD --> CMDBAR

    AI -.->|"via API route, not direct import"| AUTH
```

### Rules this graph reveals (and should stay true going forward)

1. **`authentication` is the only feature every other feature is allowed to depend on.** It has zero dependencies itself — it's the foundation (Supabase client/server/middleware builders).
2. **`personal/tasks`, `personal/finance`, `personal/habits`, `personal/goals` never import each other**, even though they're now siblings under the same mode folder. Each is fully self-contained (own hook, service, types, components). This is what makes them safe to delete or replace independently — nesting them under `personal/` changed *where* they live, not *how* they're allowed to depend on one another.
3. **`ai-assistant` does not import domain features directly.** It receives an already-authenticated Supabase client inside the API route (`src/app/api/assistant/*`) and talks to `tasks`/`finance`/`habits`/`goals` tables only through its own `lib/tools/*.ts` executors — it does NOT call into `features/personal/tasks/services/*`. The AI tool executors have different validation/fuzzy-lookup needs than the UI hooks, so they stay separate rather than sharing a service layer. **This is the one place a future "shared domain service" consolidation could pay off** (see Technical Debt). `buildSystemPrompt(mode)` is mode-aware (Personal gets full tool access, Workspace gets a conversational-only prompt) but still doesn't import Personal/Workspace feature code — mode is passed as a plain string parameter from `AssistantPanel` via `useMode()`.
4. **`command-bar` depends on `authentication` only** — it does its own direct Supabase inserts rather than calling Personal's feature services. `components/quick-add` wraps it (shared trigger context + floating button) without `command-bar` needing to know about modes at all.
5. **`dashboard`** has no feature dependencies — it only holds presentational components (`StatCard`, `ai-widget`) that receive data as props from `dashboard-client.tsx` (which lives in `app/(dashboard)/dashboard/`, not inside `features/personal/`, since it composes data from all four Personal modules at the route level — composition root, not a feature itself).
6. **Mode-switching infrastructure (`components/navigation`, `mode-switch`, `quick-add`, `sidebar`) is the only code allowed to import from *both* `features/personal` and `features/workspace`** (via their `nav.config.ts` exports) — this is the intentional, single crossing point between the two modes. No other file should import from both.

---

## 3. Technical Debt Report

| # | Item | Where | Severity | Why it exists / why it's not fixed yet |
|---|------|-------|----------|------------------------------------------|
| 1 | `ai-assistant/lib/tools/*.ts` has 11+ repeated "find record by name" Supabase lookups instead of using `utils/find-by-name.ts` | `features/ai-assistant/lib/tools/{tasks,finance,habits,goals}.ts` | Low-Medium | The shared `findByName()` util normalizes error message text (e.g. lowercase singular table name); each tool's current error message has slightly different, hand-tuned wording (`"Task X not found"` vs others). Wiring it in would be a user-visible string change, which violates the "no behavior change" constraint of this refactor. **Action:** normalize error message format intentionally in a follow-up PR, then swap all 11 call sites to `findByName()`. |
| 2 | `command-bar`'s legacy `commandHandler.ts` duplicates business logic already in `ai-assistant/lib/tools/*` | `features/command-bar/lib/commandHandler.ts` | Medium | Two independent code paths exist for "create a task/expense/habit/goal from text": the Cmd+K quick-add (rule-based parser → direct insert) and the AI Agent (Gemini → Action Router → tool executor). They evolved separately and were kept separate during this refactor on purpose. **Action:** before adding more trackers, decide whether Quick Add should be rebuilt on top of the Action Router (one source of truth) or kept as an intentionally-simpler fallback path. |
| 3 | `lib/ai-suggestions.ts` (rule-based dashboard suggestions) duplicates logic conceptually similar to `ai-assistant/lib/actionRouter.ts`'s `generateInsights()` | `src/lib/ai-suggestions.ts`, `features/ai-assistant/lib/actionRouter.ts` | Low | Both compute "things worth telling the user" from the same tables, with different heuristics (one heuristic/local, one server-side for the AI Agent's `generate_insights` action). Not unified because they serve different UI surfaces (dashboard widget vs. chat response) with different freshness/format needs. **Action:** consider a single `insights` domain service feeding both once a Personal/Workspace module needs the same pattern. |
| 4 | No automated test suite | whole repo | Medium-High | Pre-existing, not introduced by this refactor. Verification during the refactor relied on `npm run build` (type safety) + manual route walkthrough + verbatim-copy discipline. **Action:** as features stabilize post-refactor, add unit tests for `services/*.ts` (pure, easy to test — they're now isolated from React) and `constants`/`utils` (pure functions, no excuse not to test these first). |
| 5 | `react-hooks/set-state-in-effect` lint warnings in `CommandBar.tsx` | `features/command-bar/components/CommandBar.tsx:95,104` | Low | Pre-existing (confirmed via `git show HEAD` — not introduced by the move). Calling `setState` synchronously inside `useEffect` for the real-time parse preview and the focus-on-open behavior. Functionally fine today but flagged by React Compiler. **Action:** low priority, but a good first test case for #4 above before touching the logic. |
| 6 | Unescaped quote/apostrophe characters in JSX (`react/no-unescaped-entities`) | `landing-page.tsx`, `CommandBar.tsx`, `dashboard-client.tsx` | Cosmetic | Pre-existing lint noise, no runtime impact. Cheap to fix opportunistically next time those files are touched. |
| 7 | No dark mode despite CSS variables already supporting it | `src/app/globals.css` (`.dark` class defined, unused) | Low | Documented as a known gap in [wiki/UI-Design-System.md](wiki/UI-Design-System.md); unrelated to this refactor but worth tracking here since Personal/Workspace modules will multiply the UI surface that eventually needs theming. |
| 8 | No rate limiting on `/api/assistant*` routes | `src/app/api/assistant/*` | Medium | Documented in [wiki/Security.md](wiki/Security.md); becomes more important as more AI-driven modules are added (more attack surface, more cost exposure per user). |

---

## 4. Performance Report

### What changed (refactor-driven)

| Area | Before | After | Effect |
|------|--------|-------|--------|
| Hook → DB coupling | Hooks called `.from(...)` directly inline | Hooks call named `service.ts` functions | **Neutral on runtime perf** — same query, same network call. Benefit is testability/maintainability, not speed. |
| Component size | 5 client pages averaging ~270 lines with all dialogs/cards inlined | Dialogs/cards extracted to dedicated files, pages now ~150-190 lines | **Likely small positive** — smaller component bodies mean React can bail out of re-rendering unrelated JSX trees more easily when state changes inside an extracted child, since each extracted component now has its own render boundary. Not yet measured with React DevTools Profiler. |
| Currency/date formatting | Recomputed inline with `toFixed()`/`date-fns` calls scattered across 5 files | Centralized in `utils/format-currency.ts`, `utils/date-range.ts` | **Neutral** — same computation cost, just deduplicated source. |
| Bundle size | N/A (reorg doesn't add/remove dependencies) | N/A | **No change** — zero new npm packages added; this was a structural refactor only. |

### Not addressed in this pass (flagged, not fixed — would be behavior/perf-tuning, out of scope for a "no functional change" refactor)

- **No memoization audit performed.** None of the extracted components (`TaskCard`, `TransactionDialog`, `GoalDialog`, `HabitDialog`, etc.) were wrapped in `React.memo`, and none of the list-rendering call sites (`tasks.map(...)`, etc.) were checked for unnecessary re-renders. Worth a dedicated profiling pass before Personal/Workspace adds significantly more list-heavy UI.
- **No code-splitting / dynamic import changes.** `AssistantPanel`, `CommandBar`, and chart-heavy `finance-client.tsx` (Recharts) are still bundled into their route chunks normally. Recharts in particular is a reasonable `next/dynamic` candidate if Finance's initial load time becomes a concern.
- **No Supabase query optimization.** All queries still `select('*')` rather than selecting only needed columns; this was true before the refactor and stayed true (changing it would alter the data shape returned to hooks — out of scope for "same behavior").
- **Build time:** `npm run build` completes in ~11-13s compile + ~12-15s typecheck on this machine post-refactor — comparable to pre-refactor (not separately benchmarked before/after, since the file count change alone wouldn't be expected to move this number meaningfully at this codebase size).

### Recommendation before Personal/Workspace land

Do a real profiling pass (React DevTools Profiler + Lighthouse) once 1-2 more feature modules exist, rather than guessing now — premature optimization here would fight the "no behavior change" constraint of this refactor. The structural work in this pass (small components, isolated services) is what makes that future profiling pass *actionable* (you can now memoize one component at a time without untangling a 300-line file first).

---

## 5. Using This Document for New Modules

When adding a new **Personal** module (e.g. Calendar, Tax) or a real **Workspace** module (e.g. Projects, Meetings):

1. Create `src/features/<mode>/<module>/{components,hooks,services,types}` — e.g. `features/personal/calendar/` or `features/workspace/projects/` — only the subfolders you actually need. Follow the exact shape `features/personal/tasks/` already demonstrates.
2. The new module may depend on `authentication` and on shared `constants/`/`utils/`/`lib/`. It should **not** depend on sibling modules in the same mode (`personal/tasks` ↔ `personal/finance`, etc.) or reach across modes (`personal/*` ↔ `workspace/*`) — if cross-module data sharing is needed, surface it through a route-level composition (like `dashboard-client.tsx` does today) rather than a module-to-module import.
3. Register the module's nav entry in `features/<mode>/nav.config.ts` (not hardcoded in `Sidebar.tsx` or `MobileBottomNav.tsx` — both are registry-driven via `getNavSections()`). Use the `NavItem` fields (`description`, `visible`, `badge`, `disabled`) as needed; leave `visible: false` items registered-but-hidden if you want to ship code ahead of UI exposure.
4. If the new module needs AI actions, add executors under `features/ai-assistant/lib/tools/<module>.ts` and register them in `actionRouter.ts` + extend `buildSystemPrompt(mode)` in `prompts.ts` for the relevant mode branch — do not create a second AI integration path, and do not have the tool executor import the module's UI service layer (same reasoning as point 3 in the Dependency Graph).
5. Reuse `formatCurrency`, `getMonthRange`, `findByName`, and the `constants/priority.ts`-style pattern for any new shared enums.
