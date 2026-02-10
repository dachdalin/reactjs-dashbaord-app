
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import UserProfile from "./ui/UserProfile";
import {
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
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
    name: "Projects",
    href: "/projects",
    icon: FolderIcon,
  },
  {
    name: "Teams",
    href: "/teams",
    icon: UserGroupIcon,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
  },
  {
    name: "Blogs",
    href: "/blogs",
    icon: DocumentDuplicateIcon,
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
      <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30": isActive,
                "text-gray-300 hover:bg-white/10 hover:text-white": !isActive,
              }
            )}
          >
            <LinkIcon className={clsx(
              "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
              isActive ? "text-white" : "text-gray-400 group-hover:text-white"
            )} />
            <span>{link.name}</span>
            {isActive && (
              <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}



function LogoutButton() {
  return (
    <form action={"/logout"} className="px-4 pb-4">
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 border border-white/10 hover:border-red-500/30"
      >
        <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
        Sign Out
      </button>
    </form>
  );
}

export default function SideNav() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">ReactJS App</h1>
          <p className="text-xs text-gray-400">Dashboard v1.0</p>
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