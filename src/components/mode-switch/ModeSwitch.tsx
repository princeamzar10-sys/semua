'use client'

import { motion } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useMode, Mode } from '@/components/navigation/mode-context'
import { cn } from '@/lib/utils'

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'workspace', label: 'Workspace' },
]

const PERSONAL_ONLY_ROUTES = ['/tasks', '/finance', '/habits', '/goals']

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = (value: Mode) => {
    setMode(value)
    if (value === mode) return

    // Navigate the user out of a route that doesn't exist in the target mode,
    // so the app actually "transforms" instead of leaving a mismatched page
    // mounted under the new mode's sidebar. Shared routes (Settings, Assistant)
    // and routes already valid for the target mode are left alone.
    if (value === 'workspace' && PERSONAL_ONLY_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
      router.push('/workspace')
    } else if (value === 'personal' && pathname.startsWith('/workspace')) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
      {OPTIONS.map(({ value, label }) => {
        const active = mode === value
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              'relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
              active ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {active && (
              <motion.div
                layoutId="mode-pill"
                className={cn('absolute inset-0 rounded-full -z-10', value === 'workspace' ? 'bg-slate-800' : 'bg-black')}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
