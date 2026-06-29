import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KeyboardShortcut } from '@/components/KeyboardShortcut'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {children}
      </div>
      <KeyboardShortcut />
    </div>
  )
}
