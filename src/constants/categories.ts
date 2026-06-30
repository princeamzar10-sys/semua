export const CURRENCY_SYMBOL = 'RM'

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

// Order used by the Gemini system prompt ("best guess from: ...") — kept separate
// since the original prompt listed a different order than the finance-client dropdown.
export const AI_EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other']

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['lunch', 'dinner', 'breakfast', 'food', 'eat', 'ate', 'meal', 'restaurant', 'cafe', 'coffee', 'snack', 'drink', 'makan', 'nasi', 'burger', 'pizza', 'roti', 'teh', 'kopi'],
  Transport: ['grab', 'uber', 'bus', 'train', 'lrt', 'mrt', 'commuter', 'taxi', 'petrol', 'gas', 'fuel', 'parking', 'toll', 'flight', 'ticket', 'transport'],
  Shopping: ['shopping', 'groceries', 'clothes', 'shoes', 'shirt', 'pants', 'dress', 'bag', 'online', 'lazada', 'shopee', 'amazon'],
  Bills: ['bill', 'bills', 'electric', 'water', 'internet', 'wifi', 'rent', 'utilities', 'subscription', 'netflix', 'spotify'],
  Health: ['gym', 'doctor', 'clinic', 'medicine', 'pharmacy', 'hospital', 'dental', 'health'],
  Entertainment: ['movie', 'cinema', 'game', 'concert', 'event', 'ticket'],
  Education: ['book', 'books', 'course', 'tuition', 'class', 'study', 'school', 'university'],
}

export function guessCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}
