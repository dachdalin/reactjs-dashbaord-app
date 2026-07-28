import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../context/useAuth";
import { useToast } from "../hook/useToast";
import UserProfile from "./ui/UserProfile";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

type LinkType = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  adminOnly?: boolean;
};

const links: LinkType[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Team Users", href: "/admin/teams", icon: UserGroupIcon, adminOnly: true },
  { name: "Pages Manager", href: "/admin/pages", icon: DocumentDuplicateIcon, adminOnly: true },
  { name: "Blog Posts", href: "/admin/blogs", icon: DocumentTextIcon },
  { name: "Contact & Comments", href: "/admin/comments", icon: ChatBubbleLeftEllipsisIcon },
  { name: "Tags", href: "/admin/tags", icon: TagIcon },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Cog6ToothIcon,
  },
];

function NavLinks() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin());

  return (
    <nav className="flex-1 space-y-1.5 px-4 py-4">
      {visibleLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          link.href === "/admin/dashboard"
            ? pathname === "/" || pathname === "/admin/dashboard"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.name}
            to={link.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              {
                "bg-sky-500 text-slate-950 font-semibold shadow-lg shadow-sky-950/40":
                  isActive,
                "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100":
                  !isActive,
              }
            )}
          >
            <LinkIcon className="h-5 w-5 shrink-0" />
            <p>{link.name}</p>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  const { logout, isPending } = useAuth();
  const navigate = useNavigate();
  const { confirm: toastConfirm } = useToast();

  function handleLogout() {
    toastConfirm("Are you sure you want to sign out of your account?", async () => {
      await logout();
      navigate("/auth/login", { replace: true });
    });
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
