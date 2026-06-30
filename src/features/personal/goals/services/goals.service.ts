import { SupabaseClient } from '@supabase/supabase-js'
import { Goal } from '@/features/personal/goals/types'
import { GoalFormData } from '@/lib/validations'

export async function fetchGoals(supabase: SupabaseClient): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createGoal(supabase: SupabaseClient, data: GoalFormData, userId: string): Promise<void> {
  const { error } = await supabase.from('goals').insert({ ...data, user_id: userId })
  if (error) throw error
}

export async function updateGoal(supabase: SupabaseClient, id: string, data: Partial<GoalFormData>): Promise<void> {
  const { error } = await supabase.from('goals').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteGoal(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}
