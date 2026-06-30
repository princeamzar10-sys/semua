'use client'

import { useMemo } from 'react'
import { isToday, parseISO } from 'date-fns'
import {
  CalendarClock, AlarmClock, StickyNote, FileText, Bell, Sparkles, Activity,
  PanelRightClose, PanelRightOpen, Flame, Receipt,
} from 'lucide-react'
import { useMode } from '@/components/navigation/mode-context'
import { usePanel } from '@/providers/panel-provider/panel-context'
import { useTasks } from '@/features/personal/tasks/hooks/use-tasks'
import { useTransactions } from '@/features/personal/finance/hooks/use-finance'
import { useHabits } from '@/features/personal/habits/hooks/use-habits'
import { useGoals } from '@/features/personal/goals/hooks/use-goals'
import { getMonthRange } from '@/utils/date-range'
import { formatCurrency } from '@/utils/format-currency'
import {
  MOCK_MEETINGS, MOCK_DEADLINES, MOCK_PINNED_NOTES, MOCK_RECENT_FILES,
  MOCK_NOTIFICATIONS, MOCK_AI_SUGGESTIONS, MOCK_RECENT_ACTIVITY,
} from '@/lib/workspace/mock-data'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className="text-gray-300" />
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function WorkspacePanel() {
  return (
    <>
      <Section icon={CalendarClock} title="Today's Agenda">
        {MOCK_MEETINGS.slice(0, 2).map(m => (
          <p key={m.id} className="text-xs text-gray-600">{m.time.split(',')[1]?.trim() ?? m.time} — {m.title}</p>
        ))}
      </Section>
      <Section icon={AlarmClock} title="Upcoming Deadlines">
        {MOCK_DEADLINES.map(d => (
          <p key={d.id} className="text-xs text-gray-600">{d.label} <span className="text-gray-400">· {d.dueLabel}</span></p>
        ))}
      </Section>
      <Section icon={StickyNote} title="Pinned Notes">
        {MOCK_PINNED_NOTES.map(n => <p key={n.id} className="text-xs text-gray-600 truncate">{n.title}</p>)}
      </Section>
      <Section icon={FileText} title="Recent Files">
        {MOCK_RECENT_FILES.map(f => <p key={f.id} className="text-xs text-gray-600 truncate">{f.name}</p>)}
      </Section>
      <Section icon={Bell} title="Notifications">
        {MOCK_NOTIFICATIONS.map(n => (
          <p key={n.id} className="text-xs text-gray-600">{n.message} <span className="text-gray-400">· {n.time}</span></p>
        ))}
      </Section>
      <Section icon={Sparkles} title="AI Suggestions">
        {MOCK_AI_SUGGESTIONS.map(s => <p key={s.id} className="text-xs text-gray-600">{s.message}</p>)}
      </Section>
      <Section icon={Activity} title="Recent Activity">
        {MOCK_RECENT_ACTIVITY.map(a => <p key={a.id} className="text-xs text-gray-600">{a.emoji} {a.label} — {a.sublabel}</p>)}
      </Section>
    </>
  )
}

function PersonalPanel() {
  const { data: tasks = [] } = useTasks()
  const { data: transactions = [] } = useTransactions()
  const { data: habits = [] } = useHabits()
  const { data: goals = [] } = useGoals()

  const todaysTasks = useMemo(
    () => tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'completed'),
    [tasks]
  )

  const recentActivity = useMemo(() => {
    type Item = { id: string; label: string; sublabel: string; emoji: string; timestamp: string }
    const items: Item[] = [
      ...tasks.filter(t => t.status === 'completed').slice(0, 5).map(t => ({
        id: `t-${t.id}`, label: t.title, sublabel: 'Task completed', emoji: '✅', timestamp: t.updated_at,
      })),
      ...transactions.slice(0, 5).map(t => ({
        id: `x-${t.id}`, label: t.title, sublabel: t.type === 'income' ? 'Income logged' : 'Expense logged',
        emoji: t.type === 'income' ? '💰' : '💸', timestamp: t.created_at,
      })),
      ...goals.filter(g => g.status === 'completed').slice(0, 5).map(g => ({
        id: `g-${g.id}`, label: g.title, sublabel: 'Goal completed', emoji: '🏆', timestamp: g.updated_at,
      })),
    ]
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4)
  }, [tasks, transactions, goals])

  const topCategory = useMemo(() => {
    const { start, end } = getMonthRange(new Date())
    const monthly = transactions.filter(t => t.date >= start && t.date <= end && t.type === 'expense')
    const byCategory = monthly.reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc }, {} as Record<string, number>)
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    return sorted[0]
  }, [transactions])

  const longestStreak = useMemo(() => {
    if (habits.length === 0) return null
    return habits.reduce((best, h) => h.current_streak > best.current_streak ? h : best, habits[0])
  }, [habits])

  return (
    <>
      <Section icon={CalendarClock} title="Today's Agenda">
        {todaysTasks.length === 0
          ? <p className="text-xs text-gray-400">Nothing due today</p>
          : todaysTasks.slice(0, 4).map(t => <p key={t.id} className="text-xs text-gray-600 truncate">{t.title}</p>)}
      </Section>
      <Section icon={Receipt} title="Finance Reminders">
        {topCategory
          ? <p className="text-xs text-gray-600">Biggest spend this month: <strong>{topCategory[0]}</strong> ({formatCurrency(topCategory[1], 0)})</p>
          : <p className="text-xs text-gray-400">No expenses logged this month</p>}
      </Section>
      <Section icon={Flame} title="Habit Streak">
        {longestStreak
          ? <p className="text-xs text-gray-600">{longestStreak.emoji} {longestStreak.name} — {longestStreak.current_streak} day streak</p>
          : <p className="text-xs text-gray-400">No habits yet</p>}
      </Section>
      <Section icon={Activity} title="Recent Activity">
        {recentActivity.length === 0
          ? <p className="text-xs text-gray-400">No activity yet</p>
          : recentActivity.map(a => <p key={a.id} className="text-xs text-gray-600">{a.emoji} {a.label} — {a.sublabel}</p>)}
      </Section>
    </>
  )
}

export function RightPanel() {
  const { mode } = useMode()
  const { rightPanelCollapsed, setRightPanelCollapsed } = usePanel()

  if (rightPanelCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center w-12 border-l border-gray-100 bg-white/70 backdrop-blur-md py-4 shrink-0">
        <button onClick={() => setRightPanelCollapsed(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <PanelRightOpen size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="hidden xl:flex flex-col w-72 border-l border-gray-100 bg-white/70 backdrop-blur-md shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{mode === 'workspace' ? 'Context' : 'Today'}</h2>
        <button onClick={() => setRightPanelCollapsed(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <PanelRightClose size={14} />
        </button>
      </div>
      <div className="p-4 space-y-5">
        {mode === 'workspace' ? <WorkspacePanel /> : <PersonalPanel />}
      </div>
    </div>
  )
}
