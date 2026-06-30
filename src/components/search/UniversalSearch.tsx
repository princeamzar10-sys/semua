'use client'

import { useMemo } from 'react'
import { Search, X, FolderKanban, CheckSquare, FileText, StickyNote, GraduationCap, DollarSign, Target, Repeat } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMode } from '@/components/navigation/mode-context'
import { usePanel } from '@/providers/panel-provider/panel-context'
import { MOCK_SEARCH_INDEX, MockSearchItem } from '@/lib/workspace/mock-data'
import { useTasks } from '@/features/personal/tasks/hooks/use-tasks'
import { useTransactions } from '@/features/personal/finance/hooks/use-finance'
import { useHabits } from '@/features/personal/habits/hooks/use-habits'
import { useGoals } from '@/features/personal/goals/hooks/use-goals'

const WORKSPACE_TYPE_ICON: Record<MockSearchItem['type'], React.ElementType> = {
  Project: FolderKanban,
  Task: CheckSquare,
  Document: FileText,
  Note: StickyNote,
  Learning: GraduationCap,
}

interface PersonalResult { id: string; title: string; subtitle: string; href: string; icon: React.ElementType; type: string }

export function UniversalSearchTrigger() {
  const { setSearchOpen } = usePanel()
  const { mode } = useMode()
  return (
    <button
      onClick={() => setSearchOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-colors"
    >
      <Search size={14} />
      <span className="hidden sm:inline">
        {mode === 'workspace' ? 'Search projects, meetings, docs…' : 'Search tasks, habits, finance, goals…'}
      </span>
    </button>
  )
}

export function UniversalSearchModal() {
  const { mode } = useMode()
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = usePanel()

  // Cache reads, not new network calls, once a Personal page has loaded these once.
  const { data: tasks = [] } = useTasks()
  const { data: transactions = [] } = useTransactions()
  const { data: habits = [] } = useHabits()
  const { data: goals = [] } = useGoals()

  const close = () => { setSearchOpen(false); setSearchQuery('') }

  const personalResults = useMemo((): PersonalResult[] => {
    if (mode !== 'personal' || !searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const results: PersonalResult[] = []
    tasks.filter(t => t.title.toLowerCase().includes(q)).forEach(t =>
      results.push({ id: `task-${t.id}`, title: t.title, subtitle: t.status.replace('_', ' '), href: '/tasks', icon: CheckSquare, type: 'Task' }))
    habits.filter(h => h.name.toLowerCase().includes(q)).forEach(h =>
      results.push({ id: `habit-${h.id}`, title: h.name, subtitle: `${h.current_streak} day streak`, href: '/habits', icon: Repeat, type: 'Habit' }))
    transactions.filter(t => t.title.toLowerCase().includes(q)).forEach(t =>
      results.push({ id: `tx-${t.id}`, title: t.title, subtitle: t.category, href: '/finance', icon: DollarSign, type: 'Finance' }))
    goals.filter(g => g.title.toLowerCase().includes(q)).forEach(g =>
      results.push({ id: `goal-${g.id}`, title: g.title, subtitle: `${Math.round((g.current_progress / g.target) * 100)}% complete`, href: '/goals', icon: Target, type: 'Goal' }))
    return results.slice(0, 8)
  }, [mode, searchQuery, tasks, habits, transactions, goals])

  const workspaceResults = useMemo(() => {
    if (mode !== 'workspace' || !searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return MOCK_SEARCH_INDEX.filter(item => item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q))
  }, [mode, searchQuery])

  const hasResults = mode === 'personal' ? personalResults.length > 0 : workspaceResults.length > 0
  const placeholder = mode === 'workspace'
    ? 'Search projects, tasks, documents, notes, learning…'
    : 'Search tasks, habits, finance, goals…'
  const emptyHint = mode === 'workspace'
    ? 'Search across Projects, Tasks, Documents, Notes, and Learning — using sample data for now.'
    : 'Search across your Tasks, Habits, Finance, and Goals.'

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40" onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
              <button onClick={close} className="text-gray-400 hover:text-gray-700">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!searchQuery.trim() ? (
                <p className="text-xs text-gray-400 text-center py-8">{emptyHint}</p>
              ) : !hasResults ? (
                <p className="text-xs text-gray-400 text-center py-8">No results for &quot;{searchQuery}&quot;</p>
              ) : mode === 'personal' ? (
                personalResults.map(item => (
                  <Link key={item.id} href={item.href} onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <item.icon size={15} className="text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">{item.type}</span>
                  </Link>
                ))
              ) : (
                workspaceResults.map(item => {
                  const Icon = WORKSPACE_TYPE_ICON[item.type]
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <Icon size={15} className="text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">{item.type}</span>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
