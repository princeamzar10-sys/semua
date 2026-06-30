'use client'

import { Topbar } from '@/components/layout/topbar'
import { AIWidget } from '@/features/dashboard/components/ai-widget'
import { StatCard } from '@/features/dashboard/components/StatCard'
import { useTasks } from '@/features/personal/tasks/hooks/use-tasks'
import { useTransactions } from '@/features/personal/finance/hooks/use-finance'
import { useHabits, useHabitLogs } from '@/features/personal/habits/hooks/use-habits'
import { useGoals } from '@/features/personal/goals/hooks/use-goals'
import { generateSuggestions } from '@/lib/ai-suggestions'
import { CheckSquare, TrendingDown, TrendingUp, Wallet, Flame, Target, ChevronRight, AlertTriangle, Check, Clock, Plus, Repeat } from 'lucide-react'
import { format, isToday, isPast, subDays, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getMonthRange } from '@/utils/date-range'
import { formatCurrency } from '@/utils/format-currency'

interface DashboardClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { data: tasks = [] } = useTasks()
  const { data: transactions = [] } = useTransactions()
  const { data: habits = [] } = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const { data: goals = [] } = useGoals()

  const now = new Date()
  const { start: monthStart, end: monthEnd } = getMonthRange(now)
  const todayStr = format(now, 'yyyy-MM-dd')

  // Tasks
  const todayTasks = tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'completed')
  const overdueTasks = tasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'completed')
  const focusTasks = [...overdueTasks.slice(0, 2), ...todayTasks.slice(0, 3)].slice(0, 5)

  // Finance
  const monthly = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd)
  const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = monthlyIncome - monthlyExpenses

  // Habits
  const todayLogs = habitLogs.filter(l => l.date === todayStr)
  const habitCompletion = habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(now, 6 - i), 'yyyy-MM-dd'))
  const isHabitDone = (hid: string, date: string) => habitLogs.some(l => l.habit_id === hid && l.date === date)

  // Goals
  const activeGoals = goals.filter(g => g.status === 'active')
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.current_progress / g.target) * 100, 0) / activeGoals.length)
    : 0

  const suggestions = generateSuggestions({ tasks, transactions, habits, habitLogs, goals })

  // Recent Activity — merged feed from data already fetched above
  type ActivityItem = { id: string; label: string; sublabel: string; timestamp: string; emoji: string }
  const recentActivity: ActivityItem[] = [
    ...tasks.filter(t => t.status === 'completed').map(t => ({
      id: `task-${t.id}`, label: t.title, sublabel: 'Task completed', timestamp: t.updated_at, emoji: '✅',
    })),
    ...transactions.slice(0, 10).map(t => ({
      id: `tx-${t.id}`, label: t.title, sublabel: t.type === 'income' ? 'Income logged' : 'Expense logged',
      timestamp: t.created_at, emoji: t.type === 'income' ? '💰' : '💸',
    })),
    ...habitLogs.slice(0, 10).map(l => {
      const habit = habits.find(h => h.id === l.habit_id)
      return { id: `habit-${l.id}`, label: habit?.name ?? 'Habit', sublabel: 'Habit completed', timestamp: l.completed_at, emoji: habit?.emoji ?? '🎯' }
    }),
    ...goals.filter(g => g.status === 'completed').map(g => ({
      id: `goal-${g.id}`, label: g.title, sublabel: 'Goal completed', timestamp: g.updated_at, emoji: '🏆',
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title="Dashboard" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">{format(now, 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Add Task', icon: CheckSquare, href: '/tasks' },
            { label: 'Add Expense', icon: Plus, href: '/finance' },
            { label: 'Log Habit', icon: Repeat, href: '/habits' },
            { label: 'New Goal', icon: Target, href: '/goals' },
          ].map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-sm text-gray-700">
              <Icon size={14} className="text-gray-400" />
              {label}
            </Link>
          ))}
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Tasks", value: todayTasks.length, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50', href: '/tasks' },
            { label: 'Overdue', value: overdueTasks.length, icon: AlertTriangle, color: overdueTasks.length > 0 ? 'text-red-500' : 'text-gray-400', bg: overdueTasks.length > 0 ? 'bg-red-50' : 'bg-gray-50', href: '/tasks' },
            { label: 'Habits Done', value: `${todayLogs.length}/${habits.length}`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', href: '/habits' },
            { label: 'Balance', value: formatCurrency(balance, 0), icon: Wallet, color: balance >= 0 ? 'text-green-500' : 'text-red-500', bg: balance >= 0 ? 'bg-green-50' : 'bg-red-50', href: '/finance' },
          ].map(({ label, value, icon, color, bg, href }, i) => (
            <Link href={href} key={label}>
              <StatCard label={label} value={value} icon={icon} iconColor={color} bg={bg} index={i} />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Focus */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Today's Focus</h2>
                <Link href="/tasks" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All tasks <ChevronRight size={12} />
                </Link>
              </div>
              {focusTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                  <p className="text-xs text-gray-400">No tasks due today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {focusTasks.map((task, i) => {
                    const overdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
                    return (
                      <motion.div key={task.id}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                          task.priority === 'urgent' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-orange-400' :
                          task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300')} />
                        <span className="text-sm text-gray-800 flex-1 truncate">{task.title}</span>
                        {overdue && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Overdue</span>}
                        {!overdue && task.due_date && <span className="text-xs text-gray-400 shrink-0">Today</span>}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Financial snapshot */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Financial Snapshot</h2>
                <Link href="/finance" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  Details <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Income', value: formatCurrency(monthlyIncome, 0), color: 'text-green-600', icon: TrendingUp },
                  { label: 'Expenses', value: formatCurrency(monthlyExpenses, 0), color: 'text-red-500', icon: TrendingDown },
                  { label: 'Balance', value: formatCurrency(Math.abs(balance), 0), color: balance >= 0 ? 'text-blue-600' : 'text-red-500', icon: Wallet },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-gray-50">
                    <p className={cn('text-lg font-bold', color)}>{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {/* Spend bar */}
              {monthlyIncome > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Spent this month</span>
                    <span>{Math.min(Math.round((monthlyExpenses / monthlyIncome) * 100), 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((monthlyExpenses / monthlyIncome) * 100, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn('h-full rounded-full', monthlyExpenses > monthlyIncome ? 'bg-red-400' : 'bg-black')} />
                  </div>
                </div>
              )}
            </div>

            {/* Habit status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Habit Status</h2>
                <Link href="/habits" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All habits <ChevronRight size={12} />
                </Link>
              </div>
              {habits.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No habits yet. <Link href="/habits" className="text-black underline">Add one</Link></p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Today's completion</span>
                    <span className="font-bold text-gray-900">{habitCompletion}%</span>
                  </div>
                  {habits.slice(0, 4).map(h => (
                    <div key={h.id} className="flex items-center gap-3">
                      <span className="text-lg shrink-0">{h.emoji}</span>
                      <span className="text-sm text-gray-700 flex-1 truncate">{h.name}</span>
                      <div className="flex gap-0.5">
                        {last7.map(date => (
                          <div key={date} className={cn('w-4 h-4 rounded-sm', isHabitDone(h.id, date) ? 'bg-black' : 'bg-gray-100')} />
                        ))}
                      </div>
                      {isHabitDone(h.id, todayStr) && <Check size={14} className="text-green-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIWidget suggestions={suggestions} />

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
                <Clock size={14} className="text-gray-300" />
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3">
                      <span className="text-base shrink-0">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sublabel}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Goal Progress */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Goal Progress</h2>
                <Link href="/goals" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              {activeGoals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🎯</p>
                  <p className="text-xs text-gray-400">No active goals. <Link href="/goals" className="text-black underline">Set one</Link></p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-3 rounded-xl bg-gray-50 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Target size={15} className="text-purple-500" />
                      <span className="text-2xl font-bold text-gray-900">{avgGoalProgress}%</span>
                    </div>
                    <p className="text-xs text-gray-400">avg across {activeGoals.length} goal{activeGoals.length > 1 ? 's' : ''}</p>
                  </div>
                  {activeGoals.slice(0, 3).map((goal, i) => {
                    const pct = Math.min(Math.round((goal.current_progress / goal.target) * 100), 100)
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-700 truncate flex-1 mr-2">{goal.title}</span>
                          <span className="text-xs font-semibold text-gray-900 shrink-0">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={cn('h-full rounded-full', pct >= 100 ? 'bg-green-500' : 'bg-black')} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
