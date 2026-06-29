export type ActionType =
  | 'create_task' | 'complete_task' | 'update_task' | 'delete_task'
  | 'create_expense' | 'create_income' | 'update_transaction' | 'delete_transaction'
  | 'create_habit' | 'complete_habit' | 'update_habit' | 'delete_habit'
  | 'create_goal' | 'update_goal_progress' | 'complete_goal' | 'delete_goal'
  | 'summarize_dashboard' | 'generate_insights'

export interface ParsedAction {
  type: ActionType
  data: Record<string, unknown>
}

export type AssistantResponse =
  | { type: 'actions'; actions: ParsedAction[] }
  | { type: 'question'; question: string }
  | { type: 'message'; message: string }
  | { type: 'error'; error: string }

const VALID_ACTIONS = new Set<ActionType>([
  'create_task', 'complete_task', 'update_task', 'delete_task',
  'create_expense', 'create_income', 'update_transaction', 'delete_transaction',
  'create_habit', 'complete_habit', 'update_habit', 'delete_habit',
  'create_goal', 'update_goal_progress', 'complete_goal', 'delete_goal',
  'summarize_dashboard', 'generate_insights',
])

export function parseGeminiResponse(raw: string): AssistantResponse {
  // Strip any markdown code fences Gemini might add despite instructions
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Gemini returned non-JSON — treat as a message
    return { type: 'message', message: raw.trim() }
  }

  const type = parsed.type as string

  if (type === 'question' && typeof parsed.question === 'string') {
    return { type: 'question', question: parsed.question }
  }

  if (type === 'message' && typeof parsed.message === 'string') {
    return { type: 'message', message: parsed.message }
  }

  if (type === 'actions' && Array.isArray(parsed.actions)) {
    const actions: ParsedAction[] = []
    for (const item of parsed.actions) {
      if (typeof item.type !== 'string' || !VALID_ACTIONS.has(item.type as ActionType)) continue
      actions.push({
        type: item.type as ActionType,
        data: (item.data as Record<string, unknown>) ?? {},
      })
    }
    if (actions.length > 0) return { type: 'actions', actions }
  }

  return { type: 'error', error: 'Could not understand AI response. Please try again.' }
}

// Human-readable label for each action type shown in confirmation card
export function actionLabel(action: ParsedAction): { verb: string; detail: string } {
  const d = action.data
  switch (action.type) {
    case 'create_task':      return { verb: 'Create Task', detail: `"${d.title}"${d.due_date ? ` · due ${d.due_date}` : ''}` }
    case 'complete_task':    return { verb: 'Complete Task', detail: `"${d.name}"` }
    case 'update_task':      return { verb: 'Update Task', detail: `"${d.name}"` }
    case 'delete_task':      return { verb: 'Delete Task', detail: `"${d.name}"` }
    case 'create_expense':   return { verb: 'Record Expense', detail: `RM${d.amount} · ${d.title}` }
    case 'create_income':    return { verb: 'Record Income', detail: `RM${d.amount} · ${d.title}` }
    case 'update_transaction': return { verb: 'Update Transaction', detail: `"${d.name}"` }
    case 'delete_transaction': return { verb: 'Delete Transaction', detail: `"${d.name}"` }
    case 'create_habit':     return { verb: 'Create Habit', detail: `${d.emoji ?? '🎯'} ${d.name} · ${d.frequency}` }
    case 'complete_habit':   return { verb: 'Complete Habit', detail: `"${d.name}"` }
    case 'update_habit':     return { verb: 'Update Habit', detail: `"${d.name}"` }
    case 'delete_habit':     return { verb: 'Delete Habit', detail: `"${d.name}"` }
    case 'create_goal':      return { verb: 'Create Goal', detail: `"${d.title}"${d.deadline ? ` · by ${d.deadline}` : ''}` }
    case 'update_goal_progress': return { verb: 'Update Goal', detail: `"${d.name}" → ${d.current_progress}` }
    case 'complete_goal':    return { verb: 'Complete Goal', detail: `"${d.name}"` }
    case 'delete_goal':      return { verb: 'Delete Goal', detail: `"${d.name}"` }
    case 'summarize_dashboard': return { verb: 'Dashboard Summary', detail: 'Fetching your overview' }
    case 'generate_insights':   return { verb: 'Generate Insights', detail: 'Analysing your data' }
    default:                 return { verb: action.type, detail: '' }
  }
}

// Read-only actions skip confirmation
export function isReadOnly(action: ParsedAction): boolean {
  return action.type === 'summarize_dashboard' || action.type === 'generate_insights'
}
