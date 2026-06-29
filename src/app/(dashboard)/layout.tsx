import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KeyboardShortcut } from '@/components/KeyboardShortcut'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      <KeyboardShortcut />
    </div>
  )
}
