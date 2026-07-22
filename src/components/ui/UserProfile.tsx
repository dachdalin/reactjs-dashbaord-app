import { useAuth } from "../../context/AuthContext";
import UserProfileSkeleton from "./UserProfileSkeleton";

export default function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <UserProfileSkeleton />;

  const displayName = user?.name ?? "Guest User";
  const displayEmail = user?.email ?? "Not signed in";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-red-500",
    AUTHOR: "bg-purple-500",
    USER: "bg-emerald-500",
  };
  const roleColor = roleBadgeColor[user?.type ?? "USER"] ?? "bg-emerald-500";

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${roleColor} border-2 border-slate-900`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
        </div>
        {user?.type && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleColor} text-white opacity-80`}>
            {user.type}
          </span>
        )}
      </div>
    </div>
  );
}