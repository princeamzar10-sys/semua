'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, isPast, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Task } from '@/features/personal/tasks/types'
import { PRIORITY_COLORS as priorityColors, PRIORITY_DOT_COLORS as priorityDot } from '@/constants/priority'

export function TaskCard({ task, onEdit, onDelete, onToggle }: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onToggle: (t: Task) => void
}) {
  const done = task.status === 'completed'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -1 }}
      className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group"
    >
      <button
        onClick={() => onToggle(task)}
        className={cn(
          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200',
          done ? 'bg-black border-black' : 'border-gray-300 hover:border-gray-600'
        )}
      >
        {done && <CheckCircle2 size={12} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium text-gray-900 truncate transition-all', done && 'line-through text-gray-400')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className={cn('flex items-center gap-1 text-xs', isPast(parseISO(task.due_date)) && !done ? 'text-red-500' : 'text-gray-400')}>
              <CalendarDays size={11} />
              {format(parseISO(task.due_date), 'MMM d')}
            </span>
          )}
          {task.category && <span className="text-xs text-gray-400">{task.category}</span>}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <div className={cn('w-1.5 h-1.5 rounded-full', priorityDot[task.priority])} />
        <Badge className={cn('text-xs capitalize rounded-lg border-0 px-2 py-0.5', priorityColors[task.priority])}>
          {task.priority}
        </Badge>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}
