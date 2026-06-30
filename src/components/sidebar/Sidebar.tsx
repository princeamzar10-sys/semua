'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/features/authentication/services/client'
import { useState } from 'react'
import { useMode } from '@/components/navigation/mode-context'
import { useQuickAdd } from '@/components/navigation/quick-add-context'
import { getNavSections, NavItem } from '@/components/navigation/nav-registry'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { mode } = useMode()
  const { setOpen: setQuickAddOpen } = useQuickAdd()
  const [collapsed, setCollapsed] = useState(false)

  const sections = getNavSections(mode)
  const isWorkspace = mode === 'workspace'
  const accentBg = isWorkspace ? 'bg-slate-900' : 'bg-black'
  const accentHoverBg = isWorkspace ? 'hover:bg-slate-800' : 'hover:bg-gray-800'
  const itemRadius = isWorkspace ? 'rounded-lg' : 'rounded-xl'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => {
    const [path] = href.split('?')
    return pathname === path || pathname.startsWith(path + '/')
  }

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = !item.disabled && isActive(item.href)

    const content = (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 transition-colors',
          itemRadius,
          item.disabled
            ? 'text-gray-300 cursor-not-allowed'
            : active
              ? cn(accentBg, 'text-white cursor-pointer')
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
        )}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium flex-1"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && item.badge && (
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
            {item.badge}
          </span>
        )}
      </div>
    )

    if (item.disabled) return <div key={item.label}>{content}</div>
    return (
      <Link key={item.label} href={item.href}>
        {content}
      </Link>
    )
  }

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative hidden md:flex flex-col h-full bg-white border-r border-gray-100 shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
          <div className={cn('w-8 h-8 flex items-center justify-center shrink-0', itemRadius, accentBg)}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-semibold text-base tracking-tight text-gray-900"
              >
                Semua
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Add button */}
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => setQuickAddOpen(true)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 text-white transition-colors',
              itemRadius, accentBg, accentHoverBg,
              collapsed && 'justify-center'
            )}
          >
            <Plus size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                  Quick Add
                </motion.span>
              )}
            </AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="ml-auto text-[10px] text-gray-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
                ⌘K
              </motion.span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-4' : ''}>
              {section.label && !collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-300">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(renderItem)}
              </div>
              {si < sections.length - 1 && <div className="mt-4 mx-3 border-t border-gray-100" />}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="py-4 px-2 border-t border-gray-100 space-y-0.5">
          <Link href="/settings">
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                itemRadius,
                pathname === '/settings'
                  ? cn(accentBg, 'text-white')
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Settings size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
          <motion.button
            whileHover={{ backgroundColor: '#f3f4f6' }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-500"
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-700 transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>
    </>
  )
}
