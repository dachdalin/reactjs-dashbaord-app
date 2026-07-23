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
    ADMIN: "bg-white text-black",
    AUTHOR: "bg-white text-black",
    USER: "bg-white text-black",
  };
  const roleColor = roleBadgeColor[user?.type ?? "USER"] ?? "bg-white text-black";

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
            <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
              <span className="text-black font-semibold text-sm">{initials}</span>
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${roleColor} border-2 border-black`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-white/60 truncate">{displayEmail}</p>
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
