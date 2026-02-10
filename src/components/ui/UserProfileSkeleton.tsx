export default function UserProfileSkeleton() {
  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-20 bg-white/10 rounded mb-2" />
          <div className="h-3 w-28 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}