import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { postsApi, tagsApi, type PostResponse, type TagResponse } from "../../lib/api";

const POST_TYPES = ["ARTICLE", "NEWS", "TUTORIAL", "CODE"] as const;

const TYPE_COLORS: Record<string, string> = {
  ARTICLE: "from-cyan-500 to-blue-600",
  NEWS: "from-orange-500 to-red-600",
  TUTORIAL: "from-emerald-500 to-teal-600",
  CODE: "from-purple-500 to-indigo-600",
};

interface PostModalProps {
  post?: PostResponse;
  authorId: number;
  onClose: () => void;
  onSaved: () => void;
}

function PostModal({ post, authorId, onClose, onSaved }: PostModalProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [shortDesc, setShortDesc] = useState(post?.shortDesc ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [type, setType] = useState<string>(post?.type ?? "ARTICLE");
  const [status, setStatus] = useState(post?.status ?? false);
  const [allTags, setAllTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(post?.tags?.map((t) => t.id) ?? []);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tagsApi.list().then(setAllTags).catch(() => {});
  }, []);

  async function handleCreateTag() {
    if (!newTagTitle.trim()) return;
    try {
      const tag = await tagsApi.create(newTagTitle.trim());
      setAllTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagTitle("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create tag");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { title, shortDesc, content, type, status, authorId, tagIds: selectedTagIds };
      if (post) {
        await postsApi.update(post.id, payload);
      } else {
        await postsApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-bold text-white">{post ? "Edit Post" : "New Post"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Post title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Short Description</label>
            <input
              value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Brief summary..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Content *</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)} required rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Type *</label>
              <select
                value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setStatus((s) => !s)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${status ? "bg-indigo-600" : "bg-gray-600"} cursor-pointer`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${status ? "right-1" : "left-1"}`} />
                </div>
                <span className="text-sm text-gray-300">Published</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id} type="button"
                  onClick={() => setSelectedTagIds((prev) =>
                    prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {tag.title}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTagTitle} onChange={(e) => setNewTagTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Create new tag..."
              />
              <button type="button" onClick={handleCreateTag} className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 text-sm transition-colors">
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Blogs Page ───────────────────────────────────────
export default function Blogs() {
  const { user, isAuthor, isAdmin } = useAuth();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<PostResponse | undefined>(undefined);
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

  useEffect(() => { loadPosts(); }, []);

  // Role checks for CRUD
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
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.shortDesc ?? "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin() ? "Manage all posts" : isAuthor() ? "Manage your posts & create tags" : "Browse articles and tutorials."}
          </p>
        </div>
        {isAuthor() && (
          <button
            onClick={() => { setEditPost(undefined); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input ref={searchRef} type="text" placeholder="Search posts..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveType(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeType === cat
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
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
            <div key={n} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-pulse">
              <div className="h-48 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Image / Type banner */}
              {post.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${TYPE_COLORS[post.type] ?? "from-indigo-500 to-purple-600"}`}>
                    {post.type}
                  </span>
                </div>
              ) : (
                <div className={`h-14 bg-gradient-to-r ${TYPE_COLORS[post.type] ?? "from-indigo-500 to-purple-600"} flex items-center px-4`}>
                  <span className="text-white font-semibold text-sm tracking-wide">{post.type}</span>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors flex-1">
                    {post.title}
                  </h3>
                  {/* Status badge */}
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {post.status ? "Live" : "Draft"}
                  </span>
                </div>
                {post.shortDesc && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">{post.shortDesc}</p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                        #{tag.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {(post.author?.name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{post.author?.name ?? "Unknown"}</p>
                      <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions (role-gated) */}
                  {canEdit(post) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditPost(post); setShowModal(true); }}
                        title="Edit post"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(post.id)}
                        title="Delete post"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/5 border border-white/10">
          <svg className="h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-gray-400 text-lg font-medium">No posts found</p>
          <p className="text-gray-500 text-sm mt-1">
            {isAuthor() ? "Create your first post!" : "Try adjusting your search or filter."}
          </p>
        </div>
      )}

      {/* Post Modal */}
      {showModal && user && (
        <PostModal
          post={editPost}
          authorId={user.id}
          onClose={() => { setShowModal(false); setEditPost(undefined); }}
          onSaved={loadPosts}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Post?</h3>
            <p className="text-gray-400 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition-colors"
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
