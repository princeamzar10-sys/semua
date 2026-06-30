import { LayoutDashboard, CheckSquare, DollarSign, Target, Repeat, Bot, LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/finance', icon: DollarSign, label: 'Finance' },
  { href: '/habits', icon: Repeat, label: 'Habits' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/assistant', icon: Bot, label: 'AI Agent' },
]
