'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useMode } from '@/components/navigation/mode-context'
import { getNavSections } from '@/components/navigation/nav-registry'

// Registry-driven: renders the first nav section's items as icon buttons.
// Same NAV_REGISTRY data the desktop Sidebar uses — no separate hardcoded list.
export function MobileBottomNav() {
  const pathname = usePathname()
  const { mode } = useMode()
  const items = getNavSections(mode)[0]?.items.filter(i => !i.disabled) ?? []

  const isActive = (href: string) => {
    const [path] = href.split('?')
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-around z-30">
      {items.map(item => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
              active ? 'text-black' : 'text-gray-400'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
