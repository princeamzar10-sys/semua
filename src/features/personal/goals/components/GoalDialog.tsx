'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { GoalFormData } from '@/lib/validations'
import { Goal, GoalStatus } from '@/features/personal/goals/types'

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Goal | null
  register: UseFormRegister<GoalFormData>
  handleSubmit: UseFormHandleSubmit<GoalFormData>
  setValue: UseFormSetValue<GoalFormData>
  errors: FieldErrors<GoalFormData>
  onSubmit: (data: GoalFormData) => void
  isPending: boolean
}

export function GoalDialog({ open, onOpenChange, editing, register, handleSubmit, setValue, errors, onSubmit, isPending }: GoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit Goal' : 'New Goal'}</DialogTitle></DialogHeader>
        <form key={editing?.id ?? 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <Input {...register('title')} placeholder="Goal title" className="rounded-xl" />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Target</label>
              <Input type="number" {...register('target', { valueAsNumber: true })} placeholder="e.g. 100" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Progress</label>
              <Input type="number" {...register('current_progress', { valueAsNumber: true })} placeholder="0" className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Deadline</label>
              <Input type="date" {...register('deadline')} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <Input {...register('category')} placeholder="e.g. Health" className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select defaultValue={editing?.status ?? 'active'} onValueChange={v => setValue('status', v as GoalStatus)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
            {editing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
