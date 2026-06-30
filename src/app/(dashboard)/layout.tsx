import { Sidebar } from '@/components/sidebar/Sidebar'
import { MobileBottomNav } from '@/components/sidebar/MobileBottomNav'
import { createClient } from '@/features/authentication/services/server'
import { redirect } from 'next/navigation'
import { ModeProvider } from '@/components/navigation/mode-context'
import { QuickAddProvider } from '@/components/navigation/quick-add-context'
import { QuickAddRoot } from '@/components/quick-add/QuickAddRoot'
import { PanelProvider } from '@/providers/panel-provider/panel-context'
import { UniversalSearchModal } from '@/components/search/UniversalSearch'
import { RightPanel } from '@/components/panel/RightPanel'
import { RouteFade } from '@/components/layout/route-fade'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <ModeProvider>
      <QuickAddProvider>
        <PanelProvider>
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
              <RouteFade>{children}</RouteFade>
            </div>
            <RightPanel />
          </div>

          <MobileBottomNav />
          <QuickAddRoot />
          <UniversalSearchModal />
        </PanelProvider>
      </QuickAddProvider>
    </ModeProvider>
  )
}
