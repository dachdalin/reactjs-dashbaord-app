interface Activity {
  avatar: string
  user: string
  action: string
  time: string
}

const avatarGradients = [
  'from-violet-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]

export default function ActivityCard({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-slate-400 mt-0.5">Latest publishing updates</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/40 transition-all duration-200 cursor-default"
          >
            {/* Avatar */}
            <div className={`relative h-10 w-10 rounded-xl bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-xs font-bold text-white">{activity.avatar}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-800" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">
                <span className="font-semibold text-white">{activity.user}</span>
                {' '}
                <span className="text-slate-400">{activity.action}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
            </div>

            {/* Time badge */}
            <div className="shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-xs text-slate-400 group-hover:bg-slate-700 transition-colors">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
