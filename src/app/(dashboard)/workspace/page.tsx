import { createClient } from '@/features/authentication/services/server'
import { WorkspaceDashboard } from '@/components/workspace/dashboard/WorkspaceDashboard'

export default async function WorkspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <WorkspaceDashboard user={profile ?? { id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
