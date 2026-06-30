import { LayoutDashboard, Bot, CheckSquare, Repeat, Target, Receipt, TrendingUp, Wallet, FileText, Settings, Calendar } from 'lucide-react'
import { NavSection } from '@/components/navigation/nav-registry'

export const personalNavSections: NavSection[] = [
  {
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Your personal overview' },
      { href: '/assistant', icon: Bot, label: 'Assistant', description: 'AI-powered help' },
      { href: '/calendar', icon: Calendar, label: 'Calendar', description: 'Unified schedule view', disabled: true, badge: 'Soon' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { href: '/habits', icon: Repeat, label: 'Habits' },
      { href: '/goals', icon: Target, label: 'Goals' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/finance?type=expense', icon: Receipt, label: 'Expenses' },
      { href: '/finance?type=income', icon: TrendingUp, label: 'Income' },
      { href: '/finance/budget', icon: Wallet, label: 'Budget', disabled: true, badge: 'Soon' },
      { href: '/finance/tax', icon: FileText, label: 'Tax', disabled: true, badge: 'Soon' },
    ],
  },
  {
    items: [
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]
