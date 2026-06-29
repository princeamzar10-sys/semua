'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-finance'
import { FinanceTransaction } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Wallet, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, TransactionFormData } from '@/lib/validations'
import { format, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const COLORS = ['#111', '#6b7280', '#93c5fd', '#86efac', '#fcd34d', '#f87171', '#c4b5fd', '#fdba74']

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface FinanceClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function FinanceClient({ user }: FinanceClientProps) {
  const { data: transactions = [], isLoading } = useTransactions()
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()

  const now = new Date()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceTransaction | null>(null)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth())
  const [filterYear] = useState(now.getFullYear())
  const [filterCategory, setFilterCategory] = useState('all')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', date: format(now, 'yyyy-MM-dd') },
  })
  const txType = watch('type')

  const monthStart = startOfMonth(new Date(filterYear, filterMonth))
  const monthEnd = endOfMonth(new Date(filterYear, filterMonth))

  const monthly = transactions.filter(t =>
    isAfter(new Date(t.date), monthStart) && isBefore(new Date(t.date), monthEnd)
  )
  const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = monthlyIncome - monthlyExpenses

  const expenseByCategory = monthly
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  const allCategories = [...new Set(transactions.map(t => t.category))]

  const filtered = monthly.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || t.category === filterCategory
    return matchSearch && matchCategory
  })

  const openCreate = () => {
    setEditing(null)
    reset({ type: 'expense', date: format(now, 'yyyy-MM-dd') })
    setOpen(true)
  }

  const openEdit = (t: FinanceTransaction) => {
    setEditing(t)
    reset({ title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date, notes: t.notes ?? '' })
    setOpen(true)
  }

  const onSubmit = async (data: TransactionFormData) => {
    if (editing) {
      await updateTx.mutateAsync({ id: editing.id, data })
    } else {
      await createTx.mutateAsync(data)
    }
    setOpen(false)
    reset()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Finance" user={user} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Month selector */}
        <div className="flex items-center gap-3">
          <Select value={String(filterMonth)} onValueChange={v => setFilterMonth(Number(v))}>
            <SelectTrigger className="w-40 bg-white border-gray-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m} {filterYear}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Monthly Income', value: `RM${monthlyIncome.toFixed(2)}`, icon: TrendingUp, color: 'text-green-500' },
            { label: 'Monthly Expenses', value: `RM${monthlyExpenses.toFixed(2)}`, icon: TrendingDown, color: 'text-red-500' },
            { label: 'Balance', value: `RM${balance.toFixed(2)}`, icon: Wallet, color: balance >= 0 ? 'text-blue-500' : 'text-red-500' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
                <Icon size={20} className={color} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`RM${Number(v).toFixed(2)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">RM{d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction list */}
          <div className={cn('bg-white rounded-2xl border border-gray-100 p-5', pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3')}>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900">Transactions</h3>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-gray-50 border-0 rounded-lg"
                  />
                </div>
                <Select value={filterCategory} onValueChange={v => setFilterCategory(v ?? 'all')}>
                  <SelectTrigger className="w-32 h-8 text-xs rounded-lg border-gray-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={openCreate} size="sm" className="rounded-xl bg-black hover:bg-gray-800 text-white gap-1.5 shrink-0 h-8 px-3 text-xs">
                  <Plus size={13} /> Add
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No transactions this month.</p>
            ) : (
              <div className="space-y-1 max-h-[420px] overflow-y-auto">
                <AnimatePresence>
                  {filtered.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">{t.category} · {format(new Date(t.date), 'MMM d')}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}RM{t.amount.toFixed(2)}
                        </span>
                        <div className="flex opacity-0 group-hover:opacity-100 gap-0.5">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteTx.mutate(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Transaction' : 'New Transaction'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
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
            <textarea {...register('notes')} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
            <Button type="submit" disabled={createTx.isPending || updateTx.isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
              {editing ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
