import { createClient } from '@/features/authentication/services/server'
import { getModule } from '@/lib/workspace/modules'
import { ModulePlaceholder } from '@/components/workspace/placeholders/ModulePlaceholder'
import { notFound } from 'next/navigation'

export default async function WorkspaceModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleId } = await params
  const workspaceModule = getModule(moduleId)
  if (!workspaceModule) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <ModulePlaceholder module={workspaceModule} user={profile ?? { id: user!.id, email: user!.email, full_name: user!.user_metadata?.full_name, avatar_url: user!.user_metadata?.avatar_url }} />
}
