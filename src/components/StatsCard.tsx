import * as React from 'react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  gradient: string       // e.g. 'from-violet-500 to-indigo-600'
  glowColor: string      // e.g. 'shadow-violet-500/25'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, change, icon, gradient, glowColor, trend = 'neutral' }: StatsCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 
        backdrop-blur-sm transition-all duration-300 
        hover:bg-slate-800/80 hover:border-slate-600/60 hover:-translate-y-0.5 hover:shadow-xl ${glowColor}`}
    >
      {/* Subtle top-left gradient accent */}
      <div className={`absolute -top-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-white">{value}</p>
          <div className="mt-2 flex items-center gap-1.5">
            {trend !== 'neutral' && (
              <span className={`inline-flex items-center ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={trend === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                </svg>
              </span>
            )}
            <p className="text-xs text-slate-400">{change}</p>
          </div>
        </div>

        <div className={`relative shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${glowColor}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
