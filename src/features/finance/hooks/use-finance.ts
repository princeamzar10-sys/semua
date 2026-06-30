'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/features/authentication/services/client'
import { TransactionFormData } from '@/lib/validations'
import * as financeService from '@/features/finance/services/finance.service'

const supabase = createClient()

export function useTransactions() {
  return useQuery({ queryKey: ['transactions'], queryFn: () => financeService.fetchTransactions(supabase) })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      await financeService.createTransaction(supabase, data, user!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionFormData> }) => {
      await financeService.updateTransaction(supabase, id, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await financeService.deleteTransaction(supabase, id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
