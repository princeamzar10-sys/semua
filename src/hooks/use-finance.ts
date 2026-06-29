'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { FinanceTransaction } from '@/types'
import { TransactionFormData } from '@/lib/validations'

const supabase = createClient()

async function fetchTransactions(): Promise<FinanceTransaction[]> {
  const { data, error } = await supabase
    .from('finance_transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export function useTransactions() {
  return useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('finance_transactions').insert({ ...data, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
