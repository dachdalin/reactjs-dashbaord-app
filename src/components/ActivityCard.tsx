export default function ActivityCard({ activities }: { activities: { avatar: string; user: string; action: string; time: string }[] }) {

  return (
    <div className="rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-950 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0">
              <span className="text-slate-950 text-xs font-semibold">{activity.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-950">
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
