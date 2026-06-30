'use client'

import { motion } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useMode, Mode } from '@/components/navigation/mode-context'
import { cn } from '@/lib/utils'

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'workspace', label: 'Workspace' },
]

// Routes that exist in both modes — switching shouldn't bounce the user away from these.
const SHARED_ROUTES = ['/settings', '/assistant']

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = (value: Mode) => {
    setMode(value)
    if (value === mode) return

    // Always land the user on the target mode's home route, so the app
    // actually "transforms" seamlessly instead of leaving a mismatched page
    // mounted under the new mode's sidebar — except on routes shared by both
    // modes (Settings, Assistant), where switching just updates the sidebar.
    const isShared = SHARED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
    if (isShared) return

    if (value === 'workspace' && !pathname.startsWith('/workspace')) {
      router.push('/workspace')
    } else if (value === 'personal' && pathname.startsWith('/workspace')) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative flex items-center w-full bg-gray-100 rounded-full p-1 gap-1">
      {OPTIONS.map(({ value, label }) => {
        const active = mode === value
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              'relative z-10 flex-1 px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
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
