-- ============================================================
-- SEMUA — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  description text,
  due_date    date,
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status      text not null default 'todo' check (status in ('todo', 'in_progress', 'completed', 'overdue')),
  category    text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- Auto mark overdue tasks
create or replace function public.mark_overdue_tasks()
returns void language plpgsql security definer as $$
begin
  update public.tasks
  set status = 'overdue', updated_at = now()
  where due_date < current_date
    and status not in ('completed', 'overdue');
end;
$$;

-- ============================================================
-- FINANCE TRANSACTIONS
-- ============================================================
create table if not exists public.finance_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  amount      numeric(12,2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists finance_user_id_idx on public.finance_transactions(user_id);
create index if not exists finance_date_idx on public.finance_transactions(date);
create index if not exists finance_type_idx on public.finance_transactions(type);

-- ============================================================
-- HABITS
-- ============================================================
create table if not exists public.habits (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  name           text not null,
  emoji          text not null default '🎯',
  frequency      text not null default 'daily' check (frequency in ('daily', 'weekly')),
  current_streak int not null default 0,
  longest_streak int not null default 0,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

create index if not exists habits_user_id_idx on public.habits(user_id);

-- ============================================================
-- HABIT LOGS
-- ============================================================
create table if not exists public.habit_logs (
  id           uuid primary key default uuid_generate_v4(),
  habit_id     uuid not null references public.habits(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  date         date not null,
  completed_at timestamptz not null default now(),
  unique(habit_id, date)
);

create index if not exists habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_date_idx on public.habit_logs(date);

-- Update streak after log change
create or replace function public.update_habit_streak(p_habit_id uuid)
returns void language plpgsql security definer as $$
declare
  v_streak     int := 0;
  v_max_streak int := 0;
  v_date       date := current_date;
  v_exists     boolean;
begin
  loop
    select exists(
      select 1 from public.habit_logs
      where habit_id = p_habit_id and date = v_date
    ) into v_exists;

    exit when not v_exists;

    v_streak := v_streak + 1;
    if v_streak > v_max_streak then v_max_streak := v_streak; end if;
    v_date := v_date - 1;
  end loop;

  update public.habits
  set current_streak = v_streak,
      longest_streak = greatest(longest_streak, v_streak),
      updated_at = now()
  where id = p_habit_id;
end;
$$;

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  title            text not null,
  target           numeric(12,2) not null,
  current_progress numeric(12,2) not null default 0,
  deadline         date,
  category         text,
  status           text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists goals_status_idx on public.goals(status);

-- ============================================================
-- AI SUGGESTIONS (cached)
-- ============================================================
create table if not exists public.ai_suggestions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  message    text not null,
  type       text not null,
  read       boolean not null default false,
  created_at timestamptz default now() not null
);

create index if not exists ai_suggestions_user_id_idx on public.ai_suggestions(user_id);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger set_finance_updated_at before update on public.finance_transactions for each row execute function public.set_updated_at();
create trigger set_habits_updated_at before update on public.habits for each row execute function public.set_updated_at();
create trigger set_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.goals enable row level security;
alter table public.ai_suggestions enable row level security;

-- USERS policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- TASKS policies
create policy "Users can CRUD own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FINANCE policies
create policy "Users can CRUD own transactions" on public.finance_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HABITS policies
create policy "Users can CRUD own habits" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HABIT LOGS policies
create policy "Users can CRUD own habit logs" on public.habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GOALS policies
create policy "Users can CRUD own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI SUGGESTIONS policies
create policy "Users can manage own suggestions" on public.ai_suggestions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
