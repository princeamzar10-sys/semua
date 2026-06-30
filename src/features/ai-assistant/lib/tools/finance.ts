import { SupabaseClient } from '@supabase/supabase-js'
import { ParsedAction } from '@/features/ai-assistant/lib/parser'
import { format } from 'date-fns'

const today = () => format(new Date(), 'yyyy-MM-dd')

export async function executeFinance(action: ParsedAction, supabase: SupabaseClient, userId: string): Promise<string> {
  const d = action.data

  switch (action.type) {
    case 'create_expense':
    case 'create_income': {
      if (!d.title) throw new Error('Transaction title is required')
      if (!d.amount || isNaN(Number(d.amount))) throw new Error('Valid amount is required')
      const type = action.type === 'create_income' ? 'income' : 'expense'
      const { error } = await supabase.from('finance_transactions').insert({
        user_id: userId,
        title: String(d.title),
        amount: Number(d.amount),
        type,
        category: d.category ? String(d.category) : 'Other',
        date: d.date ? String(d.date) : today(),
        notes: d.notes ? String(d.notes) : null,
      })
      if (error) throw new Error(error.message)
      return `${type === 'income' ? 'Income' : 'Expense'} recorded: RM${Number(d.amount).toFixed(2)} for ${d.title}`
    }

    case 'update_transaction': {
      if (!d.name) throw new Error('Transaction name is required')
      const { data: txns, error: findErr } = await supabase
        .from('finance_transactions').select('id').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!txns?.length) throw new Error(`Transaction "${d.name}" not found`)
      const updates: Record<string, unknown> = {}
      if (d.title) updates.title = d.title
      if (d.amount) updates.amount = Number(d.amount)
      if (d.category) updates.category = d.category
      if (d.date) updates.date = d.date
      const { error } = await supabase.from('finance_transactions').update(updates).eq('id', txns[0].id)
      if (error) throw new Error(error.message)
      return `Transaction "${d.name}" updated`
    }

    case 'delete_transaction': {
      if (!d.name) throw new Error('Transaction name is required')
      const { data: txns, error: findErr } = await supabase
        .from('finance_transactions').select('id, title').eq('user_id', userId).ilike('title', `%${d.name}%`).limit(1)
      if (findErr) throw new Error(findErr.message)
      if (!txns?.length) throw new Error(`Transaction "${d.name}" not found`)
      const { error } = await supabase.from('finance_transactions').delete().eq('id', txns[0].id)
      if (error) throw new Error(error.message)
      return `Transaction "${txns[0].title}" deleted`
    }

    default:
      throw new Error(`Unknown finance action: ${action.type}`)
  }
}
