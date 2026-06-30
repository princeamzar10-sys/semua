'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitHeatmapRowProps {
  last7: string[]
  last7Labels: string[]
  isCompleted: (date: string) => boolean
}

export function HabitHeatmapRow({ last7, last7Labels, isCompleted }: HabitHeatmapRowProps) {
  return (
    <div className="flex gap-1">
      {last7.map((date, idx) => (
        <div key={date} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-gray-300">{last7Labels[idx]}</span>
          <div className={cn(
            'w-full h-6 rounded-md flex items-center justify-center transition-all',
            isCompleted(date) ? 'bg-black' : 'bg-gray-100'
          )}>
            {isCompleted(date) && <Check size={9} className="text-white" />}
          </div>
        </div>
      ))}
    </div>
  )
}
