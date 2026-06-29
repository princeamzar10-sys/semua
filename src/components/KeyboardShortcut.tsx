'use client'

import { useEffect, useState } from 'react'
import { CommandBar } from '@/components/CommandBar'

export function KeyboardShortcut() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return <CommandBar open={open} onClose={() => setOpen(false)} />
}
