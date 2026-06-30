import { LayoutDashboard, Bot } from 'lucide-react'
import { NavSection, NavItem } from '@/components/navigation/nav-registry'
import { WORKSPACE_MODULES, SidebarGroup } from '@/lib/workspace/modules'

const GROUP_ORDER: SidebarGroup[] = ['Work', 'Knowledge', 'Performance', 'Automation']

// Module nav items are clickable (each routes to a real, working placeholder
// page) — the "Soon" badge communicates coming-soon status, not `disabled`.
const moduleNavItems: NavItem[] = WORKSPACE_MODULES.map(m => ({
  href: m.route,
  icon: m.icon,
  label: m.title,
  description: m.description,
  badge: m.badge ?? 'Soon',
}))

const groupedSections: NavSection[] = GROUP_ORDER.map(group => ({
  label: group,
  items: moduleNavItems.filter((_, i) => WORKSPACE_MODULES[i].sidebarGroup === group),
}))

export const workspaceNavSections: NavSection[] = [
  {
    items: [
      { href: '/workspace', icon: LayoutDashboard, label: 'Dashboard', description: 'Your Workspace overview' },
      { href: '/assistant', icon: Bot, label: 'Assistant', description: 'AI-powered help (coming soon)' },
    ],
  },
  ...groupedSections,
]
