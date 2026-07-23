import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { tagsApi, type TagResponse } from "../../lib/api";

interface TagModalProps {
  tag?: TagResponse;
  onClose: () => void;
  onSaved: () => void;
}

function TagModal({ tag: editTag, onClose, onSaved }: TagModalProps) {
  const [title, setTitle] = useState(editTag?.title ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tag title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editTag) {
        await tagsApi.update(editTag.id, title.trim());
      } else {
        await tagsApi.create(title.trim());
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save tag.");
    } finally {
      setSaving(false);
    }
  }

  // Generate slug preview
  const slugPreview = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-950">{editTag ? "Edit Tag" : "Create New Tag"}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technology, React, Design"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          {title && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block mb-0.5">URL Slug Preview</span>
              <code className="text-xs text-sky-700 font-mono">#{slugPreview}</code>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium hover:bg-sky-400 text-sm disabled:opacity-50 transition-all shadow-sm"
            >
              {saving ? "Saving..." : editTag ? "Update Tag" : "Create Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TagsPage() {
  const { isAdmin, isAuthor } = useAuth();
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<TagResponse | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = isAdmin() || isAuthor();

  async function loadTags() {
    setLoading(true);
    try {
      const data = await tagsApi.list();
      setTags(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  async function handleDelete(id: number) {
    try {
      await tagsApi.delete(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete tag.");
    }
  }

  const filtered = tags.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Tags Management</h1>
          <p className="text-slate-500 mt-1">
            Organize and manage tags used across your articles and blog posts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditTag(undefined);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium text-sm hover:bg-sky-400 transition-all shadow-sm self-start sm:self-auto"
          >
            <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Tag
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl">
            🏷️
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950">{loading ? "—" : tags.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total Active Tags</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
            🔍
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950">{loading ? "—" : filtered.length}</p>
            <p className="text-xs text-slate-500 font-medium">Matching Search</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950">
              {canManage ? "Full Access" : "Read-Only"}
            </p>
            <p className="text-xs text-slate-500 font-medium">Your Tag Permissions</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tags by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 shadow-sm"
          />
        </div>
        <button
          onClick={loadTags}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh Tags"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
          <span className="text-4xl mb-3 block">🏷️</span>
          <p className="text-slate-950 font-semibold text-base">No tags found</p>
          <p className="text-slate-500 text-xs mt-1">
            {search ? "Try adjusting your search query." : "Create your first tag to categorize blog content."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold font-mono">
                    #{t.slug}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditTag(t);
                          setShowModal(true);
                        }}
                        title="Edit tag"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        title="Delete tag"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-sky-700 transition-colors">
                  {t.title}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>ID: #{t.id}</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tag Create/Edit Modal */}
      {showModal && (
        <TagModal
          tag={editTag}
          onClose={() => {
            setShowModal(false);
            setEditTag(undefined);
          }}
          onSaved={loadTags}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Delete Tag?</h3>
            <p className="text-slate-500 text-sm">
              Are you sure you want to delete this tag? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
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
