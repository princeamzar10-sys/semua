import { startOfMonth, endOfMonth, format } from 'date-fns'

export interface MonthRange {
  start: string
  end: string
}

export function getMonthRange(date: Date = new Date()): MonthRange {
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}
