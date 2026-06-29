'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setLoading(null); return }
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to Semua</h1>
          <p className="text-sm text-gray-400 mt-2">Sign in to track your everything.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button
            onClick={() => handleOAuth('apple')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-black text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M13.162 9.426c-.022-2.139 1.745-3.173 1.824-3.222-1-1.459-2.547-1.659-3.094-1.678-1.312-.136-2.565.781-3.23.781-.666 0-1.685-.765-2.77-.744-1.416.021-2.727.831-3.453 2.104-1.479 2.563-.378 6.348 1.06 8.42.703 1.016 1.535 2.154 2.63 2.113 1.056-.042 1.458-.68 2.737-.68 1.278 0 1.638.68 2.754.658 1.137-.021 1.854-1.028 2.55-2.048.804-1.171 1.135-2.306 1.154-2.365-.026-.012-2.21-.852-2.162-3.339ZM10.99 2.987C11.554 2.3 11.94 1.347 11.83.37c-.824.036-1.82.55-2.409 1.242-.528.613-.993 1.593-.87 2.531.92.07 1.861-.465 2.439-1.156Z" fill="white"/>
            </svg>
            {loading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-700">Terms</a> and{' '}
          <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  )
}
