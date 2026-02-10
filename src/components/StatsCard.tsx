import * as React from "react";
export function StatsCard({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p className={`mt-2 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {change} from last month
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      {/* Decorative gradient */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${color} opacity-20 rounded-full blur-2xl`} />
    </div>
  );
}

export default StatsCard;