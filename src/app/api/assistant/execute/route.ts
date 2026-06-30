import { NextRequest, NextResponse } from 'next/server'
import { ParsedAction } from '@/features/ai-assistant/lib/parser'
import { executeActions } from '@/features/ai-assistant/lib/actionRouter'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { actions } = body as { actions: ParsedAction[] }
    if (!actions?.length) return NextResponse.json({ error: 'No actions provided' }, { status: 400 })

    const results = await executeActions(actions)
    return NextResponse.json({ results })
  } catch (err) {
    console.error('[assistant/execute]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message === 'Not authenticated') return NextResponse.json({ error: message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to execute actions' }, { status: 500 })
  }
}
