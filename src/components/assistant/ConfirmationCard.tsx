'use client'

import { ParsedAction, actionLabel } from '@/lib/ai/parser'
import { CheckCircle, AlertTriangle, Trash2, Zap } from 'lucide-react'

interface Props {
  actions: ParsedAction[]
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const DESTRUCTIVE = new Set(['delete_task', 'delete_habit', 'delete_goal', 'delete_transaction'])

export function ConfirmationCard({ actions, onConfirm, onCancel, loading }: Props) {
  const hasDestructive = actions.some(a => DESTRUCTIVE.has(a.type))

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
        <Zap size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {actions.length === 1 ? '1 action' : `${actions.length} actions`} to confirm
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {actions.map((action, i) => {
          const { verb, detail } = actionLabel(action)
          const isDestructive = DESTRUCTIVE.has(action.type)
          return (
            <div key={i} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${isDestructive ? 'bg-red-950/40 border border-red-800/30' : 'bg-zinc-800'}`}>
              {isDestructive
                ? <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                : <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-xs font-semibold ${isDestructive ? 'text-red-300' : 'text-zinc-200'}`}>{verb}</span>
                <span className="text-xs text-zinc-400 truncate">{detail}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-zinc-700 flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            hasDestructive
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-white hover:bg-zinc-100 text-black'
          }`}
        >
          {loading ? 'Running…' : hasDestructive ? 'Confirm Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}
