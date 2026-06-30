'use client'

import { AlertTriangle, Clock } from 'lucide-react'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'

export function DeadlineChip({ deadline }: { deadline: string | null }) {
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
