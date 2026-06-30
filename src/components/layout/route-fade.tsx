'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Brief crossfade on route change so a mode-triggered navigation (e.g.
// /tasks -> /workspace) doesn't flash — not a shared-layout morph between
// the two page trees, just enough motion to read as an intentional transition.
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
