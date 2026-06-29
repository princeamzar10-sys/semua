'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals'
import { Goal, GoalStatus } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema, GoalFormData } from '@/lib/validations'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<GoalStatus, string> = {
  active: 'bg-blue-50 text-blue-600',
  completed: 'bg-green-50 text-green-600',
  archived: 'bg-gray-100 text-gray-500',
}

interface GoalsClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
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
    if (editing) await updateGoal.mutateAsync({ id: editing.id, data })
    else await createGoal.mutateAsync(data)
    setOpen(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Goals" user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-end mb-6">
          <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
            <Plus size={16} /> New Goal
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-sm">No goals yet. Set your first goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {goals.map((goal, i) => {
                const pct = Math.min(Math.round((goal.current_progress / goal.target) * 100), 100)
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{goal.title}</h3>
                          <Badge className={cn('text-xs capitalize border-0 rounded-lg', statusColors[goal.status])}>
                            {goal.status}
                          </Badge>
                          {goal.category && <span className="text-xs text-gray-400">{goal.category}</span>}
                        </div>
                        {goal.deadline && (
                          <p className="text-xs text-gray-400 mt-0.5">Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4 shrink-0">
                        <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteGoal.mutate(goal.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{goal.current_progress} / {goal.target}</span>
                        <span className="font-semibold text-gray-900">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2 rounded-full" />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Goal' : 'New Goal'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
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
              <Select defaultValue="active" onValueChange={v => setValue('status', v as GoalStatus)}>
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
