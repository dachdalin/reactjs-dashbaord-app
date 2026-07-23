import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import UserProfileSkeleton from "./UserProfileSkeleton";

export default function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <UserProfileSkeleton />;

  if (!user) return null;

  const displayName = user.name;
  const displayEmail = user.email;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-sky-500 text-slate-950",
    AUTHOR: "bg-purple-500 text-white",
    USER: "bg-emerald-500 text-slate-950",
  };
  const roleColor = roleBadgeColor[user?.type ?? "USER"] ?? "bg-sky-500 text-slate-950";

  return (
    <div className="p-4 border-t border-white/10">
      <Link
        to="/profile"
        title="View & Edit Profile"
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group border border-white/5 hover:border-white/20"
      >
        <div className="relative shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-semibold text-sm shadow-md">
              {initials}
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${roleColor} border-2 border-slate-900`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
            {displayName}
          </p>
          <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
        </div>
        {user?.type && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleColor} shrink-0`}>
            {user.type}
          </span>
        )}
      </Link>
    </div>
  );
}
