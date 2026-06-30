'use client'

import { useEffect } from 'react'
import { useQuickAdd } from '@/components/navigation/quick-add-context'

// No longer renders its own CommandBar — just binds the ⌘K/Ctrl+K shortcut
// to the shared QuickAddContext so it controls the single CommandBar instance
// mounted once in (dashboard)/layout.tsx (previously this and Sidebar each
// mounted their own independent CommandBar with separate local state).
export function KeyboardShortcut() {
  const { toggle } = useQuickAdd()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  return null
}
