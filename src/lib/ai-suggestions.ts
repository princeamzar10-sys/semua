import { Task } from '@/features/tasks/types'
import { FinanceTransaction } from '@/features/finance/types'
import { Habit, HabitLog } from '@/features/habits/types'
import { Goal } from '@/features/goals/types'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { getMonthRange } from '@/utils/date-range'
import { formatCurrency } from '@/utils/format-currency'

export interface SuggestionContext {
  tasks: Task[]
  transactions: FinanceTransaction[]
  habits: Habit[]
  habitLogs: HabitLog[]
  goals: Goal[]
}

export interface Suggestion {
  message: string
  type: 'task' | 'finance' | 'habit' | 'goal' | 'general'
  priority: 'info' | 'warning' | 'success'
}

// Rule-based suggestion engine — swap generateSuggestions() for AI API call later
export function generateSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = []
  const now = new Date()
  const { start: monthStart, end: monthEnd } = getMonthRange(now)

  // Task suggestions
  const overdue = ctx.tasks.filter(t =>
    t.due_date && t.status !== 'completed' && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
  )
  if (overdue.length > 0) {
    suggestions.push({
      message: `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}. Time to catch up!`,
      type: 'task',
      priority: 'warning',
    })
  }

  const todayStr = format(now, 'yyyy-MM-dd')
  const todayTasks = ctx.tasks.filter(t =>
    t.due_date && t.due_date === todayStr && t.status !== 'completed'
  )
  if (todayTasks.length > 0) {
    suggestions.push({
      message: `${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today. Stay focused!`,
      type: 'task',
      priority: 'info',
    })
  }

  // Finance suggestions
  const monthlyExpenses = ctx.transactions
    .filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyIncome = ctx.transactions
    .filter(t => t.type === 'income' && t.date >= monthStart && t.date <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0)

  if (monthlyIncome > 0) {
    const spentPct = Math.round((monthlyExpenses / monthlyIncome) * 100)
    if (spentPct >= 80) {
      suggestions.push({
        message: `Your monthly budget is ${spentPct}% used. Be mindful of spending.`,
        type: 'finance',
        priority: 'warning',
      })
    } else if (spentPct < 50) {
      suggestions.push({
        message: `Great job! You've only used ${spentPct}% of your monthly budget.`,
        type: 'finance',
        priority: 'success',
      })
    }
  }

  // Food spending this week
  const weekAgo = format(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  const foodSpend = ctx.transactions
    .filter(t => t.type === 'expense' && t.category.toLowerCase() === 'food' && t.date >= weekAgo)
    .reduce((sum, t) => sum + t.amount, 0)

  if (foodSpend > 0) {
    suggestions.push({
      message: `You spent ${formatCurrency(foodSpend, 0)} on food this week.`,
      type: 'finance',
      priority: 'info',
    })
  }

  // Habit suggestions
  ctx.habits.forEach(habit => {
    if (habit.current_streak >= 5) {
      suggestions.push({
        message: `You completed your "${habit.name}" habit ${habit.current_streak} days in a row. Keep it up!`,
        type: 'habit',
        priority: 'success',
      })
    }
  })

  // Goal suggestions
  const nearDeadlineGoals = ctx.goals.filter(g => {
    if (!g.deadline || g.status !== 'active') return false
    const daysLeft = Math.ceil((parseISO(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 7 && daysLeft > 0
  })

  nearDeadlineGoals.forEach(g => {
    const daysLeft = Math.ceil((parseISO(g.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    suggestions.push({
      message: `Goal "${g.title}" deadline is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Push harder!`,
      type: 'goal',
      priority: 'warning',
    })
  })

  if (suggestions.length === 0) {
    suggestions.push({
      message: "You're all caught up! Great work staying on track.",
      type: 'general',
      priority: 'success',
    })
  }

  return suggestions.slice(0, 5)
}
