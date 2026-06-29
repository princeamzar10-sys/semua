import { format, addDays, nextMonday, nextFriday, nextSaturday, nextSunday, parseISO } from 'date-fns'

export type ParsedType = 'task' | 'finance' | 'habit' | 'goal' | 'unknown'

export interface ParsedFinance {
  type: 'finance'
  data: {
    title: string
    amount: number
    category: string
    type: 'income' | 'expense'
    date: string
  }
}

export interface ParsedTask {
  type: 'task'
  data: {
    title: string
    due_date: string | null
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'todo'
  }
}

export interface ParsedHabit {
  type: 'habit'
  data: {
    name: string
    frequency: 'daily' | 'weekly'
    emoji: string
  }
}

export interface ParsedGoal {
  type: 'goal'
  data: {
    title: string
    target: number
    current_progress: number
    deadline: string | null
    category: string | null
    status: 'active'
  }
}

export interface ParsedUnknown {
  type: 'unknown'
  data: { raw: string }
}

export type ParseResult = ParsedFinance | ParsedTask | ParsedHabit | ParsedGoal | ParsedUnknown

// ─── helpers ────────────────────────────────────────────────────────────────

const FINANCE_VERBS = /\b(paid|pay|spent|spend|bought|buy|purchased|purchase|cost|costs|costed|owe|charged)\b/i
const INCOME_VERBS = /\b(received|got|earned|income|salary|freelance|payment in|deposited)\b/i
const RM_PATTERN = /\bRM\s*(\d+(?:\.\d{1,2})?)/i
const NUMBER_BEFORE_PATTERN = /\b(\d+(?:\.\d{1,2})?)\s*(?:rm|ringgit|bucks?|dollars?)/i
const HABIT_WORDS = /\b(daily|every day|everyday|each day|weekly|every week|each week|each morning|each night|every morning|every night)\b/i
const GOAL_SAVE_PATTERN = /\bsave\b.*\bRM\s*(\d+(?:\.\d{1,2})?)/i
const GOAL_LOSE_PATTERN = /\blose\b.*\b(\d+(?:\.\d{1,2})?)\s*kg\b/i
const GOAL_READ_PATTERN = /\bread\b.*\b(\d+)\s*books?\b/i

const CATEGORY_MAP: Record<string, string[]> = {
  Food: ['lunch', 'dinner', 'breakfast', 'food', 'eat', 'ate', 'meal', 'restaurant', 'cafe', 'coffee', 'snack', 'drink', 'makan', 'nasi', 'burger', 'pizza', 'roti', 'teh', 'kopi'],
  Transport: ['grab', 'uber', 'bus', 'train', 'lrt', 'mrt', 'commuter', 'taxi', 'petrol', 'gas', 'fuel', 'parking', 'toll', 'flight', 'ticket', 'transport'],
  Shopping: ['shopping', 'groceries', 'clothes', 'shoes', 'shirt', 'pants', 'dress', 'bag', 'online', 'lazada', 'shopee', 'amazon'],
  Bills: ['bill', 'bills', 'electric', 'water', 'internet', 'wifi', 'rent', 'utilities', 'subscription', 'netflix', 'spotify'],
  Health: ['gym', 'doctor', 'clinic', 'medicine', 'pharmacy', 'hospital', 'dental', 'health'],
  Entertainment: ['movie', 'cinema', 'game', 'concert', 'event', 'ticket'],
  Education: ['book', 'books', 'course', 'tuition', 'class', 'study', 'school', 'university'],
}

const HABIT_EMOJI_MAP: Record<string, string> = {
  gym: '💪', exercise: '🏃', run: '🏃', running: '🏃', walk: '🚶', walking: '🚶',
  read: '📚', reading: '📚', book: '📚',
  meditate: '🧘', meditation: '🧘', yoga: '🧘',
  water: '💧', drink: '💧',
  sleep: '😴', journal: '✍️', write: '✍️', writing: '✍️',
  study: '📖', learn: '📖', code: '💻', coding: '💻',
  diet: '🥗', eat: '🥗', healthy: '🥗',
  music: '🎵', pray: '🙏', prayer: '🙏',
}

function guessEmoji(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, emoji] of Object.entries(HABIT_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '🎯'
}

function guessCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}

function extractAmount(text: string): number | null {
  const rmMatch = text.match(RM_PATTERN)
  if (rmMatch) return parseFloat(rmMatch[1])
  const numMatch = text.match(NUMBER_BEFORE_PATTERN)
  if (numMatch) return parseFloat(numMatch[1])
  return null
}

function extractTitle(text: string): string {
  let t = text
  // strip RM amounts
  t = t.replace(/RM\s*\d+(?:\.\d{1,2})?/gi, '')
  t = t.replace(/\d+(?:\.\d{1,2})?\s*(?:ringgit|bucks?)/gi, '')
  // strip finance verbs
  t = t.replace(FINANCE_VERBS, '')
  t = t.replace(INCOME_VERBS, '')
  // strip prepositions after verb
  t = t.replace(/\b(for|on|at|from)\b/gi, '')
  // strip date words
  t = t.replace(/\b(tomorrow|today|tonight|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|next month)\b/gi, '')
  t = t.replace(/\bat\s+\d+(?::\d{2})?\s*(?:am|pm)?\b/gi, '')
  t = t.replace(/\b\d+(?::\d{2})?\s*(?:am|pm)\b/gi, '')
  // clean
  t = t.replace(/\s+/g, ' ').trim()
  // capitalize first letter
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function resolveDate(text: string): string | null {
  const lower = text.toLowerCase()
  const today = new Date()

  if (/\btoday\b|\btonight\b/.test(lower)) return format(today, 'yyyy-MM-dd')
  if (/\btomorrow\b/.test(lower)) return format(addDays(today, 1), 'yyyy-MM-dd')
  if (/\bnext week\b/.test(lower)) return format(addDays(today, 7), 'yyyy-MM-dd')
  if (/\bnext month\b/.test(lower)) return format(addDays(today, 30), 'yyyy-MM-dd')
  if (/\bmonday\b/.test(lower)) return format(nextMonday(today), 'yyyy-MM-dd')
  if (/\btuesday\b/.test(lower)) return format(addDays(nextMonday(today), 1), 'yyyy-MM-dd')
  if (/\bwednesday\b/.test(lower)) return format(addDays(nextMonday(today), 2), 'yyyy-MM-dd')
  if (/\bthursday\b/.test(lower)) return format(addDays(nextMonday(today), 3), 'yyyy-MM-dd')
  if (/\bfriday\b/.test(lower)) return format(nextFriday(today), 'yyyy-MM-dd')
  if (/\bsaturday\b/.test(lower)) return format(nextSaturday(today), 'yyyy-MM-dd')
  if (/\bsunday\b/.test(lower)) return format(nextSunday(today), 'yyyy-MM-dd')

  // "in 3 days", "in 2 weeks"
  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/)
  if (inDays) return format(addDays(today, parseInt(inDays[1])), 'yyyy-MM-dd')
  const inWeeks = lower.match(/\bin\s+(\d+)\s+weeks?\b/)
  if (inWeeks) return format(addDays(today, parseInt(inWeeks[1]) * 7), 'yyyy-MM-dd')

  return null
}

function resolveDeadline(text: string): string | null {
  const lower = text.toLowerCase()
  const today = new Date()

  const monthMap: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5,
    jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
  }

  // "by June", "by December"
  for (const [name, idx] of Object.entries(monthMap)) {
    if (lower.includes(`by ${name}`) || lower.includes(`in ${name}`)) {
      const d = new Date(today.getFullYear(), idx, 1)
      if (d < today) d.setFullYear(d.getFullYear() + 1)
      return format(d, 'yyyy-MM-dd')
    }
  }

  // "in 3 months"
  const inMonths = lower.match(/\bin\s+(\d+)\s+months?\b/)
  if (inMonths) return format(addDays(today, parseInt(inMonths[1]) * 30), 'yyyy-MM-dd')

  return resolveDate(text)
}

function guessPriority(text: string): 'low' | 'medium' | 'high' | 'urgent' {
  const lower = text.toLowerCase()
  if (/\b(urgent|asap|immediately|critical|now)\b/.test(lower)) return 'urgent'
  if (/\b(important|high priority|must)\b/.test(lower)) return 'high'
  if (/\b(low|someday|maybe|whenever)\b/.test(lower)) return 'low'
  return 'medium'
}

