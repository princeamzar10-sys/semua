'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue } from 'react-hook-form'
import { HabitFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

const EMOJIS = ['🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵', '🌿', '💊']

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  register: UseFormRegister<HabitFormData>
  handleSubmit: UseFormHandleSubmit<HabitFormData>
  setValue: UseFormSetValue<HabitFormData>
  onSubmit: (data: HabitFormData) => void
  isPending: boolean
  selectedEmoji: string | undefined
}

export function HabitDialog({ open, onOpenChange, register, handleSubmit, setValue, onSubmit, isPending, selectedEmoji }: HabitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>New Habit</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <Input {...register('name')} placeholder="Habit name" className="rounded-xl" />
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Choose Emoji</label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setValue('emoji', e)}
                  className={cn('h-10 rounded-xl text-xl flex items-center justify-center transition-all', selectedEmoji === e ? 'bg-black' : 'bg-gray-50 hover:bg-gray-100')}>
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
          <Button type="submit" disabled={isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
            Create Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
