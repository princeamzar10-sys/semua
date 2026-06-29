'use client'

import { Topbar } from '@/components/layout/topbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { AIWidget } from '@/components/ai/ai-widget'
import { useTasks } from '@/hooks/use-tasks'
import { useTransactions } from '@/hooks/use-finance'
import { useHabits, useHabitLogs } from '@/hooks/use-habits'
import { useGoals } from '@/hooks/use-goals'
import { generateSuggestions } from '@/lib/ai-suggestions'
import { CheckSquare, AlertTriangle, TrendingDown, TrendingUp, Wallet, Flame, Target } from 'lucide-react'
import { format, isToday, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface DashboardClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { data: tasks = [] } = useTasks()
  const { data: transactions = [] } = useTransactions()
  const { data: habits = [] } = useHabits()
  const { data: habitLogs = [] } = useHabitLogs()
  const { data: goals = [] } = useGoals()

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const todayStr = format(now, 'yyyy-MM-dd')

  const todayTasks = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)) && t.status !== 'completed').length
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && isAfter(new Date(t.date), monthStart) && isBefore(new Date(t.date), monthEnd))
    .reduce((s, t) => s + t.amount, 0)
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && isAfter(new Date(t.date), monthStart) && isBefore(new Date(t.date), monthEnd))
    .reduce((s, t) => s + t.amount, 0)
  const budgetRemaining = monthlyIncome - monthlyExpenses

  const todayLogs = habitLogs.filter(l => l.date === todayStr)
  const habitCompletion = habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0

  const activeGoals = goals.filter(g => g.status === 'active')
  const goalsProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.current_progress / g.target) * 100, 0) / activeGoals.length)
    : 0

  const suggestions = generateSuggestions({ tasks, transactions, habits, habitLogs, goals })

  const recentTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5)
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Dashboard" user={user} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Today's Tasks" value={todayTasks} icon={CheckSquare} index={0} />
          <StatCard label="Overdue Tasks" value={overdueTasks} icon={AlertTriangle} iconColor="text-red-400" index={1} />
          <StatCard label="Monthly Expenses" value={`RM${monthlyExpenses.toFixed(0)}`} icon={TrendingDown} iconColor="text-red-400" index={2} />
          <StatCard label="Monthly Income" value={`RM${monthlyIncome.toFixed(0)}`} icon={TrendingUp} iconColor="text-green-500" index={3} />
          <StatCard label="Budget Remaining" value={`RM${budgetRemaining.toFixed(0)}`} icon={Wallet} iconColor="text-blue-500" index={4} />
          <StatCard label="Habit Completion" value={`${habitCompletion}%`} icon={Flame} iconColor="text-orange-400" index={5} />
          <StatCard label="Goals Progress" value={`${goalsProgress}%`} icon={Target} iconColor="text-purple-500" index={6} />
        </div>

        {/* AI + recents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AIWidget suggestions={suggestions} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
                <Link href="/tasks" className="text-xs text-blue-500 hover:text-blue-700">View all</Link>
              </div>
              <div className="space-y-2">
                {recentTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No active tasks.</p>}
                {recentTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700 flex-1 truncate">{task.title}</span>
                    <Badge variant="secondary" className="text-xs shrink-0 capitalize">{task.status.replace('_', ' ')}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
                <Link href="/finance" className="text-xs text-blue-500 hover:text-blue-700">View all</Link>
              </div>
              <div className="space-y-2">
                {recentTransactions.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No transactions yet.</p>}
                {recentTransactions.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-gray-700">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.category} · {format(new Date(t.date), 'MMM d')}</p>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}RM{t.amount.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
