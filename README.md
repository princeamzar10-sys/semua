# Semua

> "Everything" in Malay — a simple all-in-one personal productivity platform.

Live: [semua.vercel.app](https://semua.vercel.app)

---

## Features

- **Task Tracker** — Create, edit, delete tasks with priorities, statuses, due dates and overdue detection
- **Finance Tracker** — Log income and expenses, filter by month, view category breakdown chart
- **Habit Tracker** — Build daily/weekly habits, track streaks, mark completions with a 7-day grid
- **Goal Tracker** — Set targets, track progress with visual progress bars and deadline warnings
- **Dashboard** — Overview of all trackers with AI-powered suggestions
- **Google OAuth** — Sign in with Google via Supabase Auth

---

## Tech Stack

### Frontend
| Tool | Version |
|------|---------|
| Next.js (App Router + Turbopack) | 16.2.9 |
| React | 19 |
| TypeScript | ^5 |
| Tailwind CSS | v4 |
| Framer Motion | ^12 |
| shadcn/ui (via @base-ui/react) | latest |
| Lucide React | ^1 |

### Data & State
| Tool | Version |
|------|---------|
| TanStack Query | v5 |
| React Hook Form | v7 |
| Zod | v4 |

### Backend & Database
| Tool | Purpose |
|------|---------|
| Supabase | PostgreSQL + Auth + Row Level Security |
| @supabase/ssr | Server-side session management |

### Charts & Analytics
| Tool | Purpose |
|------|---------|
| Recharts | Finance pie chart |
| Vercel Analytics | Page view tracking |

### Auth
| Tool | Purpose |
|------|---------|
| Supabase Auth | Google OAuth |

### Deployment
| Tool | Purpose |
|------|---------|
| Vercel | Hosting + auto-deploy on push |
| GitHub | Source control |

### Fonts
- Satoshi via [Fontshare](https://www.fontshare.com)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/princeamzar10-sys/semua.git
cd semua
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set up the database

Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/        # Login page
│   ├── (dashboard)/         # Authenticated app
│   │   ├── dashboard/       # Main dashboard
│   │   ├── tasks/           # Task tracker
│   │   ├── finance/         # Finance tracker
│   │   ├── habits/          # Habit tracker
│   │   └── goals/           # Goal tracker
│   └── auth/callback/       # OAuth callback
├── components/
│   ├── landing/             # Landing page
│   ├── layout/              # Sidebar, Topbar
│   ├── dashboard/           # Stat cards
│   ├── ai/                  # AI widget
│   └── ui/                  # shadcn/ui components
├── hooks/                   # TanStack Query hooks
├── lib/                     # Supabase clients, utils, validations
└── types/                   # TypeScript types
```

---

## Database Schema

- `users` — Auth profiles
- `tasks` — Task tracker entries
- `finance_transactions` — Income and expense records
- `habits` — Habit definitions
- `habit_logs` — Daily completion logs
- `goals` — Goal entries with progress tracking
- `ai_suggestions` — Cached AI insight messages

All tables have Row Level Security (RLS) enabled — users can only access their own data.

---

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to `main` triggers an automatic deployment.
