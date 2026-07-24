export default function ActivityCard({ activities }: { activities: { avatar: string; user: string; action: string; time: string }[] }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950">Recent Activity</h3>
        <p className="text-sm text-slate-500">Latest publishing updates</p>
      </div>
      <div className="divide-y divide-slate-100">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold">{activity.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-slate-950">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-slate-500">{activity.action}</span>
              </p>
              <p className="text-xs text-slate-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
