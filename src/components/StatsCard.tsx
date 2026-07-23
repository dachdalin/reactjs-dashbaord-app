import * as React from "react";
export function StatsCard({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6 hover:bg-slate-50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-400">
            {change} from last month
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl" />
    </div>
  );
}

export default StatsCard;
