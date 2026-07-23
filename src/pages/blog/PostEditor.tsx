import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { postsApi, tagsApi, type TagResponse } from "../../lib/api";
import PostBannerUploader from "../../components/blog/PostBannerUploader";

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
  "assembly",
  "matlab",
  "groovy",
];

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
    <form onSubmit={handleSavePost} className="space-y-8 pb-20">
      {/* ── TOP GLASS NAV BAR ────────────────── */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all shadow-xs"
            title="Back to Blog List"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">
                {isEditing ? "Edit Blog Article" : "Create New Blog Article"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold font-mono">
                {isEditing ? `POST #${id}` : "DRAFT"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Build your article with custom text, heading levels, and syntax code sections.
            </p>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/80 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  status ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="sr-only"
            />
            <span className="text-xs font-semibold text-slate-800 select-none">
              {status ? "Published" : "Draft Mode"}
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-semibold text-sm hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-sky-200 flex items-center gap-2"
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
                <span>{isEditing ? "Update Article" : "Publish Article"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline hover:text-red-900">
            Dismiss
          </button>
        </div>
      )}

      {/* ── BANNER UPLOADER COMPONENT ────────────────── */}
      <PostBannerUploader
        postId={isEditing && id ? Number(id) : undefined}
        imageUrl={bannerUrl}
        onImageChange={setBannerUrl}
      />

      {/* ── POST METADATA CARD ────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span>📝</span> Article Information
          </h2>
          <span className="text-xs text-slate-500 font-medium">Basic fields & metadata</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Modern Dashboards with React 19 & Tailwind"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Short Summary / Excerpt
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief 1-2 sentence overview for post summary cards..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category / Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Est. Read Time (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={120}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                MIN
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-sky-500 text-slate-950 shadow-xs scale-105"
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
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION BUILDER CARD TABLE ────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">Article Content Sections</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                {sections.length} {sections.length === 1 ? "Section" : "Sections"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add rows to build your article structure using Text, Heading, or Code blocks.
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => addSectionRow(sections.length - 1, "text")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>📝</span> + Text
            </button>
            <button
              type="button"
              onClick={() => addSectionRow(sections.length - 1, "heading")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>🏷️</span> + Heading
            </button>
            <button
              type="button"
              onClick={() => addSectionRow(sections.length - 1, "code")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>⚡</span> + Code
            </button>
          </div>
        </div>

        {/* Section Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full border-collapse text-sm" id="sectionTable">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider text-center border-b border-slate-200">
              <tr>
                <th style={{ width: "55%" }} className="px-4 py-3.5 text-left font-bold text-slate-700">
                  Content Editor
                </th>
                <th style={{ width: "15%" }} className="px-3 py-3.5 font-bold text-slate-700">
                  Section Type
                </th>
                <th style={{ width: "15%" }} className="px-3 py-3.5 font-bold text-slate-700">
                  Language / Level
                </th>
                <th style={{ width: "15%" }} className="px-3 py-3.5 font-bold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sections.map((sec, idx) => (
                <tr key={sec.id} className="align-top hover:bg-sky-50/20 transition-colors group">
                  {/* Content Column */}
                  <td className="p-3.5 border-r border-slate-100">
                    {sec.type === "text" && (
                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Type section paragraph text..."
                        className="w-full p-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all leading-relaxed resize-y"
                      />
                    )}

                    {sec.type === "heading" && (
                      <input
                        type="text"
                        value={sec.content}
                        onChange={(e) => updateSectionFields(sec.id, { content: e.target.value })}
                        placeholder="Enter section heading title..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-950 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    )}

                    {sec.type === "code" && (
                      <textarea
                        rows={5}
                        value={sec.code}
                        onChange={(e) => updateSectionFields(sec.id, { code: e.target.value })}
                        placeholder="// Paste or write code snippet here..."
                        className="w-full p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-y leading-relaxed"
                      />
                    )}
                  </td>

                  {/* Type Dropdown Column */}
                  <td className="p-3.5 border-r border-slate-100">
                    <select
                      value={sec.type}
                      onChange={(e) => changeSectionType(sec.id, e.target.value as SectionType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    >
                      <option value="text">📝 Text</option>
                      <option value="heading">🏷️ Heading</option>
                      <option value="code">⚡ Code</option>
                    </select>
                  </td>

                  {/* Language / Level Column */}
                  <td className="p-3.5 border-r border-slate-100">
                    {sec.type === "code" ? (
                      <div className="space-y-1.5">
                        <select
                          value={
                            POPULAR_LANGUAGES.includes((sec.language || "").toLowerCase())
                              ? (sec.language || "").toLowerCase()
                              : "custom"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== "custom") {
                              updateSectionFields(sec.id, { language: val });
                            } else {
                              updateSectionFields(sec.id, { language: "" });
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                        >
                          {POPULAR_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </option>
                          ))}
                          <option value="custom">Other / Custom...</option>
                        </select>
                        {!POPULAR_LANGUAGES.includes((sec.language || "").toLowerCase()) && (
                          <input
                            type="text"
                            value={sec.language}
                            onChange={(e) => updateSectionFields(sec.id, { language: e.target.value })}
                            placeholder="Type custom language..."
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-400"
                          />
                        )}
                      </div>
                    ) : sec.type === "heading" ? (
                      <select
                        value={sec.level}
                        onChange={(e) => updateSectionFields(sec.id, { level: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      >
                        <option value="h1">H1 (Main Title)</option>
                        <option value="h2">H2 (Subtitle)</option>
                        <option value="h3">H3 (Subheader)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        placeholder="N/A"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs text-center font-mono"
                      />
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="p-3.5 text-center align-middle">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {/* Move Up / Down */}
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs disabled:opacity-30 transition-all"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionRow(idx, "down")}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs disabled:opacity-30 transition-all"
                      >
                        ▼
                      </button>

                      {/* Add Row Button */}
                      <button
                        type="button"
                        onClick={() => addSectionRow(idx, "text")}
                        title="Insert Section Below"
                        className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
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
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all active:scale-95"
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

        {/* Append Section Footer Bar */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={() => addSectionRow(sections.length - 1, "text")}
            className="px-5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Article Section Row
          </button>
        </div>
      </div>
    </form>
  );
}
