import { SupabaseClient } from '@supabase/supabase-js'
import { ParsedAction } from '@/lib/ai/parser'

export async function executeTasks(action: ParsedAction, supabase: SupabaseClient, userId: string): Promise<string> {
  const d = action.data

  switch (action.type) {
    case 'create_task': {
      if (!d.title) throw new Error('Task title is required')
      const { error } = await supabase.from('tasks').insert({
        user_id: userId,
        title: String(d.title),
        due_date: d.due_date ? String(d.due_date) : null,
        priority: d.priority ?? 'medium',
        status: 'todo',
        category: d.category ? String(d.category) : null,
      })
      if (error) throw new Error(error.message)
      return `Task "${d.title}" created`
    }

    case 'complete_task': {
      if (!d.name) throw new Error('Task name is required')
      const { data: tasks, error: findErr } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('user_id', userId)
        .ilike('title', `%${d.name}%`)
        .neq('status', 'completed')
        .limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!tasks?.length) throw new Error(`Task "${d.name}" not found`)
      const { error } = await supabase.from('tasks').update({ status: 'completed' }).eq('id', tasks[0].id)
      if (error) throw new Error(error.message)
      return `Task "${tasks[0].title}" marked as complete`
    }

    case 'update_task': {
      if (!d.name) throw new Error('Task name is required')
      const { data: tasks, error: findErr } = await supabase
        .from('tasks').select('id').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!tasks?.length) throw new Error(`Task "${d.name}" not found`)
      const updates: Record<string, unknown> = {}
      if (d.title) updates.title = d.title
      if (d.due_date) updates.due_date = d.due_date
      if (d.priority) updates.priority = d.priority
      if (d.status) updates.status = d.status
      if (d.category) updates.category = d.category
      const { error } = await supabase.from('tasks').update(updates).eq('id', tasks[0].id)
      if (error) throw new Error(error.message)
      return `Task "${d.name}" updated`
    }

    case 'delete_task': {
      if (!d.name) throw new Error('Task name is required')
      const { data: tasks, error: findErr } = await supabase
        .from('tasks').select('id, title').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!tasks?.length) throw new Error(`Task "${d.name}" not found`)
      const { error } = await supabase.from('tasks').delete().eq('id', tasks[0].id)
      if (error) throw new Error(error.message)
      return `Task "${tasks[0].title}" deleted`
    }

    default:
      throw new Error(`Unknown task action: ${action.type}`)
  }
}
