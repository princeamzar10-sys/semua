'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { TransactionFormData } from '@/lib/validations'
import { FinanceTransaction } from '@/features/finance/types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: FinanceTransaction | null
  register: UseFormRegister<TransactionFormData>
  handleSubmit: UseFormHandleSubmit<TransactionFormData>
  setValue: UseFormSetValue<TransactionFormData>
  errors: FieldErrors<TransactionFormData>
  onSubmit: (data: TransactionFormData) => void
  isPending: boolean
  txType: string | undefined
}

export function TransactionDialog({ open, onOpenChange, editing, register, handleSubmit, setValue, errors, onSubmit, isPending, txType }: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit Transaction' : 'New Transaction'}</DialogTitle></DialogHeader>
        <form key={editing?.id ?? 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <Input {...register('title')} placeholder="Title" className="rounded-xl" />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="Amount" className="rounded-xl" />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <Select defaultValue={editing?.type ?? 'expense'} onValueChange={v => setValue('type', v as 'income' | 'expense')}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select defaultValue={editing?.category} onValueChange={v => setValue('category', String(v || ''))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {(txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" {...register('date')} className="rounded-xl" />
          </div>
          <textarea {...register('notes')} placeholder="Notes (optional)" rows={2}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
          <Button type="submit" disabled={isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
            {editing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
