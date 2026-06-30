import { Sidebar } from '@/components/sidebar/Sidebar'
import { MobileBottomNav } from '@/components/sidebar/MobileBottomNav'
import { createClient } from '@/features/authentication/services/server'
import { redirect } from 'next/navigation'
import { ModeProvider } from '@/components/navigation/mode-context'
import { ModeSwitch } from '@/components/mode-switch/ModeSwitch'
import { QuickAddProvider } from '@/components/navigation/quick-add-context'
import { QuickAddRoot } from '@/components/quick-add/QuickAddRoot'
import { PanelProvider } from '@/providers/panel-provider/panel-context'
import { UniversalSearchTrigger, UniversalSearchModal } from '@/components/search/UniversalSearch'
import { RightPanel } from '@/components/panel/RightPanel'
import { RouteFade } from '@/components/layout/route-fade'
import { Sparkles } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <ModeProvider>
      <QuickAddProvider>
        <PanelProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Top mode bar */}
            <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-white/70 backdrop-blur-md border-b border-gray-100/60 z-20">
              <div className="flex items-center gap-2 w-44">
                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <ModeSwitch />
              <div className="w-44 flex justify-end">
                <UniversalSearchTrigger />
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{
                  backgroundImage: 'url(/bg.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <RouteFade>{children}</RouteFade>
              </div>
              <RightPanel />
            </div>

            <MobileBottomNav />
            <QuickAddRoot />
            <UniversalSearchModal />
          </div>
        </PanelProvider>
      </QuickAddProvider>
    </ModeProvider>
  )
}
