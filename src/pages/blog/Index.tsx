import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { postsApi, type PostResponse } from "../../lib/api";

export default function Blogs() {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthor } = useAuth();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await postsApi.list();
      setPosts(data);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function canEdit(post: PostResponse): boolean {
    if (isAdmin()) return true;
    if (isAuthor() && post.author?.id === user?.id) return true;
    return false;
  }

  async function handleDelete(id: number) {
    try {
      await postsApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to delete post");
    }
  }

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.type)))];

  const filtered = posts.filter((p) => {
    const matchType = activeType === "All" || p.type === activeType;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q || p.title.toLowerCase().includes(q) || (p.shortDesc ?? "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Blog Articles</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isAdmin()
              ? "Manage all published & draft articles across the organization."
              : isAuthor()
              ? "Publish articles, tutorials, and manage your content library."
              : "Explore tech articles, tutorials, and news updates."}
          </p>
        </div>
        {isAuthor() && (
          <button
            onClick={() => navigate("/blogs/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold shadow-md shadow-sky-200 hover:bg-sky-400 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
          >
            <svg className="h-4 w-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Article
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-xs">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Filter & Control Panel ── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={loadPosts}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              title="Refresh Articles"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Categories:</span>
          {categories.map((cat) => {
            const count = cat === "All" ? posts.length : posts.filter((p) => p.type === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveType(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeType === cat
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-950"
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeType === cat ? "bg-slate-950/20 text-slate-950" : "bg-slate-200/80 text-slate-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1 px-1">
        <span>
          Showing <strong className="text-slate-950 font-bold">{filtered.length}</strong> {filtered.length === 1 ? "article" : "articles"}
          {activeType !== "All" && <span> in category <strong className="text-sky-700 font-bold">{activeType}</strong></span>}
        </span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-sky-600 hover:underline">
            Clear search filter
          </button>
        )}
      </div>

      {/* ── ARTICLES DATA CONTENT ── */}
      {loading ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-4xl mb-3 block">📄</span>
          <p className="text-slate-950 text-lg font-bold">No articles found</p>
          <p className="text-slate-500 text-xs mt-1">
            {isAuthor() ? "Start by creating your first article!" : "Try adjusting your search query or category filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider text-left border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Article</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Author</th>
                  <th className="px-4 py-4">Views</th>
                  <th className="px-4 py-4">Read Time</th>
                  <th className="px-4 py-4">Created Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5 max-w-md">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-12 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {post.type.slice(0, 3)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-950 truncate hover:text-sky-700 transition-colors">
                            {post.title}
                          </h4>
                          {post.shortDesc && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{post.shortDesc}</p>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {post.tags.slice(0, 2).map((t) => (
                                <span key={t.id} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  #{t.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                        {post.type}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                          post.status
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {post.status ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[11px]">
                          {(post.author?.name ?? "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{post.author?.name ?? "Author"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                      {post.views ?? 0}
                    </td>

                    <td className="px-4 py-4 text-xs font-mono text-slate-600">
                      {post.duration ? `${post.duration} min` : "—"}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {canEdit(post) ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/blogs/edit/${post.id}`)}
                            className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-100 transition-colors"
                            title="Edit Article"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(post.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Article"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            Showing {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Delete Article?</h3>
            <p className="text-slate-500 text-sm">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
