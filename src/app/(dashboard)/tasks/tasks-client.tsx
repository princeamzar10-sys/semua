'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/use-tasks'
import { Task } from '@/features/tasks/types'
import { TaskCard } from '@/features/tasks/components/TaskCard'
import { TaskDialog } from '@/features/tasks/components/TaskDialog'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, CheckCircle2, Clock, AlertTriangle, ListTodo, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, TaskFormData } from '@/lib/validations'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TasksClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

function SectionGroup({ title, icon, color, tasks, onEdit, onDelete, onToggle, defaultOpen = true }: {
  title: string; icon: React.ReactNode; color: string; tasks: Task[]
  onEdit: (t: Task) => void; onDelete: (id: string) => void; onToggle: (t: Task) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (tasks.length === 0) return null
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 mb-3 group">
        <span className={cn('text-xs font-semibold uppercase tracking-widest', color)}>{icon}</span>
        <span className={cn('text-xs font-semibold uppercase tracking-widest', color)}>{title}</span>
        <span className="text-xs text-gray-400 font-normal ml-1">({tasks.length})</span>
        <ChevronDown size={13} className={cn('text-gray-400 transition-transform ml-1', !open && '-rotate-90')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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

  const openCreate = () => { setEditing(null); reset({ priority: 'medium', status: 'todo' }); setOpen(true) }
  const openEdit = (task: Task) => {
    setEditing(task)
    reset({ title: task.title, description: task.description ?? '', due_date: task.due_date ?? '', priority: task.priority, status: task.status, category: task.category ?? '' })
    setOpen(true)
  }

  const onSubmit = async (data: TaskFormData) => {
    if (editing) {
      await updateTask.mutateAsync({ id: editing.id, data })
      toast.success('Task updated')
    } else {
      await createTask.mutateAsync(data)
      toast.success('Task created')
    }
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteTask.mutate(id)
    toast.success('Task deleted')
  }

  const handleToggle = (task: Task) => {
    const next = task.status === 'completed' ? 'todo' : 'completed'
    updateTask.mutate({ id: task.id, data: { status: next } })
    if (next === 'completed') toast.success('Task completed!')
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const overdue = filtered.filter(t => t.status !== 'completed' && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)))
  const today = filtered.filter(t => t.status !== 'completed' && t.due_date && isToday(parseISO(t.due_date)))
  const upcoming = filtered.filter(t => t.status !== 'completed' && (!t.due_date || isFuture(parseISO(t.due_date))))
  const completed = filtered.filter(t => t.status === 'completed')

  const totalTasks = tasks.length
  const dueToday = tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'completed').length
  const overdueCount = tasks.filter(t => t.status !== 'completed' && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).length
  const completedThisWeek = tasks.filter(t => t.status === 'completed').length

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'text-gray-500', bg: 'bg-gray-50' },
    { label: 'Due Today', value: dueToday, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Completed', value: completedThisWeek, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title="Tasks" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
                  <Icon size={17} className={color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200 rounded-xl h-10" />
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="w-36 bg-white border-gray-200 rounded-xl h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={v => setFilterPriority(v ?? 'all')}>
            <SelectTrigger className="w-36 bg-white border-gray-200 rounded-xl h-10"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2 h-10 hidden sm:flex">
            <Plus size={15} /> New Task
          </Button>
        </div>

        {/* Task groups */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ListTodo size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No tasks found</p>
            <p className="text-gray-400 text-sm mb-4">Add your first task to get started</p>
            <Button onClick={openCreate} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
              <Plus size={14} /> Add Task
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <SectionGroup title="Overdue" icon="🔴" color="text-red-500" tasks={overdue} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            <SectionGroup title="Today" icon="🟡" color="text-amber-500" tasks={today} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            <SectionGroup title="Upcoming" icon="🟢" color="text-green-600" tasks={upcoming} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            <SectionGroup title="Completed" icon="✓" color="text-gray-400" tasks={completed} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} defaultOpen={false} />
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50"
      >
        <Plus size={22} />
      </button>

      <TaskDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        register={register}
        handleSubmit={handleSubmit}
        setValue={setValue}
        errors={errors}
        onSubmit={onSubmit}
        isPending={createTask.isPending || updateTask.isPending}
      />
    </div>
  )
}
