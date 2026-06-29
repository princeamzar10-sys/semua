import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user!.id).single()
  return <SettingsClient user={profile ?? { id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
