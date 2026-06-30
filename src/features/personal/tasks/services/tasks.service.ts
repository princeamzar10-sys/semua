import { SupabaseClient } from '@supabase/supabase-js'
import { Task } from '@/features/personal/tasks/types'
import { TaskFormData } from '@/lib/validations'

export async function fetchTasks(supabase: SupabaseClient): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTask(supabase: SupabaseClient, data: TaskFormData, userId: string): Promise<void> {
  const { error } = await supabase.from('tasks').insert({ ...data, user_id: userId })
  if (error) throw error
}

export async function updateTask(supabase: SupabaseClient, id: string, data: Partial<TaskFormData>): Promise<void> {
  const { error } = await supabase.from('tasks').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteTask(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
