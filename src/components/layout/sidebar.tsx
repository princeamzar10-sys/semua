'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, DollarSign, Target, Repeat,
  Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, Plus, Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { CommandBar } from '@/components/CommandBar'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/finance', icon: DollarSign, label: 'Finance' },
  { href: '/habits', icon: Repeat, label: 'Habits' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/assistant', icon: Bot, label: 'AI Agent' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col h-screen bg-white border-r border-gray-100 shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0">
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
            onClick={() => setCmdOpen(true)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors',
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
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={active ? {} : { backgroundColor: '#f3f4f6' }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                    active ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="py-4 px-2 border-t border-gray-100 space-y-0.5">
          <Link href="/settings">
            <motion.div
              whileHover={pathname === '/settings' ? {} : { backgroundColor: '#f3f4f6' }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-500 hover:text-gray-900',
                pathname === '/settings' && 'bg-black text-white'
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
            </motion.div>
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

      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
