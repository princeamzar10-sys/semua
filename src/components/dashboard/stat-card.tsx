'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  change?: string
  index?: number
}

export function StatCard({ label, value, icon: Icon, iconColor = 'text-gray-400', change, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          {change && <p className="text-xs text-gray-400">{change}</p>}
        </div>
        <div className={cn('w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center', iconColor)}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  )
}
