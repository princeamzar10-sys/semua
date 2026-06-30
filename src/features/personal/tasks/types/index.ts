export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue'

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
