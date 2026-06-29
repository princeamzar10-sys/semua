'use client'

import { AssistantResponse, ParsedAction, actionLabel } from '@/lib/ai/parser'
import { CheckCircle2, XCircle } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content?: string
  response?: AssistantResponse
  results?: { action: ParsedAction; success: boolean; message: string }[]
  timestamp: Date
}

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const { role, content, response, results } = message

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white text-black px-4 py-2.5 text-sm">
          {content}
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex flex-col gap-2">
        {/* Text / question / message */}
        {response?.type === 'message' && (
          <div className="rounded-2xl rounded-tl-sm bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 whitespace-pre-wrap">
            {response.message}
          </div>
        )}

        {response?.type === 'question' && (
          <div className="rounded-2xl rounded-tl-sm bg-zinc-800 border border-amber-500/30 px-4 py-2.5 text-sm text-zinc-200">
            <span className="text-amber-400 font-medium">Need info: </span>
            {response.question}
          </div>
        )}

        {response?.type === 'error' && (
          <div className="rounded-2xl rounded-tl-sm bg-red-950/50 border border-red-700/30 px-4 py-2.5 text-sm text-red-300">
            {response.error}
          </div>
        )}

        {/* Execution results */}
        {results && results.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {results.map((r, i) => {
              const { verb, detail } = actionLabel(r.action)
              return (
                <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${r.success ? 'bg-emerald-950/50 border border-emerald-700/30' : 'bg-red-950/50 border border-red-700/30'}`}>
                  {r.success
                    ? <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                    : <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />}
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-medium ${r.success ? 'text-emerald-300' : 'text-red-300'}`}>{verb}</span>
                    <span className={r.success ? 'text-emerald-400/80' : 'text-red-400/80'}>{r.message}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pending actions text (before confirmation) */}
        {!results && response?.type === 'actions' && (
          <div className="rounded-2xl rounded-tl-sm bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400 italic">
            Review the actions below and confirm to proceed.
          </div>
        )}
      </div>
    </div>
  )
}
