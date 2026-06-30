import { createClient } from '@/features/authentication/services/client'
import { ParseResult } from './parser'

export async function executeCommand(parsed: ParseResult): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  switch (parsed.type) {
    case 'finance': {
      const { error } = await supabase.from('finance_transactions').insert({
        user_id: user.id,
        title: parsed.data.title,
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        date: parsed.data.date,
      })
      if (error) throw error
      break
    }
    case 'task': {
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: parsed.data.title,
        due_date: parsed.data.due_date,
        priority: parsed.data.priority,
        status: parsed.data.status,
      })
      if (error) throw error
      break
    }
    case 'habit': {
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: parsed.data.name,
        emoji: parsed.data.emoji,
        frequency: parsed.data.frequency,
        current_streak: 0,
        longest_streak: 0,
      })
      if (error) throw error
      break
    }
    case 'goal': {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: parsed.data.title,
        target: parsed.data.target,
        current_progress: parsed.data.current_progress,
        deadline: parsed.data.deadline,
        category: parsed.data.category,
        status: parsed.data.status,
      })
      if (error) throw error
      break
    }
    default:
      throw new Error('Cannot save unknown type')
  }
}
