'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, BarChart3, Repeat, Target } from 'lucide-react'

const features = [
  {
    icon: CheckCircle2,
    title: 'Task Tracker',
    desc: 'Stay on top of your to-dos with priorities, statuses and due dates.',
    gradient: 'linear-gradient(135deg, #C2185B, #7B1FA2, #303F9F)',
  },
  {
    icon: BarChart3,
    title: 'Finance Tracker',
    desc: 'Track income and expenses. See where your money goes each month.',
    gradient: 'linear-gradient(135deg, #6A1B9A, #D32F2F, #F57C00)',
  },
  {
    icon: Repeat,
    title: 'Habit Tracker',
    desc: 'Build streaks and lasting habits with daily and weekly tracking.',
    gradient: 'linear-gradient(135deg, #FF8F00, #AFB42B, #388E3C)',
  },
  {
    icon: Target,
    title: 'Goal Tracker',
    desc: 'Set targets, track milestones and watch your progress grow.',
    gradient: 'linear-gradient(135deg, #0288D1, #26A69A, #D4E157)',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#F8F9FB' }}>
      {/* Full-bleed wallpaper */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/wallpaper.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Light overlay — just enough to keep text crisp */}
      <div className="fixed inset-0 -z-10 bg-white/10" />
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">Semua</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <span className="text-gray-300 cursor-default">Pricing <span className="text-xs text-gray-400">(Soon)</span></span>
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-1.5 rounded-lg hover:bg-gray-100"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-4 py-1.5 text-xs font-bold text-gray-500 shadow-sm mb-8"
        >
          <Sparkles size={12} className="text-blue-500" />
          All-in-one personal productivity
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight max-w-2xl"
        >
          Help you track,{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(90deg, #2F6FED 0%, #9B59F5 30%, #E040C8 60%, #F5A623 85%, #2F6FED 100%)',
              backgroundSize: '200% auto',
              animation: 'copilot-gradient 4s linear infinite',
            }}
          >
            your everything.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg text-gray-700 max-w-xl leading-relaxed"
        >
          A simple all-in-one productivity platform to organize your tasks, finances, habits and goals from one beautiful dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
          >
            Try Now <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-white text-gray-700 rounded-xl px-6 py-3 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Learn More
          </a>
        </motion.div>

        {/* Features */}
        <div id="features" className="mt-28 w-full max-w-4xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-semibold uppercase tracking-widest text-gray-400 mb-8"
          >
            Everything you need
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-2 py-6 items-stretch">
            {features.map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                className="relative flex"
                style={{ isolation: 'isolate' }}
              >
                {/* Outer ambient halo */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
                  style={{ backgroundImage: gradient, zIndex: -1 }}
                />
                {/* Inner concentrated glow */}
                <div
                  className="absolute -inset-1 rounded-3xl opacity-40 blur-lg"
                  style={{ backgroundImage: gradient, zIndex: -1 }}
                />

                {/* White card — flex-1 makes it fill the wrapper height */}
                <div className="relative flex-1 bg-white rounded-2xl p-6 text-left shadow-sm" style={{ zIndex: 1 }}>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-gray-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* About */}
        <div id="about" className="mt-20 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-3">
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #2F6FED 0%, #9B59F5 30%, #E040C8 60%, #F5A623 85%, #2F6FED 100%)',
                  backgroundSize: '200% auto',
                  animation: 'copilot-gradient 4s linear infinite',
                }}
              >
                Built for simplicity
              </span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm font-bold text-justify">
              Semua (meaning &ldquo;everything&rdquo; in Malay) is designed with one goal: give you a single, beautiful place to manage your entire life.
              No bloat. No confusion. Just you and your goals.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-black flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="font-medium text-gray-700">Semua</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
