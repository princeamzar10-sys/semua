import { CURRENCY_SYMBOL } from '@/constants/categories'

export function formatCurrency(amount: number, decimals = 2): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(decimals)}`
}
