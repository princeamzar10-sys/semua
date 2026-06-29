'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { Task, Priority, TaskStatus } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, TaskFormData } from '@/lib/validations'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-yellow-50 text-yellow-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-green-50 text-green-600',
  overdue: 'bg-red-50 text-red-600',
}

interface TasksClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function TasksClient({ user }: TasksClientProps) {
  const { data: tasks = [], isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium', status: 'todo' },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ priority: 'medium', status: 'todo' })
    setOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    reset({
      title: task.title,
      description: task.description ?? '',
      due_date: task.due_date ?? '',
      priority: task.priority,
      status: task.status,
      category: task.category ?? '',
    })
    setOpen(true)
  }

  const onSubmit = async (data: TaskFormData) => {
    if (editing) {
      await updateTask.mutateAsync({ id: editing.id, data })
    } else {
      await createTask.mutateAsync(data)
    }
    setOpen(false)
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Tasks" user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 rounded-xl"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="w-36 bg-white border-gray-200 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v ?? 'all')}>
            <SelectTrigger className="w-36 bg-white border-gray-200 rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
            <Plus size={16} /> New Task
          </Button>
        </div>

        {/* Tasks list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">No tasks found. Create one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <button
                    onClick={() => updateTask.mutate({ id: task.id, data: { status: task.status === 'completed' ? 'todo' : 'completed' } })}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 shrink-0 transition-all',
                      task.status === 'completed' ? 'bg-black border-black' : 'border-gray-300 hover:border-gray-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium text-gray-900 truncate', task.status === 'completed' && 'line-through text-gray-400')}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs text-gray-400 mt-0.5">{format(new Date(task.due_date), 'MMM d, yyyy')}</p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <Badge className={cn('text-xs capitalize rounded-lg border-0', priorityColors[task.priority])}>
                      {task.priority}
                    </Badge>
                    <Badge className={cn('text-xs capitalize rounded-lg border-0', statusColors[task.status])}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteTask.mutate(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Task form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Input {...register('title')} placeholder="Task title" className="rounded-xl" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <textarea
              {...register('description')}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <Input type="date" {...register('due_date')} className="rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <Input {...register('category')} placeholder="e.g. Work" className="rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                <Select defaultValue="medium" onValueChange={v => setValue('priority', v as Priority)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <Select defaultValue="todo" onValueChange={v => setValue('status', v as TaskStatus)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={createTask.isPending || updateTask.isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
              {editing ? 'Save Changes' : 'Create Task'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
