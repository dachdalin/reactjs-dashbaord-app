export default function ProgressCard({ projects }: { projects: { name: string; progress: number; color: string }[] }) {

  return (
    <div className="rounded-2xl bg-white backdrop-blur-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-950 mb-4">Project Progress</h3>
      <div className="space-y-5">
        {projects.map((project, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-700">{project.name}</span>
              <span className="text-sm text-slate-500">{project.progress}%</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-sky-500 text-slate-950 transition-all duration-500`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}