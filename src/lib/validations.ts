import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'completed', 'overdue']),
  category: z.string().max(100).optional().nullable(),
})

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required').max(100),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional().nullable(),
})

export const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  emoji: z.string().min(1, 'Emoji is required').max(10),
  frequency: z.enum(['daily', 'weekly']),
})

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  target: z.number().positive('Target must be positive'),
  current_progress: z.number().min(0),
  deadline: z.string().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  status: z.enum(['active', 'completed', 'archived']),
})

export type TaskFormData = z.infer<typeof taskSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
export type HabitFormData = z.infer<typeof habitSchema>
export type GoalFormData = z.infer<typeof goalSchema>
