'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { WORKSPACE_MODULES } from '@/lib/workspace/modules'

interface WorkspaceQuickAddProps {
  open: boolean
  onClose: () => void
}

const EXAMPLES = ['New Project', 'New Meeting', 'Meeting Notes', 'New Task', 'Learning Record', 'Document']

// Keyword → module id. No NL parsing library needed yet — there's nothing to
// insert into a DB for Workspace, just navigation. Gemini-powered intent
// parsing plugs in here later, replacing this keyword match with a real call.
function matchModule(text: string): string | null {
  const lower = text.toLowerCase()
  for (const m of WORKSPACE_MODULES) {
    if (lower.includes(m.id) || lower.includes(m.title.toLowerCase()) || lower.includes(m.title.toLowerCase().replace(/s$/, ''))) {
      return m.id
    }
  }
  if (lower.includes('note')) return 'notes'
  return null
}

export function WorkspaceQuickAdd({ open, onClose }: WorkspaceQuickAddProps) {
  const router = useRouter()
  const [input, setInput] = useState('')

  const go = (text: string) => {
    const matched = matchModule(text)
    onClose()
    setInput('')
    router.push(matched ? `/workspace/${matched}` : '/workspace')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Sparkles size={16} className="text-violet-500 shrink-0" />
              <input
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && input.trim()) go(input) }}
                placeholder="New project, meeting notes, document…"
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="p-2">
              {input.trim() ? (
                <button
                  onClick={() => go(input)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm text-gray-800">Go to the matching module for &quot;{input}&quot;</span>
                  <ArrowRight size={14} className="text-gray-400 shrink-0" />
                </button>
              ) : (
                <>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-300">Try</p>
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => go(ex)}
                      className="w-full text-left text-sm px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </>
              )}
            </div>

            <p className="px-4 pb-3 text-xs text-gray-400">
              Today this navigates to the right module. Gemini will soon turn this into real action creation.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
