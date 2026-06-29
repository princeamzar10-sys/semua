import { SupabaseClient } from '@supabase/supabase-js'
import { ParsedAction } from '@/lib/ai/parser'

export async function executeGoals(action: ParsedAction, supabase: SupabaseClient, userId: string): Promise<string> {
  const d = action.data

  switch (action.type) {
    case 'create_goal': {
      if (!d.title) throw new Error('Goal title is required')
      if (!d.target || isNaN(Number(d.target))) throw new Error('Goal target is required')
      const { error } = await supabase.from('goals').insert({
        user_id: userId,
        title: String(d.title),
        target: Number(d.target),
        current_progress: 0,
        deadline: d.deadline ? String(d.deadline) : null,
        category: d.category ? String(d.category) : null,
        status: 'active',
      })
      if (error) throw new Error(error.message)
      return `Goal "${d.title}" created with target ${d.target}`
    }

    case 'update_goal_progress': {
      if (!d.name) throw new Error('Goal name is required')
      if (d.current_progress === undefined || d.current_progress === null) throw new Error('Progress value is required')
      const { data: goals, error: findErr } = await supabase
        .from('goals').select('id, title, target').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!goals?.length) throw new Error(`Goal "${d.name}" not found`)
      const progress = Number(d.current_progress)
      const updates: Record<string, unknown> = { current_progress: progress }
      if (progress >= goals[0].target) updates.status = 'completed'
      const { error } = await supabase.from('goals').update(updates).eq('id', goals[0].id)
      if (error) throw new Error(error.message)
      const pct = Math.round((progress / goals[0].target) * 100)
      return `Goal "${goals[0].title}" updated to ${progress}/${goals[0].target} (${pct}%)`
    }

    case 'complete_goal': {
      if (!d.name) throw new Error('Goal name is required')
      const { data: goals, error: findErr } = await supabase
        .from('goals').select('id, title, target').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!goals?.length) throw new Error(`Goal "${d.name}" not found`)
      const { error } = await supabase.from('goals').update({
        status: 'completed',
        current_progress: goals[0].target,
      }).eq('id', goals[0].id)
      if (error) throw new Error(error.message)
      return `Goal "${goals[0].title}" completed! 🎯`
    }

    case 'delete_goal': {
      if (!d.name) throw new Error('Goal name is required')
      const { data: goals, error: findErr } = await supabase
        .from('goals').select('id, title').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!goals?.length) throw new Error(`Goal "${d.name}" not found`)
      const { error } = await supabase.from('goals').delete().eq('id', goals[0].id)
      if (error) throw new Error(error.message)
      return `Goal "${goals[0].title}" deleted`
    }

    default:
      throw new Error(`Unknown goal action: ${action.type}`)
  }
}
