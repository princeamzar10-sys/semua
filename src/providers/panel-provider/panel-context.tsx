'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// App-wide UI state for the shared Universal Search + Right Panel —
// genuinely shared between Personal and Workspace (unlike WorkspaceProvider,
// which holds workspace-internal-only state). Mounted once at the root layout.
interface PanelContextValue {
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  rightPanelCollapsed: boolean
  setRightPanelCollapsed: (collapsed: boolean) => void
}

const PanelContext = createContext<PanelContextValue | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  return (
    <PanelContext.Provider value={{
      searchOpen, setSearchOpen,
      searchQuery, setSearchQuery,
      rightPanelCollapsed, setRightPanelCollapsed,
    }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel(): PanelContextValue {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel must be used within a PanelProvider')
  return ctx
}
