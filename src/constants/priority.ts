import { Priority } from '@/features/tasks/types'

export const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'urgent']

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-amber-50 text-amber-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
}

export const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  low: 'bg-gray-300',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
}
