import { useState, useEffect } from "react";
import UserProfileSkeleton from "./UserProfileSkeleton";
export default function UserProfile() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Simulate a 1.5 second load time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <UserProfileSkeleton />;
  }

  const displayName =  "Guest User";
  const displayEmail = "Not signed in";
  const initials = "GU";

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
        </div>
      </div>
    </div>
  );
}