import * as React from 'react'

export function StatsCard({ title, value, change, icon, color }: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-400">
            {change}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
