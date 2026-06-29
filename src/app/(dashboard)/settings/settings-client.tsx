'use client'

import { Topbar } from '@/components/layout/topbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface SettingsClientProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U'

  const saveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').upsert({ id: user.id, full_name: displayName, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" user={user} />
      <main className="flex-1 overflow-y-auto p-6 max-w-lg">
        <div className="space-y-5">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">Profile</h2>
            <div className="flex items-center gap-4 mb-5">
              <Avatar className="w-16 h-16 ring-2 ring-gray-100">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="bg-black text-white text-lg font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.full_name ?? 'Your Name'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl"
                />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="rounded-xl bg-black hover:bg-gray-800 text-white">
                {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>

          {/* Account actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <Button onClick={handleSignOut} variant="outline" className="w-full rounded-xl border-gray-200 text-gray-700">
                Sign Out
              </Button>
              <Button onClick={handleDeleteAccount} variant="outline" className="w-full rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300">
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
