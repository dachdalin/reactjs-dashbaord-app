import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../hook/useToast";
import { postsApi, tagsApi, type TagResponse } from "../../lib/api";
import PostBannerUploader from "../../components/blog/PostBannerUploader";
import { usePageTitle } from "../../hook/usePageTitle";

const POST_TYPES = ["ARTICLE", "NEWS", "TUTORIAL", "CODE"] as const;

const POPULAR_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "sql",
  "json",
  "bash",
  "shell",
  "java",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "dart",
  "yaml",
  "markdown",
  "xml",
  "dockerfile",
  "graphql",
  "scala",
  "r",
  "lua",
  "elixir",
  "powershell",
];

// ── Section Types ─────────────────────────────────────────
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
  usePageTitle(isEditing ? 'Edit Article' : 'Create Article')
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  // Metadata State
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [type, setType] = useState<string>("ARTICLE");
  const [status, setStatus] = useState(false);
  const [duration, setDuration] = useState<number>(5);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [allTags, setAllTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagTitle, setNewTagTitle] = useState("");

  // Content Sections State
  const [sections, setSections] = useState<ContentSection[]>([
    { id: generateId(), type: "text", content: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Post if editing
  useEffect(() => {
    tagsApi.list().then(setAllTags).catch(() => {
      toastWarning("Tags unavailable", "Failed to load tags. Please refresh.");
    });

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
          toastError("Failed to load post", err instanceof Error ? err.message : undefined);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, toastError, toastWarning]);

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
        if (newType === "text") return { id: sec.id, type: "text", content: "" };
        if (newType === "heading") return { id: sec.id, type: "heading", content: "", level: "h2" };
        return { id: sec.id, type: "code", language: "javascript", code: "" };
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
      toastSuccess("Tag Created", `Tag #${tag.title} created successfully.`);
    } catch (e: unknown) {
      toastError("Failed to create tag", e instanceof Error ? e.message : undefined);
    }
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Article title is required.");
      toastError("Validation Error", "Article title is required.");
      return;
    }

    const compiledHtml = compileSectionsToHtml(sections);
    if (!compiledHtml.trim()) {
      setError("Please add content to your article sections.");
      toastError("Validation Error", "Please add content to your article sections.");
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
        toastSuccess("Post Updated", "The article has been updated successfully.");
      } else {
        await postsApi.create(payload);
        toastSuccess("Post Published", "The article has been published successfully.");
      }

      navigate("/admin/blogs");
    } catch (err: unknown) {
      toastError("Failed to save post", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  // Calculate quick stats
  const totalWords = sections.reduce((acc, sec) => {
    const txt = sec.type === "code" ? sec.code : sec.content;
    return acc + (txt ? txt.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse p-6">
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200" />
          <div className="h-96 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSavePost} className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── TOP STICKY BAR ────────────────── */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to Blog List"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950">
                {isEditing ? "Edit Article" : "Create Article"}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  status ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                }`}
              >
                {status ? "PUBLISHED" : "DRAFT"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Build your article blocks using text, headings, or code snippets.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-sm hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-sky-200 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isEditing ? "Update Post" : "Publish Post"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── MAIN 2-COLUMN EDITOR GRID ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN: Article Content & Block Builder (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Short Excerpt Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="Enter article title here..."
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 font-bold text-xl placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Summary / Excerpt
              </label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Write a short sentence summarizing this post for preview cards..."
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Banner Uploader Component */}
          <PostBannerUploader
            imageUrl={bannerUrl}
            onImageChange={setBannerUrl}
          />

          {/* Block Editor Builder Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Article Content Blocks</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compose your post structure by adding and reordering block cards.
                </p>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addSectionRow(sections.length - 1, "text")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>📝</span> + Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => addSectionRow(sections.length - 1, "heading")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>🏷️</span> + Heading
                </button>
                <button
                  type="button"
                  onClick={() => addSectionRow(sections.length - 1, "code")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>⚡</span> + Code
                </button>
              </div>
            </div>

            {/* Block Cards List */}
            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all p-4 shadow-xs group"
                >
                  {/* Block Header Bar */}
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </span>

                      {/* Type Switcher */}
                      <select
                        value={sec.type}
                        onChange={(e) => changeSectionType(sec.id, e.target.value as SectionType)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                      >
                        <option value="text">📝 Paragraph Text</option>
                        <option value="heading">🏷️ Heading</option>
                        <option value="code">⚡ Code Block</option>
                      </select>

                      {/* Secondary Options (Heading Level / Code Language) */}
                      {sec.type === "heading" && (
                        <select
                          value={sec.level}
                          onChange={(e) => updateSectionFields(sec.id, { level: e.target.value })}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                        >
                          <option value="h1">H1 (Main Heading)</option>
                          <option value="h2">H2 (Sub Heading)</option>
                          <option value="h3">H3 (Minor Title)</option>
                        </select>
                      )}

                      {sec.type === "code" && (
                        <select
                          value={
                            POPULAR_LANGUAGES.includes((sec.language || "").toLowerCase())
                              ? (sec.language || "").toLowerCase()
                              : "custom"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSectionFields(sec.id, { language: val !== "custom" ? val : "" });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono font-bold border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        >
                          {POPULAR_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </option>
                          ))}
                          <option value="custom">Other...</option>
                        </select>
                      )}
                    </div>

                    {/* Block Action Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs disabled:opacity-30 hover:bg-slate-100 transition-colors"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "down")}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs disabled:opacity-30 hover:bg-slate-100 transition-colors"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => addSectionRow(idx, "text")}
                        title="Add Block Below"
                        className="p-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-xs"
                      >
                        +
                      </button>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSectionRow(sec.id)}
                          title="Delete Block"
                          className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs hover:bg-rose-100 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Block Editor Content Body */}
                  <div>
                    {sec.type === "text" && (
                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Write paragraph content..."
                        className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 leading-relaxed resize-y"
                      />
                    )}

                    {sec.type === "heading" && (
                      <input
                        type="text"
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Enter section heading title..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      />
                    )}

                    {sec.type === "code" && (
                      <textarea
                        rows={5}
                        value={sec.code}
                        onChange={(e) => updateSectionFields(sec.id, { code: e.target.value })}
                        placeholder="// Paste code snippet here..."
                        className="w-full p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-y leading-relaxed"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Append Block Footer Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => addSectionRow(sections.length - 1, "text")}
                className="px-5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
              >
                <span>➕</span> Add New Block
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Article Settings & Metrics (1 col) ── */}
        <div className="space-y-6">
          {/* Status & Category Settings Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>⚙️</span> Publishing Settings
            </h3>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-950">Visibility Status</p>
                <p className="text-[11px] text-slate-500">
                  {status ? "Visible to public readers" : "Draft (hidden from public)"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {/* Category / Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              >
                {POST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Est Read Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Est. Read Time (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  MIN
                </span>
              </div>
            </div>
          </div>

          {/* Tags Selector Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🏷️</span> Article Tags
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-sky-500 text-slate-950 shadow-xs scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{tag.title}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                value={newTagTitle}
                onChange={(e) => setNewTagTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                placeholder="Create new tag..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Card */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-2">
              📊 Content Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xl font-extrabold text-slate-950">{sections.length}</p>
                <p className="text-[11px] font-semibold text-slate-500">Total Blocks</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xl font-extrabold text-slate-950">{totalWords}</p>
                <p className="text-[11px] font-semibold text-slate-500">Est. Words</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