// ─── detectors ──────────────────────────────────────────────────────────────

export function detectFinance(text: string): ParsedFinance | null {
  const amount = extractAmount(text)
  const hasVerb = FINANCE_VERBS.test(text) || INCOME_VERBS.test(text)
  const hasRM = /\bRM\b/i.test(text)

  if (!amount || (!hasVerb && !hasRM)) return null

  const isIncome = INCOME_VERBS.test(text)
  const title = extractTitle(text) || 'Transaction'
  const category = guessCategory(text)

  return {
    type: 'finance',
    data: {
      title,
      amount,
      category,
      type: isIncome ? 'income' : 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  }
}

export function detectGoal(text: string): ParsedGoal | null {
  const lower = text.toLowerCase()

  const saveMatch = text.match(GOAL_SAVE_PATTERN)
  if (saveMatch) {
    return {
      type: 'goal',
      data: {
        title: `Save RM${saveMatch[1]}`,
        target: parseFloat(saveMatch[1]),
        current_progress: 0,
        deadline: resolveDeadline(text),
        category: 'Finance',
        status: 'active',
      },
    }
  }

  const loseMatch = text.match(GOAL_LOSE_PATTERN)
  if (loseMatch) {
    return {
      type: 'goal',
      data: {
        title: `Lose ${loseMatch[1]}kg`,
        target: parseFloat(loseMatch[1]),
        current_progress: 0,
        deadline: resolveDeadline(text),
        category: 'Health',
        status: 'active',
      },
    }
  }

  const readMatch = text.match(GOAL_READ_PATTERN)
  if (readMatch) {
    return {
      type: 'goal',
      data: {
        title: `Read ${readMatch[1]} books`,
        target: parseInt(readMatch[1]),
        current_progress: 0,
        deadline: resolveDeadline(text),
        category: 'Education',
        status: 'active',
      },
    }
  }

  // generic goal: "goal to X" or "target X"
  if (/\b(goal|target|aim|plan to|want to)\b/.test(lower) && resolveDeadline(text)) {
    return {
      type: 'goal',
      data: {
        title: extractTitle(text) || text,
        target: 100,
        current_progress: 0,
        deadline: resolveDeadline(text),
        category: null,
        status: 'active',
      },
    }
  }

  return null
}

export function detectHabit(text: string): ParsedHabit | null {
  if (!HABIT_WORDS.test(text)) return null

  const frequency: 'daily' | 'weekly' = /\b(weekly|every week|each week)\b/i.test(text) ? 'weekly' : 'daily'

  // strip the frequency word to get habit name
  let name = text
    .replace(HABIT_WORDS, '')
    .replace(/\b(do|start|begin|track)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  name = name.charAt(0).toUpperCase() + name.slice(1) || text

  return {
    type: 'habit',
    data: {
      name: name || text,
      frequency,
      emoji: guessEmoji(text),
    },
  }
}

export function detectTask(text: string): ParsedTask | null {
  const TASK_VERBS = /\b(finish|complete|do|submit|prepare|send|call|meet|review|check|fix|write|create|make|plan|buy|get|pick up|attend|schedule|organize|update|remind|follow up|clean|book)\b/i
  const HAS_DATE = /\b(tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|next month|in \d+ days?|in \d+ weeks?)\b/i

  if (!TASK_VERBS.test(text) && !HAS_DATE.test(text)) return null

  const title = extractTitle(text) || text
  const due_date = resolveDate(text)
  const priority = guessPriority(text)

  return {
    type: 'task',
    data: {
      title,
      due_date,
      priority,
      status: 'todo',
    },
  }
}

// ─── main parser ─────────────────────────────────────────────────────────────

export function parseInput(text: string): ParseResult {
  if (!text.trim()) return { type: 'unknown', data: { raw: text } }

  // Priority order: finance → goal → habit → task
  const finance = detectFinance(text)
  if (finance) return finance

  const goal = detectGoal(text)
  if (goal) return goal

  const habit = detectHabit(text)
  if (habit) return habit

  const task = detectTask(text)
  if (task) return task

  return { type: 'unknown', data: { raw: text } }
}
