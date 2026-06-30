'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  bg?: string
  href?: string
  index?: number
}

// Used by dashboard-client.tsx's top summary bar. Replaces the previously
// unused src/components/dashboard/stat-card.tsx (dead code, removed).
export function StatCard({ label, value, icon: Icon, iconColor = 'text-gray-400', bg = 'bg-gray-50', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2', bg)}>
        <Icon size={15} className={iconColor} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  )
}
