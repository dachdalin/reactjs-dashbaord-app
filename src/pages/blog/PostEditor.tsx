import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { postsApi, tagsApi, type TagResponse } from "../../lib/api";
import PostBannerUploader from "../../components/blog/PostBannerUploader";

const POST_TYPES = ["ARTICLE", "NEWS", "TUTORIAL", "CODE"] as const;

// ── Section Types (Text, Code & Heading) ──────────────────
type SectionType = "text" | "code" | "heading";

interface TextSection {
  id: string;
  type: "text";
  content: string;
}

interface CodeSection {
  id: string;
  type: "code";
  language: string;
  code: string;
}

interface HeadingSection {
  id: string;
  type: "heading";
  content: string;
  level: "h1" | "h2" | "h3";
}

type ContentSection = TextSection | CodeSection | HeadingSection;

function generateId(): string {
  return "sec_" + Math.random().toString(36).substring(2, 9);
}

// ── Convert Sections -> HTML string ───────────────────────
function compileSectionsToHtml(sections: ContentSection[]): string {
  return sections
    .map((sec) => {
      if (sec.type === "text") {
        return `<div className="content-section text-section mb-4">${sec.content}</div>`;
      } else if (sec.type === "heading") {
        const tag = sec.level || "h2";
        const sizeClass =
          tag === "h1"
            ? "text-3xl font-extrabold"
            : tag === "h3"
            ? "text-xl font-semibold"
            : "text-2xl font-bold";
        return `<${tag} className="${sizeClass} text-slate-950 my-4">${sec.content}</${tag}>`;
      } else {
        const lang = (sec.language || "code").toLowerCase();
        const escapedCode = (sec.code || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `
<div className="content-section code-section my-4">
  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 text-xs font-mono rounded-t-xl border border-slate-800">
    <span>${lang.toUpperCase()}</span>
  </div>
  <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-sm rounded-b-xl overflow-x-auto border border-t-0 border-slate-800"><code>${escapedCode}</code></pre>
</div>`.trim();
      }
    })
    .join("\n\n");
}

function parseHtmlToSections(html: string): ContentSection[] {
  if (!html || !html.trim()) {
    return [{ id: generateId(), type: "text", content: "" }];
  }
  return [{ id: generateId(), type: "text", content: html }];
}

export default function PostEditor() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Post Metadata State
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [type, setType] = useState<string>("ARTICLE");
  const [status, setStatus] = useState(false);
  const [duration, setDuration] = useState<number>(5);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [allTags, setAllTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagTitle, setNewTagTitle] = useState("");

  // Sections State
  const [sections, setSections] = useState<ContentSection[]>([
    { id: generateId(), type: "text", content: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Post if editing
  useEffect(() => {
    tagsApi.list().then(setAllTags).catch(() => {});

    if (isEditing && id) {
      setLoading(true);
      postsApi
        .get(Number(id))
        .then((post) => {
          setTitle(post.title);
          setShortDesc(post.shortDesc ?? "");
          setType(post.type);
          setStatus(post.status ?? false);
          setDuration(post.duration ?? 5);
          setBannerUrl(post.image);
          if (post.tags) setSelectedTagIds(post.tags.map((t) => t.id));
          setSections(parseHtmlToSections(post.content));
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to load post.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Section Management Handlers
  function addSectionRow(indexAfter?: number, secType: SectionType = "text") {
    let newSec: ContentSection;
    if (secType === "text") {
      newSec = { id: generateId(), type: "text", content: "" };
    } else if (secType === "heading") {
      newSec = { id: generateId(), type: "heading", content: "", level: "h2" };
    } else {
      newSec = { id: generateId(), type: "code", language: "javascript", code: "" };
    }

    if (typeof indexAfter === "number") {
      const updated = [...sections];
      updated.splice(indexAfter + 1, 0, newSec);
      setSections(updated);
    } else {
      setSections((prev) => [...prev, newSec]);
    }
  }

  function removeSectionRow(secId: string) {
    if (sections.length === 1) return;
    setSections((prev) => prev.filter((s) => s.id !== secId));
  }

  function moveSectionRow(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSections(updated);
  }

  function changeSectionType(secId: string, newType: SectionType) {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;
        if (newType === "text") {
          return { id: sec.id, type: "text", content: "" };
        } else if (newType === "heading") {
          return { id: sec.id, type: "heading", content: "", level: "h2" };
        } else {
          return { id: sec.id, type: "code", language: "javascript", code: "" };
        }
      })
    );
  }

  function updateSectionFields(secId: string, fields: Record<string, unknown>) {
    setSections((prev) =>
      prev.map((sec) => (sec.id === secId ? ({ ...sec, ...fields } as ContentSection) : sec))
    );
  }

  async function handleCreateTag() {
    if (!newTagTitle.trim()) return;
    try {
      const tag = await tagsApi.create(newTagTitle.trim());
      setAllTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagTitle("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create tag.");
    }
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Post title is required.");
      return;
    }

    const compiledHtml = compileSectionsToHtml(sections);
    if (!compiledHtml.trim()) {
      setError("Please add content to your sections.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        shortDesc: shortDesc.trim(),
        content: compiledHtml,
        type,
        status,
        duration,
        image: bannerUrl,
        authorId: user?.id,
        tagIds: selectedTagIds,
      };

      if (isEditing && id) {
        await postsApi.update(Number(id), payload);
      } else {
        await postsApi.create(payload);
      }

      navigate("/blogs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSavePost} className="space-y-8 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Back to Posts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing ? `Editing Post #${id}` : "Configure post metadata, banner, and build section table"}
            </p>
          </div>
        </div>

        {/* Publish & Save Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400"
            />
            <span className="text-xs font-semibold text-slate-800">
              {status ? "Live (Published)" : "Draft"}
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium text-sm hover:bg-sky-400 transition-all disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {saving ? "Saving Post..." : isEditing ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Post Banner Component */}
      <PostBannerUploader
        postId={isEditing && id ? Number(id) : undefined}
        imageUrl={bannerUrl}
        onImageChange={setBannerUrl}
      />

      {/* Post Metadata Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3">Post Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Article Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Modern Web Applications with React"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Summary / Excerpt</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief overview for post summary cards..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category / Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            >
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Est. Read Time (Minutes)</label>
            <input
              type="number"
              min={1}
              max={120}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-sky-500 text-slate-950 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{tag.title}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTagTitle}
                onChange={(e) => setNewTagTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                placeholder="New tag..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400/40"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION TABLE CARD ────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-3">Article Sections</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden text-sm" id="sectionTable">
            <thead className="bg-slate-100 text-slate-900 text-center font-bold">
              <tr>
                <th style={{ width: "55%" }} className="border border-slate-200 px-4 py-3 text-left">
                  Content
                </th>
                <th style={{ width: "15%" }} className="border border-slate-200 px-3 py-3">
                  Type
                </th>
                <th style={{ width: "15%" }} className="border border-slate-200 px-3 py-3">
                  Language / Level
                </th>
                <th style={{ width: "15%" }} className="border border-slate-200 px-3 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sections.map((sec, idx) => (
                <tr key={sec.id} className="align-top hover:bg-slate-50/60 transition-colors">
                  {/* Content Column */}
                  <td className="border border-slate-200 p-3">
                    {sec.type === "text" && (
                      <textarea
                        rows={5}
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Enter section content or text..."
                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 resize-y"
                      />
                    )}

                    {sec.type === "heading" && (
                      <input
                        type="text"
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Enter heading title..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      />
                    )}

                    {sec.type === "code" && (
                      <textarea
                        rows={5}
                        value={sec.code}
                        onChange={(e) => updateSectionFields(sec.id, { code: e.target.value })}
                        placeholder="// Paste or write code snippet here..."
                        className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-y"
                      />
                    )}
                  </td>

                  {/* Type Dropdown Column (Text, Code & Heading) */}
                  <td className="border border-slate-200 p-3">
                    <select
                      value={sec.type}
                      onChange={(e) => changeSectionType(sec.id, e.target.value as SectionType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    >
                      <option value="text">Text</option>
                      <option value="heading">Heading</option>
                      <option value="code">Code</option>
                    </select>
                  </td>

                  {/* Language / Level Column */}
                  <td className="border border-slate-200 p-3">
                    {sec.type === "code" ? (
                      <input
                        type="text"
                        value={sec.language}
                        onChange={(e) => updateSectionFields(sec.id, { language: e.target.value })}
                        placeholder="e.g. javascript"
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      />
                    ) : sec.type === "heading" ? (
                      <select
                        value={sec.level}
                        onChange={(e) => updateSectionFields(sec.id, { level: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      >
                        <option value="h1">H1 (Title)</option>
                        <option value="h2">H2 (Subtitle)</option>
                        <option value="h3">H3 (Subheader)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        placeholder="N/A"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs text-center"
                      />
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="border border-slate-200 p-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {/* Move Up / Down */}
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs disabled:opacity-30 transition-colors"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "down")}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs disabled:opacity-30 transition-colors"
                      >
                        ▼
                      </button>

                      {/* Add Row Button */}
                      <button
                        type="button"
                        onClick={() => addSectionRow(idx, "text")}
                        title="Add New Section Below"
                        className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>

                      {/* Delete Row Button */}
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSectionRow(sec.id)}
                          title="Delete Section"
                          className="p-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs transition-all shadow-xs"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
