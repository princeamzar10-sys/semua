import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ParsedAction } from '@/features/ai-assistant/lib/parser'
import { executeTasks } from '@/features/ai-assistant/lib/tools/tasks'
import { executeFinance } from '@/features/ai-assistant/lib/tools/finance'
import { executeHabits } from '@/features/ai-assistant/lib/tools/habits'
import { executeGoals } from '@/features/ai-assistant/lib/tools/goals'
import { format } from 'date-fns'
import { getMonthRange } from '@/utils/date-range'
import { formatCurrency } from '@/utils/format-currency'

export interface ActionResult {
  action: ParsedAction
  success: boolean
  message: string
}

export async function executeActions(actions: ParsedAction[]): Promise<ActionResult[]> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const results: ActionResult[] = []

  for (const action of actions) {
    try {
      let message: string

      if (action.type === 'summarize_dashboard') {
        message = await summarizeDashboard(supabase, user.id)
      } else if (action.type === 'generate_insights') {
        message = await generateInsights(supabase, user.id)
      } else if (action.type.startsWith('create_task') || action.type.startsWith('complete_task') || action.type.startsWith('update_task') || action.type.startsWith('delete_task')) {
        message = await executeTasks(action, supabase, user.id)
      } else if (['create_expense', 'create_income', 'update_transaction', 'delete_transaction'].includes(action.type)) {
        message = await executeFinance(action, supabase, user.id)
      } else if (['create_habit', 'complete_habit', 'update_habit', 'delete_habit'].includes(action.type)) {
        message = await executeHabits(action, supabase, user.id)
      } else if (['create_goal', 'update_goal_progress', 'complete_goal', 'delete_goal'].includes(action.type)) {
        message = await executeGoals(action, supabase, user.id)
      } else {
        throw new Error(`Unknown action type: ${action.type}`)
      }

      results.push({ action, success: true, message })
    } catch (err) {
      results.push({ action, success: false, message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return results
}

async function summarizeDashboard(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<string> {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { start: monthStart, end: monthEnd } = getMonthRange(new Date())

  const [tasks, habits, finance, goals] = await Promise.all([
    supabase.from('tasks').select('status, due_date').eq('user_id', userId),
    supabase.from('habits').select('name, current_streak').eq('user_id', userId),
    supabase.from('finance_transactions').select('type, amount').eq('user_id', userId).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('goals').select('title, current_progress, target, status').eq('user_id', userId).eq('status', 'active'),
  ])

  type TaskRow = { status: string; due_date: string }
  type FinRow = { type: string; amount: number }
  type HabitRow = { name: string; current_streak: number }
  type GoalRow = { title: string; current_progress: number; target: number; status: string }

  const taskData: TaskRow[] = (tasks.data ?? []) as TaskRow[]
  const todayTasks = taskData.filter((t: TaskRow) => t.due_date === today)
  const completedToday = todayTasks.filter((t: TaskRow) => t.status === 'completed').length
  const pendingToday = todayTasks.filter((t: TaskRow) => t.status !== 'completed').length

  const financeData: FinRow[] = (finance.data ?? []) as FinRow[]
  const income = financeData.filter((t: FinRow) => t.type === 'income').reduce((s: number, t: FinRow) => s + t.amount, 0)
  const expenses = financeData.filter((t: FinRow) => t.type === 'expense').reduce((s: number, t: FinRow) => s + t.amount, 0)

  const habitData: HabitRow[] = (habits.data ?? []) as HabitRow[]
  const topHabit = habitData.sort((a: HabitRow, b: HabitRow) => b.current_streak - a.current_streak)[0]

  const goalData: GoalRow[] = (goals.data ?? []) as GoalRow[]

  const lines = [
    `📊 **Dashboard Summary**`,
    ``,
    `**Today's Tasks:** ${completedToday} done, ${pendingToday} pending`,
    `**This Month Finance:** Income ${formatCurrency(income)} · Expenses ${formatCurrency(expenses)} · Net ${formatCurrency(income - expenses)}`,
    topHabit ? `**Top Habit Streak:** ${topHabit.name} at ${topHabit.current_streak} days 🔥` : '',
    goalData.length ? `**Active Goals:** ${goalData.map((g: GoalRow) => `${g.title} (${Math.round((g.current_progress / g.target) * 100)}%)`).join(', ')}` : 'No active goals',
  ].filter(Boolean)

  return lines.join('\n')
}

async function generateInsights(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<string> {
  const { start: monthStart, end: monthEnd } = getMonthRange(new Date())

  const [tasks, habits, finance] = await Promise.all([
    supabase.from('tasks').select('status, priority').eq('user_id', userId),
    supabase.from('habits').select('name, current_streak, longest_streak').eq('user_id', userId),
    supabase.from('finance_transactions').select('category, amount, type').eq('user_id', userId).gte('date', monthStart).lte('date', monthEnd),
  ])

  type TaskRow2 = { status: string; priority: string }
  type HabitRow2 = { name: string; current_streak: number; longest_streak: number }
  type FinRow2 = { category: string; amount: number; type: string }

  const taskData: TaskRow2[] = (tasks.data ?? []) as TaskRow2[]
  const completionRate = taskData.length ? Math.round((taskData.filter((t: TaskRow2) => t.status === 'completed').length / taskData.length) * 100) : 0

  const habitData: HabitRow2[] = (habits.data ?? []) as HabitRow2[]
  const activeStreaks = habitData.filter((h: HabitRow2) => h.current_streak > 0)

  const financeData: FinRow2[] = (finance.data ?? []) as FinRow2[]
  const expensesByCategory = financeData.filter((t: FinRow2) => t.type === 'expense').reduce((acc: Record<string, number>, t: FinRow2) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {} as Record<string, number>)
  const topCategory = Object.entries(expensesByCategory).sort(([, a], [, b]) => (b as number) - (a as number))[0]

  const insights: string[] = ['💡 **Insights**', '']
  if (completionRate >= 80) insights.push(`✅ Great job! You're completing ${completionRate}% of your tasks.`)
  else if (completionRate < 50) insights.push(`⚠️ Task completion is at ${completionRate}%. Consider prioritizing or breaking tasks into smaller steps.`)
  else insights.push(`📋 Task completion rate: ${completionRate}%. Keep it up!`)

  if (activeStreaks.length) {
    const best = activeStreaks.sort((a: HabitRow2, b: HabitRow2) => b.current_streak - a.current_streak)[0]
    insights.push(`🔥 Your best active streak: ${best.name} at ${best.current_streak} days!`)
  } else {
    insights.push(`💪 No active habit streaks. Start one today to build momentum.`)
  }

  if (topCategory) {
    insights.push(`💸 Top spending category this month: ${topCategory[0]} (${formatCurrency(topCategory[1] as number)})`)
  }

  return insights.join('\n')
}
