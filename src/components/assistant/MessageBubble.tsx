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
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-black text-white px-4 py-2.5 text-sm">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex flex-col gap-2">
        {response?.type === 'message' && (
          <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm px-4 py-2.5 text-sm text-gray-800 whitespace-pre-wrap">
            {response.message}
          </div>
        )}

        {response?.type === 'question' && (
          <div className="rounded-2xl rounded-tl-sm bg-white border border-amber-200 shadow-sm px-4 py-2.5 text-sm text-gray-800">
            <span className="text-amber-600 font-medium">Need info: </span>
            {response.question}
          </div>
        )}

        {response?.type === 'error' && (
          <div className="rounded-2xl rounded-tl-sm bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {response.error}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {results.map((r, i) => {
              const { verb, detail } = actionLabel(r.action)
              return (
                <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${r.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  {r.success
                    ? <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    : <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />}
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-medium ${r.success ? 'text-emerald-700' : 'text-red-600'}`}>{verb}</span>
                    <span className={r.success ? 'text-emerald-600' : 'text-red-500'}>{r.message}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!results && response?.type === 'actions' && (
          <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm px-4 py-2.5 text-sm text-gray-400 italic">
            Review the actions below and confirm to proceed.
          </div>
        )}
      </div>
    </div>
  )
}
