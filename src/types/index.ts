export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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
