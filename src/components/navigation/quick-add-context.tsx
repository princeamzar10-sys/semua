'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface QuickAddContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null)

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(prev => !prev)

  return (
    <QuickAddContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </QuickAddContext.Provider>
  )
}

export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext)
  if (!ctx) throw new Error('useQuickAdd must be used within a QuickAddProvider')
  return ctx
}
