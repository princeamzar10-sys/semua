export type GoalStatus = 'active' | 'completed' | 'archived'

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
