export default function ActivityCard({ activities }: { activities: { avatar: string; user: string; action: string; time: string }[] }) {

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
              <span className="text-black text-xs font-semibold">{activity.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-white/60">{activity.action}</span>
              </p>
              <p className="text-xs text-white/40">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
