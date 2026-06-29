'use client'

import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import Link from 'next/link'

interface TopbarProps {
  title: string
  user?: { full_name?: string | null; avatar_url?: string | null; email?: string }
}

export function Topbar({ title, user }: TopbarProps) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="h-14 border-b border-gray-100/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
          <Bell size={16} />
        </button>
        <Link href="/settings">
          <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-gray-100 hover:ring-gray-300 transition-all">
            <AvatarImage src={user?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-black text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
