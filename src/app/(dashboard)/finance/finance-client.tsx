'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-finance'
import { FinanceTransaction } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Wallet, Search, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, TransactionFormData } from '@/lib/validations'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const COLORS = ['#111', '#6b7280', '#93c5fd', '#86efac', '#fcd34d', '#f87171', '#c4b5fd', '#fdba74']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

  const monthStart = format(startOfMonth(new Date(filterYear, filterMonth)), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(filterYear, filterMonth)), 'yyyy-MM-dd')
  const monthly = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd)

  const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = monthlyIncome - monthlyExpenses

  const expenseByCategory = monthly.filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))
  const topCategory = pieData.sort((a, b) => b.value - a.value)[0]

  const allCategories = [...new Set(transactions.map(t => t.category))]
  const filtered = monthly.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'all' || t.category === filterCategory
    return matchSearch && matchCat
  })

  const openCreate = () => { setEditing(null); reset({ type: 'expense', date: format(now, 'yyyy-MM-dd') }); setOpen(true) }
  const openEdit = (t: FinanceTransaction) => {
    setEditing(t)
    reset({ title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date, notes: t.notes ?? '' })
    setOpen(true)
  }
  const onSubmit = async (data: TransactionFormData) => {
    if (editing) { await updateTx.mutateAsync({ id: editing.id, data }); toast.success('Transaction updated') }
    else { await createTx.mutateAsync(data); toast.success('Transaction added') }
    setOpen(false); reset()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F9FAFB]">
      <Topbar title="Finance" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

        {/* Month selector */}
        <div className="flex items-center justify-between">
          <Select value={String(filterMonth)} onValueChange={v => setFilterMonth(Number(v))}>
            <SelectTrigger className="w-44 bg-white border-gray-200 rounded-xl h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m} {filterYear}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-sm hidden sm:flex">
            <Plus size={14} /> Add Transaction
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Income', value: `RM${monthlyIncome.toFixed(2)}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Expenses', value: `RM${monthlyExpenses.toFixed(2)}`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Balance', value: `RM${balance.toFixed(2)}`, icon: Wallet, color: balance >= 0 ? 'text-blue-500' : 'text-red-500', bg: balance >= 0 ? 'bg-blue-50' : 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon size={17} className={color} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label} this month</p>
            </motion.div>
          ))}
        </div>

        {/* Insight card */}
        {topCategory && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Spending Insight</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Your highest expense this month is <strong>{topCategory.name}</strong> at RM{topCategory.value.toFixed(2)}.
                {monthlyIncome > 0 && ` That's ${Math.round((topCategory.value / monthlyIncome) * 100)}% of your income.`}
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`RM${Number(v).toFixed(2)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">RM{d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction list */}
          <div className={cn('bg-white rounded-2xl border border-gray-100 p-5 shadow-sm', pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3')}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 mr-auto">Transactions</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-gray-50 border-0 rounded-lg w-36" />
              </div>
              <Select value={filterCategory} onValueChange={v => setFilterCategory(v ?? 'all')}>
                <SelectTrigger className="w-28 h-8 text-xs rounded-lg border-gray-200"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={openCreate} size="sm" className="rounded-xl bg-black hover:bg-gray-800 text-white h-8 px-3 text-xs gap-1 sm:hidden">
                <Plus size={12} /> Add
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">💳</p>
                <p className="text-gray-500 font-medium mb-1">No transactions</p>
                <p className="text-gray-400 text-sm">Add your first transaction for this month</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[380px] overflow-y-auto">
                <AnimatePresence>
                  {filtered.map((t, i) => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold',
                          t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
                          {t.type === 'income' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight">{t.title}</p>
                          <p className="text-xs text-gray-400">{t.category} · {format(new Date(t.date), 'MMM d')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('text-sm font-semibold', t.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                          {t.type === 'income' ? '+' : '-'}RM{t.amount.toFixed(2)}
                        </span>
                        <div className="flex opacity-0 group-hover:opacity-100 gap-0.5 transition-opacity">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => { deleteTx.mutate(t.id); toast.success('Deleted') }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
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

      {/* FAB */}
      <button onClick={openCreate}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50">
        <Plus size={22} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button type="submit" disabled={createTx.isPending || updateTx.isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
              {editing ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
