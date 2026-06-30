'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/features/authentication/services/client'
import { GoalFormData } from '@/lib/validations'
import * as goalsService from '@/features/personal/goals/services/goals.service'

const supabase = createClient()

export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => goalsService.fetchGoals(supabase) })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: GoalFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      await goalsService.createGoal(supabase, data, user!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoalFormData> }) => {
      await goalsService.updateGoal(supabase, id, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await goalsService.deleteGoal(supabase, id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}
