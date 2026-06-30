'use client'

import { Plus } from 'lucide-react'
import { useQuickAdd } from '@/components/navigation/quick-add-context'

export function QuickAddFAB() {
  const { setOpen } = useQuickAdd()

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Quick Add"
      className="fixed bottom-20 right-5 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center z-30"
    >
      <Plus size={22} />
    </button>
  )
}
