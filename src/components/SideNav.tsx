import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import UserProfile from "./ui/UserProfile";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
type LinkType = {
  name: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const links: LinkType[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Users",
    href: "/teams",
    icon: UserGroupIcon,
  },
  {
    name: "Blogs",
    href: "/blogs",
    icon: DocumentDuplicateIcon,
  },
  {
    name: "Comments",
    href: "/comments",
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: "Pages",
    href: "/pages",
    icon: DocumentTextIcon,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Cog6ToothIcon,
  },
];

function NavLinks() {
  const { pathname } = useLocation();
  const activePath = pathname;

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      <p className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Main Menu
      </p>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = activePath === link.href;
        return (
          <Link
            key={link.name}
            to={link.href}
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              {
                "bg-sky-500 text-slate-950 shadow-lg shadow-sky-950/30":
                  isActive,
                "text-slate-200 hover:bg-slate-800/70 hover:text-sky-100": !isActive,
              },
            )}
          >
            <LinkIcon
              className={clsx(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive
                  ? "text-slate-950"
                  : "text-slate-400 group-hover:text-sky-100",
              )}
            />
            <span>{link.name}</span>
            {isActive && (
              <div className="ml-auto h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  const { logout, isPending } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/auth/login", { replace: true });
  }

  return (
    <div className="px-4 pb-4">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-900/70 hover:bg-slate-800/80 hover:text-sky-100 transition-all duration-200 border border-slate-700/70 hover:border-sky-500/30 disabled:opacity-50"
      >
        <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
        {isPending ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
}

export default function SideNav() {
  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/70">
        <div className="h-10 w-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-950/30">
          <svg
            className="h-6 w-6 text-slate-950"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">ReactJS App</h1>
          <p className="text-xs text-slate-400">Dashboard v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <NavLinks />

      {/* User Profile & Logout */}
      <UserProfile />
      <LogoutButton />
    </div>
  );
}
