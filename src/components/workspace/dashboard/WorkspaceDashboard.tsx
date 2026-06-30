'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Sparkles, FolderKanban, CheckSquare, GraduationCap, BarChart3,
  Clock, Plus, HeartPulse, Milestone, TrendingUp, FileText, ClipboardCheck,
} from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import { WORKSPACE_MODULES } from '@/lib/workspace/modules'
import {
  MOCK_PRIORITIES, MOCK_MEETINGS, MOCK_PROJECTS, MOCK_TASKS, MOCK_RECENT_ACTIVITY,
  MOCK_RECENT_FILES, MOCK_TEAM_TIMELINE, MOCK_UPCOMING_REVIEWS,
} from '@/lib/workspace/mock-data'

interface WorkspaceDashboardProps {
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function WorkspaceDashboard({ user }: WorkspaceDashboardProps) {
  const firstName = user.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const learningProgress = 60 // mock — single in-progress course %

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title="Workspace" user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here&apos;s what&apos;s happening across your Workspace.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {WORKSPACE_MODULES.slice(0, 4).map(m => (
            <Link key={m.id} href={m.route}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-sm text-gray-700">
              <Plus size={13} className="text-gray-400" />
              New {m.title.replace(/s$/, '')}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Priorities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Today&apos;s Priorities</h2>
              <div className="space-y-2">
                {MOCK_PRIORITIES.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={cn('w-4 h-4 rounded-full border-2 shrink-0', p.done ? 'bg-black border-black' : 'border-gray-300')} />
                    <span className={cn('text-sm flex-1', p.done ? 'text-gray-400 line-through' : 'text-gray-800')}>{p.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Active Projects</h2>
                <Link href="/workspace/projects" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-4">
                {MOCK_PROJECTS.map((p, i) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 flex items-center gap-1.5">
                        <FolderKanban size={13} className="text-gray-400" /> {p.name}
                      </span>
                      <span className={cn('text-xs font-medium', p.status === 'at-risk' ? 'text-amber-600' : 'text-gray-400')}>
                        {p.status === 'at-risk' ? 'At risk' : 'On track'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn('h-full rounded-full', p.status === 'at-risk' ? 'bg-amber-400' : 'bg-black')} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">My Tasks</h2>
                <Link href="/workspace/tasks" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-2">
                {MOCK_TASKS.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <CheckSquare size={14} className="text-gray-300 shrink-0" />
                    <span className="text-sm text-gray-800 flex-1">{t.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{t.dueLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Health */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse size={14} className="text-gray-300" />
                <h2 className="text-sm font-semibold text-gray-900">Project Health</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_PROJECTS.map(p => (
                  <div key={p.id} className="text-center p-3 rounded-xl bg-gray-50">
                    <p className={cn('text-lg font-bold', p.status === 'at-risk' ? 'text-amber-600' : 'text-green-600')}>
                      {p.status === 'at-risk' ? 'At Risk' : 'Healthy'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Milestone size={14} className="text-gray-300" />
                <h2 className="text-sm font-semibold text-gray-900">Team Timeline</h2>
              </div>
              <div className="space-y-3">
                {MOCK_TEAM_TIMELINE.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{m.label}</span>
                    <span className="text-xs text-gray-400 shrink-0">{m.dateLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* AI Workspace Summary */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">AI Workspace Summary</h2>
              </div>
              <p className="text-sm text-gray-600">
                You have 3 meetings today and 1 project at risk. Gemini-powered summaries are coming soon —
                this card will surface real, personalized insights once Workspace AI is connected.
              </p>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Upcoming Meetings</h2>
                <Link href="/workspace/meetings" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {MOCK_MEETINGS.map(m => (
                  <div key={m.id} className="flex items-start gap-3">
                    <Clock size={14} className="text-gray-300 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.time} · {m.attendees} attendees</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Learning Progress</h2>
                <GraduationCap size={14} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{learningProgress}%</span>
              </div>
              <p className="text-xs text-gray-400 text-center mb-3">Advanced TypeScript</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${learningProgress}%` }} transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-black" />
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Performance Snapshot</h2>
                <BarChart3 size={14} className="text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-lg font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-400 mt-0.5">Shipped this quarter</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-lg font-bold text-gray-900">3/4</p>
                  <p className="text-xs text-gray-400 mt-0.5">OKRs on track</p>
                </div>
              </div>
            </div>

            {/* Productivity Score */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Productivity Score</h2>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">82</span>
                <span className="text-xs text-green-600 mb-1">+6 this week</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Recent Documents</h2>
                <Link href="/workspace/documents" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-2">
                {MOCK_RECENT_FILES.map(f => (
                  <div key={f.id} className="flex items-center gap-3">
                    <FileText size={14} className="text-gray-300 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{f.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardCheck size={14} className="text-gray-300" />
                <h2 className="text-sm font-semibold text-gray-900">Upcoming Reviews</h2>
              </div>
              <div className="space-y-2">
                {MOCK_UPCOMING_REVIEWS.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{r.label}</span>
                    <span className="text-xs text-gray-400">{r.dateLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {MOCK_RECENT_ACTIVITY.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-base shrink-0">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 truncate">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
