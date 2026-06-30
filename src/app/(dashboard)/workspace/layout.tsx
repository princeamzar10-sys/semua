import { WorkspaceProvider } from '@/providers/workspace-provider/workspace-context'

// Scoped to /workspace/* only — holds workspace-internal-only state
// (activeModule, etc). Universal Search and the Right Panel are now
// shared/global infrastructure mounted once in the root (dashboard)/layout.tsx.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      {children}
    </WorkspaceProvider>
  )
}
