import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { postsApi, usersApi, contactsApi, newslettersApi, type PostResponse } from '../../lib/api'
import { useAuth } from '../../context/useAuth'
import StatsCard from '../../components/StatsCard'
import ActivityCard from '../../components/ActivityCard'

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

export default function Dashboard() {
  const { isAdmin, isAuthor, user } = useAuth()
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
      } catch {
        // API might not be running.
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">Content overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{user ? `, ${user.name}` : ''}. Track publishing, audience, and inbox activity.
          </p>
        </div>
        {isAuthor() && (
          <Link
            to="/blogs/create"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Posts"
          value={loading ? '-' : formatNumber(stats.totalPosts)}
          change={loading ? 'Loading content' : `${stats.publishedPosts} published`}
          color="bg-sky-100 text-sky-700"
          icon={
            <svg className="h-5 w-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Views"
          value={loading ? '-' : formatNumber(stats.totalViews)}
          change="Across all posts"
          color="bg-emerald-100 text-emerald-700"
          icon={
            <svg className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        {isAdmin() && (
          <StatsCard
            title="Users"
            value={loading ? '-' : formatNumber(stats.totalUsers ?? 0)}
            change="Registered accounts"
            color="bg-violet-100 text-violet-700"
            icon={
              <svg className="h-5 w-5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72M15 11.25a3 3 0 11-6 0 3 3 0 016 0zm6 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM3 18.72a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72M6.75 11.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
          />
        )}
        <StatsCard
          title="Messages"
          value={loading ? '-' : formatNumber(stats.totalContacts)}
          change={`${stats.totalSubscribers} newsletter subscribers`}
          color="bg-amber-100 text-amber-700"
          icon={
            <svg className="h-5 w-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          {loading ? (
            <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ) : activities.length > 0 ? (
            <ActivityCard activities={activities} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-950">No posts yet</p>
              <p className="mt-1 text-sm text-slate-500">Create the first article to start filling the activity feed.</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Popular Posts</h2>
              <p className="text-sm text-slate-500">Ranked by views</p>
            </div>
            <Link to="/blogs" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : popularPosts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {popularPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blogs/edit/${post.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{post.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{postTypeLabel(post.type)}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{post.author?.name ?? 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-950">{formatNumber(post.views ?? 0)}</p>
                    <p className="text-xs text-slate-400">views</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">No popular posts yet</p>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Draft Queue</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? '-' : formatNumber(draftCount)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Posts waiting to publish</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Average Views</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading || stats.totalPosts === 0 ? '-' : formatNumber(averageViews)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Per post</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Latest Update</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {loading ? '-' : recentPosts[0] ? timeAgo(recentPosts[0].createdAt) : 'No posts'}
          </p>
          <p className="mt-1 text-sm text-slate-500">Most recent content activity</p>
        </div>
      </div>
    </div>
  )
}
