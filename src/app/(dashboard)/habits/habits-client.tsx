'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useHabits, useCreateHabit, useToggleHabit, useDeleteHabit, useHabitLogs } from '@/hooks/use-habits'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Flame, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { habitSchema, HabitFormData } from '@/lib/validations'
import { format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

const EMOJIS = ['🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵', '🌿', '💊']

interface HabitsClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function HabitsClient({ user }: HabitsClientProps) {
  const { data: habits = [], isLoading } = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const createHabit = useCreateHabit()
  const toggleHabit = useToggleHabit()
  const deleteHabit = useDeleteHabit()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: { frequency: 'daily', emoji: '🎯' },
  })
  const selectedEmoji = watch('emoji')

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Last 7 days for mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))

  const isCompleted = (habitId: string, date: string) =>
    habitLogs.some(l => l.habit_id === habitId && l.date === date)

  const onSubmit = async (data: HabitFormData) => {
    await createHabit.mutateAsync(data)
    setOpen(false)
    reset()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Habits" user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
            <Plus size={16} /> New Habit
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm">No habits yet. Start building one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {habits.map((habit, i) => {
                const doneToday = isCompleted(habit.id, todayStr)
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{habit.emoji}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{habit.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{habit.frequency}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabit.mutate(habit.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-sm font-semibold text-gray-900">{habit.current_streak}</span>
                      <span className="text-xs text-gray-400">day streak</span>
                      {habit.longest_streak > 0 && (
                        <span className="text-xs text-gray-300 ml-1">(best: {habit.longest_streak})</span>
                      )}
                    </div>

                    {/* 7-day mini calendar */}
                    <div className="flex gap-1.5 mb-4">
                      {last7.map(date => (
                        <div
                          key={date}
                          className={cn(
                            'flex-1 h-7 rounded-lg flex items-center justify-center',
                            isCompleted(habit.id, date) ? 'bg-black' : 'bg-gray-100'
                          )}
                        >
                          {isCompleted(habit.id, date) && <Check size={10} className="text-white" />}
                        </div>
                      ))}
                    </div>

                    {/* Complete today button */}
                    <button
                      onClick={() => toggleHabit.mutate({ habitId: habit.id, date: todayStr, completed: doneToday })}
                      className={cn(
                        'w-full py-2 rounded-xl text-sm font-medium transition-all',
                        doneToday
                          ? 'bg-black text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {doneToday ? '✓ Done Today' : 'Mark Done'}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>New Habit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <Input {...register('name')} placeholder="Habit name" className="rounded-xl" />
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Choose Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setValue('emoji', e)}
                    className={cn(
                      'h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                      selectedEmoji === e ? 'bg-black' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
              <Select defaultValue="daily" onValueChange={v => setValue('frequency', v as 'daily' | 'weekly')}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createHabit.isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
              Create Habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
