'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Habit, HabitLog } from '@/types'
import { HabitFormData } from '@/lib/validations'
import { format } from 'date-fns'

const supabase = createClient()

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase.from('habits').select('*').order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function useHabitLogs(startDate?: string) {
  return useQuery({
    queryKey: ['habit_logs', startDate],
    queryFn: async (): Promise<HabitLog[]> => {
      let query = supabase.from('habit_logs').select('*')
      if (startDate) query = query.gte('date', startDate)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: HabitFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('habits').insert({ ...data, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (completed) {
        // Remove log
        await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', date)
      } else {
        // Add log
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: user!.id,
          date,
          completed_at: new Date().toISOString(),
        })
      }
      // Recalculate streak (best-effort — ignore if RPC doesn't exist)
      try { await supabase.rpc('update_habit_streak', { p_habit_id: habitId }) } catch { }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['habit_logs'] })
    },
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
