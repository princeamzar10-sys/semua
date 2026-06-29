import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <DashboardClient user={profile ?? { id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
