// Merged superset of the emoji keyword maps formerly duplicated in
// src/lib/parser.ts (HABIT_EMOJI_MAP) and src/lib/tools/habits.ts (EMOJI_MAP).
// Union of both keyword sets — no supported keyword lost.
export const HABIT_EMOJI_MAP: Record<string, string> = {
  gym: '💪', exercise: '🏃', run: '🏃', running: '🏃', walk: '🚶', walking: '🚶',
  read: '📚', reading: '📚', book: '📚',
  meditate: '🧘', meditation: '🧘', yoga: '🧘',
  water: '💧', drink: '💧',
  sleep: '😴', journal: '✍️', write: '✍️', writing: '✍️',
  study: '📖', learn: '📖', code: '💻', coding: '💻',
  diet: '🥗', eat: '🥗', healthy: '🥗',
  music: '🎵', pray: '🙏', prayer: '🙏',
}

export function guessHabitEmoji(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, emoji] of Object.entries(HABIT_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '🎯'
}
