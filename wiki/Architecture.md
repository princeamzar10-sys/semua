# Architecture

> System design, data flow, and component relationships.

**→ [Home](Home) · [Database](Database) · [API](API) · [Folder Structure](Folder-Structure)**

---

## Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [AI Agent Architecture](#ai-agent-architecture)
- [Data Flow](#data-flow)
- [Request Lifecycle](#request-lifecycle)
- [Deployment Architecture](#deployment-architecture)

---

## Overview

Semua is a **full-stack Next.js application** using the App Router. The architecture separates concerns into:

- **React Server Components (RSC)** for initial data fetching and auth checks
- **Client Components** for interactive UI with TanStack Query for caching
- **Server-side API Routes** for all mutations and AI calls
- **Supabase** as the single source of truth for data and auth
- **Gemini** as a stateless intent classifier (never touches the DB directly)

```mermaid
graph TB
    subgraph Client["Browser"]
        RSC["React Server Components"]
        CC["Client Components"]
        TQ["TanStack Query Cache"]
    end

    subgraph Server["Vercel Edge / Node.js"]
        AR_API["/api/assistant"]
        EX_API["/api/assistant/execute"]
        AR["Action Router"]
    end

    subgraph AI["Google AI"]
        Gemini["Gemini 2.5 Flash"]
    end

    subgraph Data["Supabase"]
        Auth["Auth"]
        DB["PostgreSQL"]
        RLS["Row Level Security"]
    end

    RSC -->|"createServerClient"| Auth
    RSC -->|"server queries"| DB
    CC -->|"createBrowserClient"| DB
    CC -->|"mutations"| AR_API
    CC -->|"confirm actions"| EX_API
    AR_API -->|"callGemini()"| Gemini
    Gemini -->|"JSON response"| AR_API
    AR_API -->|"ParsedActions"| CC
    EX_API --> AR
    AR -->|"executeTools"| DB
    DB --- RLS
    TQ -->|"invalidateQueries"| CC
```

---

## Frontend Architecture

### Rendering Strategy

| Route | Strategy | Reason |
|-------|----------|--------|
| `/` (landing) | SSG | Static, no auth needed |
| `/login` | SSG | Static form |
| `/(dashboard)/*` | SSR → RSC | Auth check server-side |
| Client components | CSR with TanStack Query | Interactivity + caching |

### Component Hierarchy

```mermaid
graph TD
    Layout["DashboardLayout (RSC)<br/>auth check, sidebar"]
    Sidebar["Sidebar (Client)<br/>nav, collapse, CommandBar"]
    Topbar["Topbar (RSC)"]
    Page["Page (RSC)<br/>initial data fetch"]
    Client["*Client (Client)<br/>TanStack Query, mutations"]
    UI["shadcn/ui primitives"]

    Layout --> Sidebar
    Layout --> Topbar
    Layout --> Page
    Page --> Client
    Client --> UI
```

### State Management

- **Server state** → TanStack Query (`useQuery`, `useMutation`)
- **Local UI state** → React `useState` (modals, forms, filters)
- **Auth state** → Supabase session (server-side cookie)
- **No global store** (Redux, Zustand) — not needed at this scale

---

## Backend Architecture

### API Routes

All mutations and AI calls go through Next.js API routes (Server Components or Route Handlers). Direct Supabase writes from the client use the anon key with RLS enforcing user isolation.

```
app/
  api/
    assistant/
      route.ts         → POST /api/assistant (Gemini call)
      execute/
        route.ts       → POST /api/assistant/execute (action execution)
```

### Supabase Client Pattern

```typescript
// Server components / API routes
import { createServerClient } from '@supabase/ssr'
const supabase = createServerClient(url, key, { cookies })

// Client components
import { createBrowserClient } from '@supabase/ssr'
const supabase = createBrowserClient(url, key)
```

---

## AI Agent Architecture

The AI Agent is the most complex subsystem. Gemini's only job is **intent classification** — it never reads from or writes to the database.

```mermaid
sequenceDiagram
    participant U as User
    participant AP as AssistantPanel
    participant API as /api/assistant
    participant G as Gemini 2.5 Flash
    participant EX as /api/assistant/execute
    participant AR as Action Router
    participant DB as Supabase

    U->>AP: "Add lunch RM15 today"
    AP->>API: POST { message, history }
    API->>G: systemPrompt + history + message
    G-->>API: { type: "actions", actions: [...] }
    API-->>AP: ParsedActions
    AP->>U: Show ConfirmationCard
    U->>AP: Confirm
    AP->>EX: POST { actions }
    EX->>AR: executeActions(actions)
    AR->>DB: INSERT finance_transaction
    DB-->>AR: success
    AR-->>EX: ActionResult[]
    EX-->>AP: results
    AP->>U: Show success messages
```

### Action Router Flow

```mermaid
graph LR
    Input["ParsedAction[]"]
    Router{"Action Router"}
    T["executeTasks()"]
    F["executeFinance()"]
    H["executeHabits()"]
    G["executeGoals()"]
    RO["summarize / insights"]
    DB["Supabase DB"]

    Input --> Router
    Router -->|"create/complete/update/delete_task"| T
    Router -->|"create_expense/income"| F
    Router -->|"create/complete_habit"| H
    Router -->|"create/update_goal"| G
    Router -->|"summarize_dashboard/generate_insights"| RO
    T --> DB
    F --> DB
    H --> DB
    G --> DB
```

---

## Data Flow

### Read Flow (Dashboard load)

```mermaid
sequenceDiagram
    participant B as Browser
    participant RSC as Server Component
    participant SB as Supabase

    B->>RSC: GET /dashboard
    RSC->>SB: getUser() [cookie auth]
    SB-->>RSC: user
    RSC->>B: HTML + initial props
    B->>SB: useQuery (tasks, finance, habits, goals)
    SB-->>B: data (RLS filtered by user_id)
    B->>B: Render dashboard
```

### Write Flow (Create task)

```mermaid
sequenceDiagram
    participant U as User
    participant CC as Client Component
    participant SB as Supabase
    participant TQ as TanStack Query

    U->>CC: Submit form
    CC->>SB: INSERT tasks (anon key + RLS)
    SB-->>CC: { data, error }
    CC->>TQ: invalidateQueries(['tasks'])
    TQ->>SB: refetch
    SB-->>TQ: updated list
    TQ-->>CC: re-render
```

---

## Request Lifecycle

Every user interaction follows this pattern:

```mermaid
graph TD
    A["User Action"] --> B{"Type?"}
    B -->|"Read"| C["TanStack Query cache"]
    B -->|"Write (UI)"| D["useMutation → Supabase direct"]
    B -->|"AI command"| E["/api/assistant → Gemini"]
    C --> F["SWR / refetch"]
    D --> G["invalidateQueries"]
    E --> H["ParsedActions → ConfirmationCard"]
    H --> I["/api/assistant/execute → Action Router"]
    I --> J["Supabase write"]
    J --> G
    G --> K["UI re-render"]
```

---

## Deployment Architecture

```mermaid
graph LR
    Dev["Developer<br/>Local"]
    GH["GitHub<br/>main branch"]
    Vercel["Vercel<br/>Production"]
    SB["Supabase<br/>Cloud"]
    Google["Google AI<br/>Gemini API"]

    Dev -->|"git push"| GH
    GH -->|"auto deploy"| Vercel
    Vercel -->|"SUPABASE_URL + KEY"| SB
    Vercel -->|"GEMINI_API_KEY"| Google
```

Vercel handles:
- Build (`next build`)
- Edge/Node.js serverless functions
- Static asset CDN
- Environment variable injection

---

*See also: [Database](Database) · [AI Assistant](AI-Assistant) · [API](API)*
