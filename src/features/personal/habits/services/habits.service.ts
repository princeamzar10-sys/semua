import { SupabaseClient } from '@supabase/supabase-js'
import { Habit, HabitLog } from '@/features/personal/habits/types'
import { HabitFormData } from '@/lib/validations'

export async function fetchHabits(supabase: SupabaseClient): Promise<Habit[]> {
  const { data, error } = await supabase.from('habits').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function fetchHabitLogs(supabase: SupabaseClient, startDate?: string): Promise<HabitLog[]> {
  let query = supabase.from('habit_logs').select('*')
  if (startDate) query = query.gte('date', startDate)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createHabit(supabase: SupabaseClient, data: HabitFormData, userId: string): Promise<void> {
  const { error } = await supabase.from('habits').insert({ ...data, user_id: userId })
  if (error) throw error
}

export async function toggleHabit(
  supabase: SupabaseClient,
  { habitId, date, completed, userId }: { habitId: string; date: string; completed: boolean; userId: string }
): Promise<void> {
  if (completed) {
    // Remove log
    await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', date)
  } else {
    // Add log
    await supabase.from('habit_logs').insert({
      habit_id: habitId,
      user_id: userId,
      date,
      completed_at: new Date().toISOString(),
    })
  }
  // Recalculate streak (best-effort — ignore if RPC doesn't exist)
  try { await supabase.rpc('update_habit_streak', { p_habit_id: habitId }) } catch { }
}

export async function deleteHabit(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw error
}
