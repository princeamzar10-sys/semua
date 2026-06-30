import { LucideIcon } from 'lucide-react'
import { Mode } from '@/components/navigation/mode-context'
import { personalNavSections } from '@/features/personal/nav.config'
import { workspaceNavSections } from '@/features/workspace/nav.config'

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  description?: string
  disabled?: boolean
  /** Registry-level visibility — defaults to true. Lets a module be registered but hidden behind a flag. */
  visible?: boolean
  badge?: string
  /** Reserved for a future roles/permissions system — unused today. */
  permissions?: string[]
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export const NAV_REGISTRY: Record<Mode, NavSection[]> = {
  personal: personalNavSections,
  workspace: workspaceNavSections,
}

export function getNavSections(mode: Mode): NavSection[] {
  return NAV_REGISTRY[mode]
    .map(section => ({ ...section, items: section.items.filter(item => item.visible !== false) }))
    .filter(section => section.items.length > 0)
}
