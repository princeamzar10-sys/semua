'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Suggestion } from '@/lib/ai-suggestions'
import { cn } from '@/lib/utils'

const icons = {
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
}
const colors = {
  warning: 'text-amber-500 bg-amber-50',
  success: 'text-emerald-500 bg-emerald-50',
  info: 'text-blue-500 bg-blue-50',
}

interface AIWidgetProps {
  suggestions: Suggestion[]
}

export function AIWidget({ suggestions }: AIWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Smart Suggestions</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {suggestions.map((s, i) => {
            const Icon = icons[s.priority]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5', colors[s.priority])}>
                  <Icon size={12} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.message}</p>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
