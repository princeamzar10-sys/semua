export type TransactionType = 'income' | 'expense'

export interface FinanceTransaction {
  id: string
  user_id: string
  title: string
  amount: number
  type: TransactionType
  category: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}
