# Deployment

> From local setup to production on Vercel.

**→ [Home](Home) · [Architecture](Architecture) · [Security](Security) · [Contributing](Contributing)**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Supabase Configuration](#supabase-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node |
| Git | any | [git-scm.com](https://git-scm.com) |
| Supabase account | — | [supabase.com](https://supabase.com) |
| Google AI Studio account | — | For Gemini API key |
| Vercel account | — | [vercel.com](https://vercel.com) |

---

## Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/semua.git
cd semua/semua

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Required variables

```env
# Supabase — get from: supabase.com → Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Gemini — get from: aistudio.google.com → Get API Key
GEMINI_API_KEY=AIza...
```

### Optional variables

```env
# Supabase service role key — only needed for admin scripts
# NEVER expose to client — bypasses RLS
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### `.env.example` template

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

---

## Supabase Configuration

### 1. Create a new Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) → New Project.

### 2. Run database migrations

Open the SQL Editor and run the migrations in order:

**Table: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users USING (auth.uid() = id);
```

**Table: tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_own" ON tasks USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);
```

**Table: finance_transactions**
```sql
CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_own" ON finance_transactions USING (auth.uid() = user_id);
CREATE POLICY "finance_insert" ON finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "finance_update" ON finance_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "finance_delete" ON finance_transactions FOR DELETE USING (auth.uid() = user_id);
```

**Table: habits**
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '✨',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily','weekly')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_own" ON habits USING (auth.uid() = user_id);
CREATE POLICY "habits_insert" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete" ON habits FOR DELETE USING (auth.uid() = user_id);
```

**Table: habit_logs**
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_own" ON habit_logs USING (auth.uid() = user_id);
CREATE POLICY "habit_logs_insert" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_logs_delete" ON habit_logs FOR DELETE USING (auth.uid() = user_id);
```

**Table: goals**
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target DECIMAL(12,2) NOT NULL DEFAULT 100,
  current_progress DECIMAL(12,2) DEFAULT 0,
  unit TEXT DEFAULT '%',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_own" ON goals USING (auth.uid() = user_id);
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (auth.uid() = user_id);
```

### 3. Create the user trigger

This auto-creates a `users` row when someone signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4. Enable email auth

Go to Authentication → Providers → Email → Enable.

---

## Vercel Deployment

### First deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd semua
vercel
```

Follow the prompts. Vercel auto-detects Next.js.

### Set environment variables on Vercel

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables.

Add each variable for **Production**, **Preview**, and **Development**:

| Variable | Environments |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All |
| `GEMINI_API_KEY` | All |

### Subsequent deployments

```bash
git add .
git commit -m "your changes"
git push origin main
```

Vercel auto-deploys on push to `main`.

### Preview deployments

Every pull request gets a unique preview URL. Preview deployments use the same environment variables. To use separate Supabase projects for preview vs production, create separate variable sets scoped to "Preview" in Vercel.

---

## Post-Deployment Checklist

- [ ] Visit production URL — login page loads
- [ ] Sign up with a new account
- [ ] Create a task, expense, habit, and goal
- [ ] Open AI Agent, send "summarize my dashboard"
- [ ] Send "add lunch expense RM15" → confirm → verify in Finance
- [ ] Check Vercel logs for any errors: `vercel logs --prod`
- [ ] Verify `GEMINI_API_KEY` is set in Vercel (AI Agent will 500 if missing)

---

## Troubleshooting

### AI Agent returns 500

**Cause:** `GEMINI_API_KEY` missing or invalid in Vercel.

**Fix:** Vercel dashboard → Settings → Environment Variables → add `GEMINI_API_KEY`.

### Login redirects loop

**Cause:** Supabase URL or anon key is wrong, or auth callback URL not configured.

**Fix:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase project.
2. In Supabase: Authentication → URL Configuration → add your Vercel domain to "Redirect URLs":
   ```
   https://your-app.vercel.app/**
   ```

### RLS errors / "permission denied"

**Cause:** RLS policies not created, or user session not passed to server client.

**Fix:** Re-run the SQL migrations above. Verify that `createServerClient` in `src/lib/supabase/server.ts` passes cookies correctly.

### Emoji shows as garbage characters

**Cause:** File was edited with PowerShell `Set-Content` which corrupts UTF-8 emoji.

**Fix:** Use `git checkout HEAD -- <file>` to restore the file, then re-apply only ASCII changes using Bash `sed`.

### Build fails with TypeScript errors

```bash
npm run build
```

Common fixes:
- Supabase `.data` type issues → add explicit type aliases before casting
- Missing imports → check `src/lib/tools/` files

---

*See also: [Architecture](Architecture) · [Security](Security) · [Contributing](Contributing)*
