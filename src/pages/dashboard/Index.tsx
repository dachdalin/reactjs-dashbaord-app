import { useEffect, useState } from "react";
import { postsApi, usersApi, contactsApi, newslettersApi, type PostResponse } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatsCard from "../../components/StatsCard";
import ActivityCard from "../../components/ActivityCard";
import ProgressCard from "../../components/ProgressCard";

interface DashStats {
  totalPosts: number;
  totalUsers: number | null;   // null if not admin
  totalContacts: number;
  totalSubscribers: number;
}

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
}

function postTypeColor(type: PostResponse["type"]): string {
  const m: Record<string, string> = {
    ARTICLE: "bg-white text-black",
    NEWS: "bg-white text-black",
    TUTORIAL: "bg-white text-black",
    CODE: "bg-white text-black",
  };
  return m[type] ?? "bg-white text-black";
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<DashStats>({ totalPosts: 0, totalUsers: null, totalContacts: 0, totalSubscribers: 0 });
  const [recentPosts, setRecentPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [posts, contacts, newsletters] = await Promise.all([
          postsApi.list(),
          contactsApi.list().catch(() => [] as Awaited<ReturnType<typeof contactsApi.list>>),
          newslettersApi.list().catch(() => [] as Awaited<ReturnType<typeof newslettersApi.list>>),
        ]);

        let totalUsers: number | null = null;
        if (isAdmin()) {
          const users = await usersApi.list().catch(() => []);
          totalUsers = users.length;
        }

        setStats({
          totalPosts: posts.length,
          totalUsers,
          totalContacts: contacts.length,
          totalSubscribers: newsletters.length,
        });

        // Most recent 4 posts for activity feed
        const sorted = [...posts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentPosts(sorted.slice(0, 4));
      } catch {
        // silently fail — API might not be running
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin]);

  // Map recent posts → ActivityCard format
  const activities = recentPosts.map((p) => ({
    user: p.author?.name ?? "Unknown",
    action: `published "${p.title}"`,
    time: timeAgo(p.createdAt),
    avatar: (p.author?.name ?? "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));

  // Map recent posts → ProgressCard format
  const projectsData = recentPosts.slice(0, 3).map((p) => ({
    name: p.title.length > 30 ? p.title.slice(0, 30) + "…" : p.title,
    progress: p.status ? 100 : 50,
    color: postTypeColor(p.type),
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">
          Welcome back{user ? `, ${user.name}` : ""}! Here's an overview of your workspace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Posts"
          value={loading ? "—" : stats.totalPosts.toString()}
          change={loading ? "" : `${stats.totalPosts} published`}
          color="bg-white text-black"
          icon={
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        {isAdmin() && (
          <StatsCard
            title="Total Users"
            value={loading ? "—" : (stats.totalUsers ?? 0).toString()}
            change="Registered accounts"
            color="bg-white text-black"
            icon={
              <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        )}
        <StatsCard
          title="Contact Messages"
          value={loading ? "—" : stats.totalContacts.toString()}
          change="Inbox messages"
          color="bg-white text-black"
          icon={
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Newsletter Subs"
          value={loading ? "—" : stats.totalSubscribers.toString()}
          change="Email subscribers"
          color="bg-white text-black"
          icon={
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse h-48" />
          ) : activities.length > 0 ? (
            <ActivityCard activities={activities} />
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col items-center justify-center text-center">
              <svg className="h-12 w-12 text-white/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-white/60">No posts yet. Create your first post!</p>
            </div>
          )}
        </div>
        <div>
          {loading ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse h-48" />
          ) : projectsData.length > 0 ? (
            <ProgressCard projects={projectsData} />
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <p className="text-white/60 text-sm text-center">No post data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-white/60 mt-2 text-sm">
            {recentPosts.length > 0
              ? `${recentPosts.length} recent post${recentPosts.length > 1 ? "s" : ""} published.`
              : "No recent activity. Start by creating a post."}
          </p>
          <a href="/blogs" className="mt-4 inline-block px-4 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
            View Posts
          </a>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <p className="text-white/80 mt-2 text-sm">
            Create new posts, manage users, or update settings.
          </p>
          <a href="/blogs" className="mt-4 inline-block px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors">
            New Post
          </a>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white">Newsletter</h3>
          <p className="text-white/60 mt-2 text-sm">
            {loading ? "Loading..." : `${stats.totalSubscribers} subscriber${stats.totalSubscribers !== 1 ? "s" : ""} registered.`}
          </p>
          <button className="mt-4 px-4 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
            View Subscribers
          </button>
        </div>
      </div>
    </div>
  );
}
