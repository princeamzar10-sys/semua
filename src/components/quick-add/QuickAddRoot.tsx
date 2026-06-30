'use client'

import { CommandBar } from '@/features/command-bar/components/CommandBar'
import { KeyboardShortcut } from '@/features/command-bar/components/KeyboardShortcut'
import { QuickAddFAB } from '@/components/quick-add/QuickAddFAB'
import { WorkspaceQuickAdd } from '@/components/workspace/quick-add/WorkspaceQuickAdd'
import { useQuickAdd } from '@/components/navigation/quick-add-context'
import { useMode } from '@/components/navigation/mode-context'

// Mounted once in (dashboard)/layout.tsx — owns the single shared modal
// instance, the ⌘K shortcut binding, and the floating Quick Add button.
// Branches between Personal's CommandBar (parses + inserts) and Workspace's
// WorkspaceQuickAdd (navigates to the matching module) based on active mode,
// so the FAB/⌘K/sidebar-button triggers stay unified across both modes.
export function QuickAddRoot() {
  const { open, setOpen } = useQuickAdd()
  const { mode } = useMode()
  const close = () => setOpen(false)

  return (
    <>
      {mode === 'workspace'
        ? <WorkspaceQuickAdd open={open} onClose={close} />
        : <CommandBar open={open} onClose={close} />}
      <KeyboardShortcut />
      <QuickAddFAB />
    </>
  )
}
