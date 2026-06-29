'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Loader2 } from 'lucide-react'
import { AssistantResponse, ParsedAction, isReadOnly } from '@/lib/ai/parser'
import { MessageBubble, Message } from './MessageBubble'
import { ConfirmationCard } from './ConfirmationCard'
import { toast } from 'sonner'

interface HistoryItem {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

const EXAMPLES = [
  'Add expense: lunch RM15 today',
  'Create task: Review proposal due Friday',
  'I completed my gym habit today',
  'How am I doing this month?',
  'Create a goal: Read 12 books, target 12',
]

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [pendingActions, setPendingActions] = useState<ParsedAction[] | null>(null)
  const [pendingMsgId, setPendingMsgId] = useState<string | null>(null)
  const [geminiHistory, setGeminiHistory] = useState<HistoryItem[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingActions])

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>): string => {
    const id = crypto.randomUUID()
    setMessages(prev => [...prev, { ...msg, id, timestamp: new Date() }])
    return id
  }, [])

  const updateMessage = useCallback((id: string, update: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...update } : m))
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    addMessage({ role: 'user', content: trimmed })
    setLoading(true)
    setPendingActions(null)
    setPendingMsgId(null)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: geminiHistory }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')

      const response: AssistantResponse = data.response

      setGeminiHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: trimmed }] },
        { role: 'model', parts: [{ text: JSON.stringify(response) }] },
      ])

      if (response.type === 'actions') {
        const readOnly = response.actions.filter(isReadOnly)
        const writeActions = response.actions.filter(a => !isReadOnly(a))

        // Execute read-only actions immediately
        if (readOnly.length) {
          const execRes = await fetch('/api/assistant/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actions: readOnly }),
          })
          const execData = await execRes.json()
          const roResults = execData.results ?? []
          const combinedMsg = roResults.map((r: { message: string }) => r.message).join('\n\n')
          addMessage({
            role: 'assistant',
            response: { type: 'message', message: combinedMsg },
          })
        }

        if (writeActions.length) {
          const msgId = addMessage({ role: 'assistant', response })
          setPendingMsgId(msgId)
          setPendingActions(writeActions)
        }
      } else {
        addMessage({ role: 'assistant', response })
      }
    } catch (err) {
      addMessage({
        role: 'assistant',
        response: { type: 'error', error: err instanceof Error ? err.message : 'Something went wrong' },
      })
    } finally {
      setLoading(false)
    }
  }, [loading, geminiHistory, addMessage])

  const confirmActions = useCallback(async () => {
    if (!pendingActions?.length) return
    setExecuting(true)

    try {
      const res = await fetch('/api/assistant/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: pendingActions }),
      })
      const data = await res.json()
      const results = data.results ?? []

      if (pendingMsgId) updateMessage(pendingMsgId, { results })

      const allOk = results.every((r: { success: boolean }) => r.success)
      if (allOk) toast.success('All actions completed!')
      else toast.error('Some actions failed â€” check the results.')
    } catch {
      toast.error('Failed to execute actions')
    } finally {
      setPendingActions(null)
      setPendingMsgId(null)
      setExecuting(false)
    }
  }, [pendingActions, pendingMsgId, updateMessage])

  const cancelActions = useCallback(() => {
    if (pendingMsgId) {
      updateMessage(pendingMsgId, {
        response: { type: 'message', message: 'Action cancelled.' },
      })
    }
    setPendingActions(null)
    setPendingMsgId(null)
  }, [pendingMsgId, updateMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100/60 bg-white/70 backdrop-blur-md flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">AI Agent</h1>
          <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200 flex items-center justify-center">
              <Sparkles size={28} className="text-violet-500" />
            </div>
            <div>
              <p className="text-gray-800 font-medium mb-1">What can I help you with?</p>
              <p className="text-gray-400 text-sm">Add tasks, log expenses, track habits â€” just say it naturally.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => sendMessage(ex)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Confirmation card */}
        <AnimatePresence>
          {pendingActions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ConfirmationCard
                actions={pendingActions}
                onConfirm={confirmActions}
                onCancel={cancelActions}
                loading={executing}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 size={14} className="animate-spin" />
            <span>Thinkingâ€¦</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100/60 bg-white/70 backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || executing}
            placeholder="Ask me anything or give me a commandâ€¦"
            rows={1}
            className="flex-1 resize-none rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-50 max-h-32 overflow-y-auto transition-colors"
            style={{ height: 'auto' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || executing}
            className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
          >
            <Send size={16} className="text-black" />
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">Enter to send Â· Shift+Enter for new line</p>
      </div>
    </div>
  )
}

