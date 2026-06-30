'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseInput, ParseResult } from '@/features/command-bar/lib/parser'
import { executeCommand } from '@/features/command-bar/lib/commandHandler'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles, X, ArrowRight, Loader2, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const EXAMPLES = [
  'Paid RM25 for lunch',
  'Finish assignment Friday',
  'Gym daily',
  'Save RM5000 in 3 months',
  'Submit report tomorrow',
  'Spent RM80 groceries',
  'Read book daily',
  'Call client next Monday',
]

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  finance: { label: 'Finance', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '💳' },
  task:    { label: 'Task',    color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',   icon: '✅' },
  habit:   { label: 'Habit',   color: 'text-orange-700',bg: 'bg-orange-50 border-orange-200',icon: '🔥' },
  goal:    { label: 'Goal',    color: 'text-purple-700',bg: 'bg-purple-50 border-purple-200',icon: '🎯' },
  unknown: { label: 'Unknown', color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-200',   icon: '❓' },
}

function PreviewCard({ parsed }: { parsed: ParseResult }) {
  const meta = TYPE_META[parsed.type]

  const rows: { label: string; value: string }[] = []

  if (parsed.type === 'finance') {
    rows.push({ label: 'Type', value: parsed.data.type === 'income' ? 'Income' : 'Expense' })
    rows.push({ label: 'Title', value: parsed.data.title })
    rows.push({ label: 'Amount', value: `RM${parsed.data.amount.toFixed(2)}` })
    rows.push({ label: 'Category', value: parsed.data.category })
    rows.push({ label: 'Date', value: format(new Date(parsed.data.date), 'MMM d, yyyy') })
  } else if (parsed.type === 'task') {
    rows.push({ label: 'Title', value: parsed.data.title })
    rows.push({ label: 'Due', value: parsed.data.due_date ? format(new Date(parsed.data.due_date), 'EEE, MMM d') : 'No date' })
    rows.push({ label: 'Priority', value: parsed.data.priority })
  } else if (parsed.type === 'habit') {
    rows.push({ label: 'Name', value: `${parsed.data.emoji} ${parsed.data.name}` })
    rows.push({ label: 'Frequency', value: parsed.data.frequency })
  } else if (parsed.type === 'goal') {
    rows.push({ label: 'Title', value: parsed.data.title })
    rows.push({ label: 'Target', value: String(parsed.data.target) })
    if (parsed.data.deadline) rows.push({ label: 'Deadline', value: format(new Date(parsed.data.deadline), 'MMM d, yyyy') })
    if (parsed.data.category) rows.push({ label: 'Category', value: parsed.data.category })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className={cn('rounded-xl border p-4 mt-3', meta.bg)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{meta.icon}</span>
        <span className={cn('text-xs font-bold uppercase tracking-wider', meta.color)}>{meta.label} detected</span>
      </div>
      <div className="space-y-1.5">
        {rows.map(r => (
          <div key={r.label} className="flex items-start gap-3 text-sm">
            <span className="text-gray-400 w-16 shrink-0">{r.label}</span>
            <span className="font-medium text-gray-900 capitalize">{r.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

interface CommandBarProps {
  open: boolean
  onClose: () => void
}

export function CommandBar({ open, onClose }: CommandBarProps) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  // Parse in real-time as user types
  useEffect(() => {
    if (input.trim().length < 3) { setParsed(null); return }
    const timer = setTimeout(() => setParsed(parseInput(input)), 200)
    return () => clearTimeout(timer)
  }, [input])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setInput('')
      setParsed(null)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!parsed || parsed.type === 'unknown') return
    setSaving(true)
    try {
      await executeCommand(parsed)
      // Invalidate relevant queries so UI refreshes
      const queryMap: Record<string, string[]> = {
        finance: ['transactions'],
        task: ['tasks'],
        habit: ['habits'],
        goal: ['goals'],
      }
      await qc.invalidateQueries({ queryKey: queryMap[parsed.type] })

      let message = 'Saved!'
      if (parsed.type === 'finance') message = `💳 ${parsed.data.type === 'income' ? 'Income' : 'Expense'} recorded — RM${parsed.data.amount.toFixed(2)}`
      else if (parsed.type === 'task') message = `✅ Task created — "${parsed.data.title}"`
      else if (parsed.type === 'habit') message = `🔥 Habit added — ${parsed.data.emoji} ${parsed.data.name}`
      else if (parsed.type === 'goal') message = `🎯 Goal set — "${parsed.data.title}"`
      toast.success(message)
      onClose()
      setInput('')
      setParsed(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsed && parsed.type !== 'unknown') handleConfirm()
    if (e.key === 'Escape') onClose()
  }

  const tryExample = (ex: string) => setInput(ex)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <Sparkles size={16} className="text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Type anything... "Paid RM25 lunch", "Gym daily", "Finish report Friday"`}
                  className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                />
                {input && (
                  <button onClick={() => { setInput(''); setParsed(null) }}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <RotateCcw size={13} />
                  </button>
                )}
                <button onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="px-4 pb-4 pt-3">
                <AnimatePresence mode="wait">
                  {!input && (
                    <motion.div key="examples" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs text-gray-400 mb-2 font-medium">Try these examples</p>
                      <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map(ex => (
                          <button key={ex} onClick={() => tryExample(ex)}
                            className="text-xs px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-100">
                            {ex}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {input && parsed && parsed.type !== 'unknown' && (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <PreviewCard parsed={parsed} />
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={handleConfirm}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors disabled:opacity-60"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                          {saving ? 'Saving…' : 'Confirm'}
                        </button>
                        <span className="text-xs text-gray-400">or press Enter</span>
                        <span className="text-xs text-gray-400 ml-auto">Esc to cancel</span>
                      </div>
                    </motion.div>
                  )}

                  {input && parsed?.type === 'unknown' && input.trim().length >= 3 && (
                    <motion.div key="unknown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 py-3 text-sm text-gray-400">
                      <span>🤔</span>
                      <span>Couldn't classify that. Try starting with a verb like "Paid", "Finish", or "Gym daily".</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-300">Semua Quick Add</span>
                <div className="flex items-center gap-3 text-[11px] text-gray-300">
                  <span><kbd className="font-mono">Enter</kbd> confirm</span>
                  <span><kbd className="font-mono">Esc</kbd> close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
