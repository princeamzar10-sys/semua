import { createClient } from '@/lib/supabase/server'
import { GoalsClient } from './goals-client'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <GoalsClient user={{ id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
