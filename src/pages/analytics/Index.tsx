import { stats, topPages, trafficSources } from "../../lib/data";
export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Monitor your website performance and user engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            title="Please select"
            defaultValue="Last 7 days"
            name="filter_select"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            <p
              className={`text-sm mt-2 ${stat.up ? "text-emerald-400" : "text-red-400"}`}
            >
              {stat.change} from last period
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitors Chart Placeholder */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Visitors Overview
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 45, 75, 55, 85, 60, 90, 70, 80, 50, 95, 75].map(
              (height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-linear-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all hover:from-indigo-500 hover:to-purple-500"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {
                      [
                        "J",
                        "F",
                        "M",
                        "A",
                        "M",
                        "J",
                        "J",
                        "A",
                        "S",
                        "O",
                        "N",
                        "D",
                      ][i]
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Traffic Sources
          </h3>
          <div className="space-y-4">
            {trafficSources.map((source, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">{source.source}</span>
                  <span className="text-white font-medium">
                    {source.visitors}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${source.color}`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Top Pages</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                <th className="pb-4 font-medium">Page</th>
                <th className="pb-4 font-medium">Views</th>
                <th className="pb-4 font-medium">Percentage</th>
                <th className="pb-4 font-medium w-1/3">Traffic</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-4 text-white font-medium">{page.page}</td>
                  <td className="py-4 text-gray-300">{page.views}</td>
                  <td className="py-4 text-gray-300">{page.percentage}%</td>
                  <td className="py-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${page.percentage * 2}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
