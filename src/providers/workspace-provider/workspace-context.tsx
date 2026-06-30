'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Workspace-internal UI state only — deliberately separate from ModeContext
// (app-wide mode switching) and PanelProvider (shared search/right-panel
// state, used by both modes). This provider only exists within /workspace/*.
// Search/right-panel state used to live here; it moved to PanelProvider
// once both modes needed it, leaving this scoped to genuinely
// workspace-only concerns like the active module.
interface WorkspaceContextValue {
  activeModule: string | null
  setActiveModule: (id: string | null) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  return (
    <WorkspaceContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider')
  return ctx
}
