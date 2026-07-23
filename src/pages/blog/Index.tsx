import { useState, useEffect, useRef } from "react";
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

  const searchRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Blog Posts</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin()
              ? "Manage all posts across the organization."
              : isAuthor()
              ? "Manage your published posts & create multi-section articles."
              : "Browse published articles and tutorials."}
          </p>
        </div>
        {isAuthor() && (
          <button
            onClick={() => navigate("/blogs/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-medium shadow-lg shadow-sky-200/70 hover:opacity-90 transition-all hover:scale-105"
          >
            <svg className="h-4 w-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto text-slate-500 hover:text-slate-950">
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search posts by title or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveType(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeType === cat
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl bg-white border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Image / Type banner */}
                {post.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500 text-slate-950 shadow-md">
                      {post.type}
                    </span>
                  </div>
                ) : (
                  <div className="h-14 bg-sky-500 text-slate-950 flex items-center justify-between px-5 font-semibold text-xs tracking-wider">
                    <span>{post.type}</span>
                    <span>{post.duration ? `${post.duration} MIN READ` : ""}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-950 line-clamp-2 group-hover:text-sky-700 transition-colors flex-1">
                      {post.title}
                    </h3>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {post.status ? "Live" : "Draft"}
                    </span>
                  </div>

                  {post.shortDesc && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {post.shortDesc}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                          #{tag.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Author & Meta Footer */}
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      {(post.author?.name ?? "?")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-950">{post.author?.name ?? "Unknown"}</p>
                      <p className="text-[11px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {canEdit(post) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/blogs/edit/${post.id}`)}
                        title="Edit post"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(post.id)}
                        title="Delete post"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white border border-slate-200">
          <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-slate-950 text-lg font-semibold">No posts found</p>
          <p className="text-slate-500 text-sm mt-1">
            {isAuthor() ? "Create your first article using the new post editor!" : "Try adjusting your search or category filter."}
          </p>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Delete Post?</h3>
            <p className="text-slate-500 text-sm">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
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
