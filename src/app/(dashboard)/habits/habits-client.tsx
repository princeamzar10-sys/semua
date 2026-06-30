'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { useHabits, useCreateHabit, useToggleHabit, useDeleteHabit, useHabitLogs } from '@/features/personal/habits/hooks/use-habits'
import { HabitHeatmapRow } from '@/features/personal/habits/components/HabitHeatmapRow'
import { HabitDialog } from '@/features/personal/habits/components/HabitDialog'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Flame, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { habitSchema, HabitFormData } from '@/lib/validations'
import { format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))
  const last7Labels = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'EEE'))

  const isCompleted = (habitId: string, date: string) =>
    habitLogs.some(l => l.habit_id === habitId && l.date === date)

  const todayCompleted = habits.filter(h => isCompleted(h.id, todayStr)).length
  const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longest_streak), 0)
  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0)

  const onSubmit = async (data: HabitFormData) => {
    await createHabit.mutateAsync(data)
    toast.success('Habit created!')
    setOpen(false)
    reset()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title="Habits" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Today\'s Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', sub: `${todayCompleted}/${habits.length} done` },
            { label: 'Active Streak', value: totalStreak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', sub: 'combined days' },
            { label: 'Best Streak', value: bestStreak, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', sub: 'personal record' },
          ].map(({ label, value, icon: Icon, color, bg, sub }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon size={17} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">My Habits</h2>
            <p className="text-sm text-gray-400 mt-0.5">Track your daily routines</p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-sm">
            <Plus size={14} /> New Habit
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : habits.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-500 font-medium mb-1">No habits yet</p>
            <p className="text-gray-400 text-sm mb-4">Start building your first routine</p>
            <Button onClick={() => setOpen(true)} className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2">
              <Plus size={14} /> Add Habit
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {habits.map((habit, i) => {
                const doneToday = isCompleted(habit.id, todayStr)
                const weekDone = last7.filter(d => isCompleted(habit.id, d)).length
                return (
                  <motion.div key={habit.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    whileHover={{ y: -2 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                          {habit.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{habit.name}</p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{habit.frequency}</p>
                        </div>
                      </div>
                      <button onClick={() => { deleteHabit.mutate(habit.id); toast.success('Habit removed') }}
                        className="p-1.5 rounded-lg text-gray-200 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className={habit.current_streak > 0 ? 'text-orange-400' : 'text-gray-300'} />
                        <span className="text-sm font-bold text-gray-900">{habit.current_streak}</span>
                        <span className="text-xs text-gray-400">streak</span>
                      </div>
                      {habit.longest_streak > 0 && (
                        <div className="text-xs text-gray-300">best: {habit.longest_streak}</div>
                      )}
                      <div className="ml-auto text-xs text-gray-400">{weekDone}/7 this week</div>
                    </div>

                    {/* 7-day grid */}
                    <div className="mb-4">
                      <HabitHeatmapRow last7={last7} last7Labels={last7Labels} isCompleted={(date) => isCompleted(habit.id, date)} />
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => {
                        toggleHabit.mutate({ habitId: habit.id, date: todayStr, completed: doneToday })
                        if (!doneToday) toast.success(`${habit.emoji} ${habit.name} done!`)
                      }}
                      className={cn(
                        'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                        doneToday ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {doneToday ? '✓ Completed Today' : 'Mark as Done'}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50">
        <Plus size={22} />
      </button>

      <HabitDialog
        open={open}
        onOpenChange={setOpen}
        register={register}
        handleSubmit={handleSubmit}
        setValue={setValue}
        onSubmit={onSubmit}
        isPending={createHabit.isPending}
        selectedEmoji={selectedEmoji}
      />
    </div>
  )
}
