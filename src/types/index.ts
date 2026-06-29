export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue'
export type TransactionType = 'income' | 'expense'
export type HabitFrequency = 'daily' | 'weekly'
export type GoalStatus = 'active' | 'completed' | 'archived'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: Priority
  status: TaskStatus
  category: string | null
  created_at: string
  updated_at: string
}

export interface FinanceTransaction {
  id: string
  user_id: string
  title: string
  amount: number
  type: TransactionType
  category: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  frequency: HabitFrequency
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  date: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  target: number
  current_progress: number
  deadline: string | null
  category: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
  created_at: string
}

export interface AISuggestion {
  id: string
  user_id: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export interface DashboardStats {
  todayTasks: number
  overdueTasks: number
  monthlyExpenses: number
  monthlyIncome: number
  budgetRemaining: number
  habitCompletion: number
  goalsProgress: number
}
