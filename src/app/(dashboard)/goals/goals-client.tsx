'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals'
import { Goal, GoalStatus } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, Target, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema, GoalFormData } from '@/lib/validations'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface GoalsClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

function DeadlineChip({ deadline }: { deadline: string | null }) {
  if (!deadline) return null
  const daysLeft = differenceInDays(parseISO(deadline), new Date())
  if (isPast(parseISO(deadline))) return (
    <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
      <AlertTriangle size={10} /> Overdue
    </span>
  )
  if (daysLeft <= 7) return (
    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      <Clock size={10} /> {daysLeft}d left
    </span>
  )
  return (
    <span className="text-xs text-gray-400">{format(parseISO(deadline), 'MMM d, yyyy')}</span>
  )
}

export function GoalsClient({ user }: GoalsClientProps) {
  const { data: goals = [], isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { status: 'active', current_progress: 0 },
  })

  const openCreate = () => { setEditing(null); reset({ status: 'active', current_progress: 0 }); setOpen(true) }
  const openEdit = (g: Goal) => {
    setEditing(g)
    reset({ title: g.title, target: g.target, current_progress: g.current_progress, deadline: g.deadline ?? '', category: g.category ?? '', status: g.status })
    setOpen(true)
  }

  const onSubmit = async (data: GoalFormData) => {
    if (editing) { await updateGoal.mutateAsync({ id: editing.id, data }); toast.success('Goal updated') }
    else { await createGoal.mutateAsync(data); toast.success('Goal created!') }
    setOpen(false)
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.current_progress / g.target) * 100, 0) / activeGoals.length)
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title="Goals" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Completed', value: completedGoals.length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon size={17} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">My Goals</h2>
            <p className="text-sm text-gray-400 mt-0.5">Track your progress toward what matters</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-sm">
            <Plus size={14} /> New Goal
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-gray-500 font-medium mb-1">No goals yet</p>
            <p className="text-gray-400 text-sm mb-4">Set your first goal and start tracking progress</p>
            <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
              <Plus size={14} /> Add Goal
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {goals.map((goal, i) => {
                const pct = Math.min(Math.round((goal.current_progress / goal.target) * 100), 100)
                const isComplete = pct >= 100
                return (
                  <motion.div key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ y: -1 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          {goal.status === 'completed' && (
                            <Badge className="text-xs border-0 rounded-full bg-green-50 text-green-600 px-2">Completed</Badge>
                          )}
                          {goal.category && <span className="text-xs text-gray-400">{goal.category}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <DeadlineChip deadline={goal.deadline} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                        <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { deleteGoal.mutate(goal.id); toast.success('Goal removed') }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{goal.current_progress} / {goal.target}</span>
                        <span className={cn('font-bold', isComplete ? 'text-green-600' : 'text-gray-900')}>{pct}%</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                          className={cn('h-full rounded-full', isComplete ? 'bg-green-500' : 'bg-black')}
                        />
                      </div>
                      {isComplete && (
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle size={11} /> Goal achieved!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <button onClick={openCreate}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50">
        <Plus size={22} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Goal' : 'New Goal'}</DialogTitle></DialogHeader>
          <form key={editing?.id ?? 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <Input {...register('title')} placeholder="Goal title" className="rounded-xl" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target</label>
                <Input type="number" {...register('target', { valueAsNumber: true })} placeholder="e.g. 100" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Current Progress</label>
                <Input type="number" {...register('current_progress', { valueAsNumber: true })} placeholder="0" className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Deadline</label>
                <Input type="date" {...register('deadline')} className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <Input {...register('category')} placeholder="e.g. Health" className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <Select defaultValue={editing?.status ?? 'active'} onValueChange={v => setValue('status', v as GoalStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
              {editing ? 'Save Changes' : 'Create Goal'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
