'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/features/authentication/services/client'
import { HabitFormData } from '@/lib/validations'
import * as habitsService from '@/features/habits/services/habits.service'

const supabase = createClient()

export function useHabits() {
  return useQuery({ queryKey: ['habits'], queryFn: () => habitsService.fetchHabits(supabase) })
}

export function useHabitLogs(startDate?: string) {
  return useQuery({
    queryKey: ['habit_logs', startDate],
    queryFn: () => habitsService.fetchHabitLogs(supabase, startDate),
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: HabitFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      await habitsService.createHabit(supabase, data, user!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      await habitsService.toggleHabit(supabase, { habitId, date, completed, userId: user!.id })
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
      await habitsService.deleteHabit(supabase, id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
