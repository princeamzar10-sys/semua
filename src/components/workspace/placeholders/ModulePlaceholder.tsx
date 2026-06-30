'use client'

import { Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Topbar } from '@/components/layout/topbar'
import { toast } from 'sonner'
import { WorkspaceModule } from '@/lib/workspace/modules'

interface ModulePlaceholderProps {
  module: WorkspaceModule
  user: { id: string; email?: string; full_name?: string | null; avatar_url?: string | null }
}

export function ModulePlaceholder({ module, user }: ModulePlaceholderProps) {
  const Icon = module.icon

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <Topbar title={module.title} user={user} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 px-8 py-10 text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-5">
              <Icon size={28} className="text-slate-600" />
            </div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full mb-3">
              Coming Soon
            </span>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">{module.description}</p>
          </div>

          {/* Preview stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {module.previewStats.map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Example {module.title}</h2>
              <p className="text-xs text-gray-400">Sample data — real {module.title.toLowerCase()} will appear here once connected.</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {module.previewTable.columns.map(col => (
                    <th key={col} className="text-left font-medium text-gray-500 px-5 py-2 text-xs uppercase tracking-wide">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {module.previewTable.rows.map((row, i) => (
                  <tr key={i} className={i < module.previewTable.rows.length - 1 ? 'border-b border-gray-50' : ''}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-5 py-2.5 text-gray-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Future capabilities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-violet-500" />
                <h2 className="text-sm font-semibold text-gray-900">Future Capabilities</h2>
              </div>
              <ul className="space-y-2">
                {module.futureCapabilities.map(cap => (
                  <li key={cap} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} className="text-gray-300 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested use cases */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Suggested Use Cases</h2>
              </div>
              <ul className="space-y-2">
                {module.useCases.map(use => (
                  <li key={use} className="text-sm text-gray-600 pl-1 border-l-2 border-gray-100">
                    <span className="pl-2">{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center pb-4">
            <Button
              onClick={() => toast.success(`We'll let you know when ${module.title} is ready!`)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
            >
              Notify me when available
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
