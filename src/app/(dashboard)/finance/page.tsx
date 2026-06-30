import { createClient } from '@/features/authentication/services/server'
import { FinanceClient } from './finance-client'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <FinanceClient user={{ id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
