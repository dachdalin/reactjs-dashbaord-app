import { projects } from "../../lib/data";
export default function Projects() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">
            Track and manage your ongoing projects.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <a
            href="/projects/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Project
          </a>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: "12", icon: "📁" },
          { label: "In Progress", value: "6", icon: "🔄" },
          { label: "Completed", value: "4", icon: "✅" },
          { label: "On Hold", value: "2", icon: "⏸️" },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 flex items-center gap-4"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${project.statusColor}`}
                  >
                    {project.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">
                  {project.progress}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    project.progress === 100
                      ? "bg-emerald-500"
                      : "bg-linear-to-r from-indigo-500 to-purple-500"
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, j) => (
                    <div
                      key={j}
                      className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-slate-900"
                    >
                      <span className="text-white text-xs font-semibold">
                        {member}
                      </span>
                    </div>
                  ))}
                  {project.team.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-slate-900">
                      <span className="text-white text-xs">
                        +{project.team.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Deadline</p>
                <p className="text-sm text-white">{project.deadline}</p>
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-4 text-sm text-gray-400">
              {project.tasks.completed}/{project.tasks.total} tasks completed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
