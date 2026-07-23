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
    ADMIN: "bg-sky-500 text-slate-950",
    AUTHOR: "bg-sky-500 text-slate-950",
    USER: "bg-sky-500 text-slate-950",
  };
  const roleColor = roleBadgeColor[user?.type ?? "USER"] ?? "bg-sky-500 text-slate-950";

  return (
    <div className="p-4 border-t border-slate-700/70">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/70 transition-colors cursor-pointer">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
              <span className="text-slate-950 font-semibold text-sm">{initials}</span>
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${roleColor} border-2 border-slate-950`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{displayName}</p>
          <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
        </div>
        {user?.type && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleColor} opacity-80`}>
            {user.type}
          </span>
        )}
      </div>
    </div>
  );
}
