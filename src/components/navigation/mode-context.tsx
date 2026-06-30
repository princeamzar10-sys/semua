'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Mode = 'personal' | 'workspace'

const STORAGE_KEY = 'semua:mode'

interface ModeContextValue {
  mode: Mode
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('personal')

  // Hydrate from localStorage after mount — deliberately NOT a lazy useState
  // initializer: that would read localStorage during the client's first render
  // pass and could mismatch the server-rendered ('personal') markup, triggering
  // a hydration warning. This effect is the documented "sync from an external
  // system" use case (https://react.dev/learn/you-might-not-need-an-effect) —
  // same accepted pattern/lint tradeoff as CommandBar.tsx elsewhere in this app.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'personal' || stored === 'workspace') setModeState(stored)
  }, [])

  const setMode = (next: Mode) => {
    setModeState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within a ModeProvider')
  return ctx
}
