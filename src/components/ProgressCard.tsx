export default function ProgressCard({ projects }: { projects: { name: string; progress: number; color: string }[] }) {

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Project Progress</h3>
      <div className="space-y-5">
        {projects.map((project, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300">{project.name}</span>
              <span className="text-sm text-gray-400">{project.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${project.color} transition-all duration-500`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}