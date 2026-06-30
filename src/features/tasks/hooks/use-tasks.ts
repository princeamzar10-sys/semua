'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/features/authentication/services/client'
import { TaskFormData } from '@/lib/validations'
import * as tasksService from '@/features/tasks/services/tasks.service'

const supabase = createClient()

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: () => tasksService.fetchTasks(supabase) })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      await tasksService.createTask(supabase, data, user!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskFormData> }) => {
      await tasksService.updateTask(supabase, id, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await tasksService.deleteTask(supabase, id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
