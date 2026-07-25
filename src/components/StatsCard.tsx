import * as React from 'react'

export function StatsCard({ title, value, change, icon, color }: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {change}
          </p>
        </div>
        <div className={`rounded-xl p-3 shadow-sm shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
