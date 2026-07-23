import { useState, useEffect } from "react";
import { pagesApi, type PageResponse } from "../../lib/api";
import RichTextEditor from "../../components/editor/RichTextEditor";

// ── Types ─────────────────────────────────────────────────
type PageType = PageResponse["type"];

const PAGE_TYPES: PageType[] = [
  "ABOUT",
  "CONTACT",
  "PRIVACY_POLICY",
  "TERMS_AND_CONDITIONS",
];

const PAGE_META: Record<PageType, { label: string; desc: string; icon: React.ReactNode }> = {
  ABOUT: {
    label: "About",
    desc: "Who we are and what we do",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CONTACT: {
    label: "Contact",
    desc: "Get in touch with us",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  PRIVACY_POLICY: {
    label: "Privacy Policy",
    desc: "How we handle your data",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  TERMS_AND_CONDITIONS: {
    label: "Terms & Conditions",
    desc: "Rules governing the use of our service",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
};

// ── Editor Panel ──────────────────────────────────────────
function EditorPanel({
  page,
  type,
  onSaved,
  onClose,
}: {
  page?: PageResponse;
  type: PageType;
  onSaved: (saved: PageResponse) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(page?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const meta = PAGE_META[type];

  async function handleSave() {
    if (!content.trim()) { setMsg({ kind: "error", text: "Content cannot be empty." }); return; }
    setSaving(true);
    setMsg(null);
    try {
      let saved: PageResponse;
      if (page) {
        saved = await pagesApi.update(page.id, type, content);
      } else {
        saved = await pagesApi.create(type, content);
      }
      setMsg({ kind: "success", text: "Page saved successfully!" });
      onSaved(saved);
    } catch (e: unknown) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Failed to save page" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center shadow-lg">
            {meta.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{meta.label}</h2>
            <p className="text-xs text-white/60">{meta.desc}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Close editor"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Status message */}
      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            msg.kind === "success"
              ? "bg-white/10 text-white border border-white/20 text-white"
              : "bg-white/10 border border-white/20 text-white"
          }`}
        >
          {msg.kind === "success" ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {msg.text}
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="flex-1 mb-5">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder={`Write your ${meta.label} page content here…\n\nUse the toolbar above to format text with headings, bold, lists, links and more.`}
          minHeight={400}
        />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-xs text-white/40">
          {page
            ? `Last updated: ${new Date(page.updatedAt).toLocaleString()}`
            : "This page has not been created yet."}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-black/20 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Saving…" : page ? "Update Page" : "Create Page"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Pages Page ───────────────────────────────────────
export default function Pages() {
  const [pages, setPages] = useState<PageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<PageType | null>(null);

  async function loadPages() {
    setLoading(true);
    try {
      const data = await pagesApi.list();
      setPages(data);
    } catch {
      // API may not be running yet
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPages(); }, []);

  function getPage(type: PageType) {
    return pages.find((p) => p.type === type);
  }

  function handleSaved(saved: PageResponse) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.type === saved.type);
      return idx >= 0 ? prev.map((p) => (p.type === saved.type ? saved : p)) : [...prev, saved];
    });
  }

  const activePage = activeType ? getPage(activeType) : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Pages</h1>
        <p className="text-white/60 mt-1">
          Manage static content pages for your website.
        </p>
      </div>

      {!activeType ? (
        /* ── Page cards grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAGE_TYPES.map((type) => {
            const meta = PAGE_META[type];
            const page = getPage(type);
            return (
              <div
                key={type}
                className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all overflow-hidden cursor-pointer"
                onClick={() => setActiveType(type)}
              >
                {/* Accent bar */}
                <div className="h-1 bg-white" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-white text-black flex items-center justify-center shadow-lg">
                      {meta.icon}
                    </div>
                    {/* Status */}
                    {loading ? (
                      <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
                    ) : page ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20">
                        ✓ Published
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/20">
                        Not created
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-white/60">{meta.desc}</p>

                  {/* Preview snippet */}
                  {page && (
                    <div
                      className="mt-4 text-xs text-white/40 line-clamp-2 leading-relaxed"
                      // Strip HTML tags for plain text preview
                      dangerouslySetInnerHTML={{
                        __html: page.content
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .slice(0, 120) + "…",
                      }}
                    />
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                    {page ? (
                      <span className="text-xs text-white/40">
                        Updated {new Date(page.updatedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">No content yet</span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm text-white/80 font-medium group-hover:text-white transition-colors">
                      {page ? "Edit" : "Create"}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Editor view ── */
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <EditorPanel
            type={activeType}
            page={activePage}
            onSaved={handleSaved}
            onClose={() => setActiveType(null)}
          />
        </div>
      )}
    </div>
  );
}
