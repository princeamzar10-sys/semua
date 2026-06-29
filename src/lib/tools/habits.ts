import { SupabaseClient } from '@supabase/supabase-js'
import { ParsedAction } from '@/lib/ai/parser'
import { format } from 'date-fns'

const EMOJI_MAP: Record<string, string> = {
  gym: '💪', exercise: '🏃', run: '🏃', walk: '🚶',
  read: '📚', book: '📚', meditate: '🧘', yoga: '🧘',
  water: '💧', sleep: '😴', journal: '✍️', study: '📖',
  code: '💻', music: '🎵', pray: '🙏',
}

function guessEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '🎯'
}

export async function executeHabits(action: ParsedAction, supabase: SupabaseClient, userId: string): Promise<string> {
  const d = action.data

  switch (action.type) {
    case 'create_habit': {
      if (!d.name) throw new Error('Habit name is required')
      if (!d.frequency) throw new Error('Habit frequency (daily/weekly) is required')
      const emoji = d.emoji ? String(d.emoji) : guessEmoji(String(d.name))
      const { error } = await supabase.from('habits').insert({
        user_id: userId,
        name: String(d.name),
        emoji,
        frequency: String(d.frequency),
        current_streak: 0,
        longest_streak: 0,
      })
      if (error) throw new Error(error.message)
      return `Habit "${d.name}" created (${d.frequency})`
    }

    case 'complete_habit': {
      if (!d.name) throw new Error('Habit name is required')
      const { data: habits, error: findErr } = await supabase
        .from('habits').select('id, name').eq('user_id', userId).ilike('name', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!habits?.length) throw new Error(`Habit "${d.name}" not found`)
      const today = format(new Date(), 'yyyy-MM-dd')
      // Check if already logged today
      const { data: existing } = await supabase
        .from('habit_logs').select('id').eq('habit_id', habits[0].id).eq('date', today).limit(1)
      if (existing?.length) return `Habit "${habits[0].name}" already completed today`
      const { error } = await supabase.from('habit_logs').insert({
        habit_id: habits[0].id,
        user_id: userId,
        date: today,
        completed_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
      try { await supabase.rpc('update_habit_streak', { p_habit_id: habits[0].id }) } catch { }
      return `Habit "${habits[0].name}" completed for today! 🔥`
    }

    case 'update_habit': {
      if (!d.name) throw new Error('Habit name is required')
      const { data: habits, error: findErr } = await supabase
        .from('habits').select('id').eq('user_id', userId).ilike('name', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!habits?.length) throw new Error(`Habit "${d.name}" not found`)
      const updates: Record<string, unknown> = {}
      if (d.name) updates.name = d.name
      if (d.frequency) updates.frequency = d.frequency
      if (d.emoji) updates.emoji = d.emoji
      const { error } = await supabase.from('habits').update(updates).eq('id', habits[0].id)
      if (error) throw new Error(error.message)
      return `Habit "${d.name}" updated`
    }

    case 'delete_habit': {
      if (!d.name) throw new Error('Habit name is required')
      const { data: habits, error: findErr } = await supabase
        .from('habits').select('id, name').eq('user_id', userId).ilike('name', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!habits?.length) throw new Error(`Habit "${d.name}" not found`)
      const { error } = await supabase.from('habits').delete().eq('id', habits[0].id)
      if (error) throw new Error(error.message)
      return `Habit "${habits[0].name}" deleted`
    }

    default:
      throw new Error(`Unknown habit action: ${action.type}`)
  }
}
