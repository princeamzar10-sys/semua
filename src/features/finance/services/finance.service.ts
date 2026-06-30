import { SupabaseClient } from '@supabase/supabase-js'
import { FinanceTransaction } from '@/features/finance/types'
import { TransactionFormData } from '@/lib/validations'

export async function fetchTransactions(supabase: SupabaseClient): Promise<FinanceTransaction[]> {
  const { data, error } = await supabase
    .from('finance_transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createTransaction(supabase: SupabaseClient, data: TransactionFormData, userId: string): Promise<void> {
  const { error } = await supabase.from('finance_transactions').insert({ ...data, user_id: userId })
  if (error) throw error
}

export async function updateTransaction(supabase: SupabaseClient, id: string, data: Partial<TransactionFormData>): Promise<void> {
  const { error } = await supabase.from('finance_transactions').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
  if (error) throw error
}
