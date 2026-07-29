import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { postsApi, usersApi, contactsApi, newslettersApi, type PostResponse } from '../../lib/api'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hook/useToast'
import StatsCard from '../../components/StatsCard'
import ActivityCard from '../../components/ActivityCard'
import { usePageTitle } from '../../hook/usePageTitle'

interface DashStats {
  totalPosts: number
  totalUsers: number | null
  totalContacts: number
  totalSubscribers: number
  publishedPosts: number
  totalViews: number
}

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
}

function postTypeLabel(type: PostResponse['type']): string {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', { notation: value >= 10000 ? 'compact' : 'standard' }).format(value)
}

const TYPE_COLORS: Record<PostResponse['type'], string> = {
  ARTICLE: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  NEWS: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  TUTORIAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CODE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const RANK_COLORS = [
  'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
  'bg-gradient-to-br from-slate-400 to-slate-500 text-white',
  'bg-gradient-to-br from-amber-600 to-amber-700 text-white',
  'bg-slate-700/80 text-slate-300',
  'bg-slate-700/80 text-slate-300',
]

// ── Skeleton ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-2.5 w-20 rounded bg-slate-700" />
          <div className="h-10 w-24 rounded bg-slate-700" />
          <div className="h-2.5 w-28 rounded bg-slate-700" />
        </div>
        <div className="h-14 w-14 rounded-2xl bg-slate-700" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { isAdmin, isAuthor, user } = useAuth()
  const { error: toastError } = useToast()
  const [stats, setStats] = useState<DashStats>({
    totalPosts: 0,
    totalUsers: null,
    totalContacts: 0,
    totalSubscribers: 0,
    publishedPosts: 0,
    totalViews: 0,
  })
  const [recentPosts, setRecentPosts] = useState<PostResponse[]>([])
  const [allPosts, setAllPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [posts, contacts, newsletters] = await Promise.all([
          postsApi.list(),
          contactsApi.list().catch(() => [] as Awaited<ReturnType<typeof contactsApi.list>>),
          newslettersApi.list().catch(() => [] as Awaited<ReturnType<typeof newslettersApi.list>>),
        ])

        let totalUsers: number | null = null
        if (isAdmin()) {
          const users = await usersApi.list().catch(() => [])
          totalUsers = users.length
        }

        setStats({
          totalPosts: posts.length,
          totalUsers,
          totalContacts: contacts.length,
          totalSubscribers: newsletters.length,
          publishedPosts: posts.filter((post) => post.status).length,
          totalViews: posts.reduce((sum, post) => sum + (post.views ?? 0), 0),
        })

        setAllPosts(posts)
        setRecentPosts(
          [...posts]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
        )
      } catch (err: unknown) {
        toastError(
          'Failed to load dashboard data',
          err instanceof Error ? err.message : 'Check your connection.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin, toastError])

  const activities = recentPosts.map((post) => ({
    user: post.author?.name ?? 'Unknown',
    action: `published "${post.title}"`,
    time: timeAgo(post.createdAt),
    avatar: (post.author?.name ?? '?')
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }))

  const popularPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => {
        const viewsDiff = (b.views ?? 0) - (a.views ?? 0)
        if (viewsDiff !== 0) return viewsDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 5)
  }, [allPosts])

  const draftCount = Math.max(stats.totalPosts - stats.publishedPosts, 0)
  const averageViews = stats.totalPosts === 0 ? 0 : Math.round(stats.totalViews / stats.totalPosts)
  const publishRate = stats.totalPosts === 0 ? 0 : Math.round((stats.publishedPosts / stats.totalPosts) * 100)

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-6 md:p-8">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          {/* grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/80 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Content overview
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="mt-1.5 text-white/70 text-sm max-w-lg">
              Track your publishing performance, audience growth, and inbox activity all in one place.
            </p>
          </div>

          {isAuthor() && (
            <Link
              to="/admin/blogs/create"
              className="group inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-xl shadow-indigo-900/30 hover:bg-indigo-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Posts"
              value={formatNumber(stats.totalPosts)}
              change={`${stats.publishedPosts} published · ${draftCount} drafts`}
              gradient="from-violet-500 to-indigo-600"
              glowColor="hover:shadow-violet-500/20"
              trend="up"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Views"
              value={formatNumber(stats.totalViews)}
              change="Across all posts"
              gradient="from-emerald-500 to-teal-600"
              glowColor="hover:shadow-emerald-500/20"
              trend="up"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            {isAdmin() && (
              <StatsCard
                title="Team Users"
                value={formatNumber(stats.totalUsers ?? 0)}
                change="Registered accounts"
                gradient="from-sky-500 to-blue-600"
                glowColor="hover:shadow-sky-500/20"
                trend="neutral"
                icon={
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            )}
            <StatsCard
              title="Messages"
              value={formatNumber(stats.totalContacts)}
              change={`${stats.totalSubscribers} newsletter subscribers`}
              gradient="from-amber-500 to-orange-600"
              glowColor="hover:shadow-amber-500/20"
              trend="up"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* ── Main Content Row ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Activity Feed – spans 2 cols */}
        <section className="xl:col-span-2">
          {loading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50" />
          ) : activities.length > 0 ? (
            <ActivityCard activities={activities} />
          ) : (
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-10 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/60 flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">No activity yet</p>
              <p className="text-sm text-slate-400">Create your first post to start building the activity feed.</p>
            </div>
          )}
        </section>

        {/* Popular Posts – 1 col */}
        <section className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Popular Posts</h2>
              <p className="text-sm text-slate-400 mt-0.5">Ranked by views</p>
            </div>
            <Link
              to="/admin/blogs"
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-700/50" />
              ))}
            </div>
          ) : popularPosts.length > 0 ? (
            <div className="space-y-2">
              {popularPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/admin/blogs/edit/${post.id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/40 transition-all duration-200"
                >
                  {/* Rank badge */}
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${RANK_COLORS[index] ?? RANK_COLORS[RANK_COLORS.length - 1]}`}>
                    {index + 1}
                  </span>

                  {/* Post info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white group-hover:text-violet-300 transition-colors">{post.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border ${TYPE_COLORS[post.type]}`}>
                        {postTypeLabel(post.type)}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{post.author?.name ?? 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-white">{formatNumber(post.views ?? 0)}</p>
                    <p className="text-[10px] text-slate-500">views</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-700/30 p-6 text-center">
              <p className="text-sm text-slate-400">No popular posts yet</p>
            </div>
          )}
        </section>
      </div>

      {/* ── Quick Metrics Row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Draft Queue */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-rose-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Draft Queue</span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {loading ? (
                <span className="inline-block h-10 w-16 rounded bg-slate-700 animate-pulse" />
              ) : formatNumber(draftCount)}
            </p>
            <p className="mt-1 text-sm text-slate-400">posts waiting to publish</p>
          </div>
        </div>

        {/* Average Views */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-sky-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Avg. Views</span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {loading || stats.totalPosts === 0 ? (
                <span className="text-slate-500">—</span>
              ) : formatNumber(averageViews)}
            </p>
            <p className="mt-1 text-sm text-slate-400">per post on average</p>
          </div>
        </div>

        {/* Publish Rate */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publish Rate</span>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {loading ? (
                <span className="inline-block h-10 w-16 rounded bg-slate-700 animate-pulse" />
              ) : `${publishRate}%`}
            </p>
            {/* mini progress bar */}
            <div className="mt-3 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                style={{ width: `${loading ? 0 : publishRate}%` }}
              />
            </div>
            <p className="mt-1.5 text-sm text-slate-400">of posts are published</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Row ── */}
      {isAuthor() && (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Write a Post', href: '/admin/blogs/create', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20' },
              { label: 'View Blogs', href: '/admin/blogs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20' },
              { label: 'Manage Tags', href: '/admin/tags', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' },
              { label: 'View Messages', href: '/admin/comments', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' },
            ].map(({ label, href, icon, color }) => (
              <Link
                key={label}
                to={href}
                className={`group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${color}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-current/5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
