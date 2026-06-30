import { createClient } from '@/features/authentication/services/server'
import { HabitsClient } from './habits-client'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <HabitsClient user={{ id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
