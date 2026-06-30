'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { TaskFormData } from '@/lib/validations'
import { Task, Priority, TaskStatus } from '@/features/personal/tasks/types'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Task | null
  register: UseFormRegister<TaskFormData>
  handleSubmit: UseFormHandleSubmit<TaskFormData>
  setValue: UseFormSetValue<TaskFormData>
  errors: FieldErrors<TaskFormData>
  onSubmit: (data: TaskFormData) => void
  isPending: boolean
}

export function TaskDialog({ open, onOpenChange, editing, register, handleSubmit, setValue, errors, onSubmit, isPending }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
        <form key={editing?.id ?? 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <Input {...register('title')} placeholder="Task title" className="rounded-xl" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <textarea {...register('description')} placeholder="Description (optional)" rows={2}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <Input type="date" {...register('due_date')} className="rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <Input {...register('category')} placeholder="e.g. Work" className="rounded-xl text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <Select defaultValue={editing?.priority ?? 'medium'} onValueChange={v => setValue('priority', v as Priority)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <Select defaultValue={editing?.status ?? 'todo'} onValueChange={v => setValue('status', v as TaskStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full rounded-xl bg-black hover:bg-gray-800 text-white">
            {editing ? 'Save Changes' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
