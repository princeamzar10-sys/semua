import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { callGemini } from '@/lib/ai/gemini'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import { parseGeminiResponse } from '@/lib/ai/parser'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { message, history = [] } = body as {
      message: string
      history: { role: 'user' | 'model'; parts: [{ text: string }] }[]
    }

    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const systemPrompt = buildSystemPrompt()
    const raw = await callGemini(systemPrompt, history, message)
    const parsed = parseGeminiResponse(raw)

    return NextResponse.json({ response: parsed })
  } catch (err) {
    console.error('[assistant/route]', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
