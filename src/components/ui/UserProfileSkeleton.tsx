export default function UserProfileSkeleton() {
  return (
    <div className="p-4 border-t border-slate-700/70">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-slate-800/70" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-20 bg-slate-800/70 rounded mb-2" />
          <div className="h-3 w-28 bg-slate-800/70 rounded" />
        </div>
      </div>
    </div>
  );
}