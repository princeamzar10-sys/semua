export type HabitFrequency = 'daily' | 'weekly'

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
