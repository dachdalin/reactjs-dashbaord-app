import { useRef, useEffect, useCallback } from "react";

// ── Toolbar button helper ─────────────────────────────────
function ToolBtn({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      className={`p-1.5 rounded-lg text-sm transition-all ${
        active
          ? "bg-white text-black"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Separator ─────────────────────────────────────────────
function Sep() {
  return <div className="h-5 w-px bg-white/10 mx-1" />;
}

// ── execCommand wrapper ───────────────────────────────────
function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

// ── Props ─────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ── Component ─────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here…",
  minHeight = 320,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value → editor (only on first mount / external reset)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Only set if the innerHTML differs and we're not mid-user edit
    if (el.innerHTML !== value) {
      isInternalUpdate.current = true;
      el.innerHTML = value;
      isInternalUpdate.current = false;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (isInternalUpdate.current) return;
    onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  // Heading helper
  function formatBlock(tag: string) {
    exec("formatBlock", tag);
    editorRef.current?.focus();
  }

  // Link
  function insertLink() {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
    editorRef.current?.focus();
  }

  // Colour
  function insertColor(color: string) {
    exec("foreColor", color);
    editorRef.current?.focus();
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20 transition-all">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-white/3">
        {/* History */}
        <ToolBtn title="Undo" onClick={() => exec("undo")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 010 16h-3m-7-8l-4 4 4 4" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => exec("redo")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 000 16h3m7-8l4 4-4 4" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn title="Heading 1" onClick={() => formatBlock("h1")}>
          <span className="font-bold text-xs">H1</span>
        </ToolBtn>
        <ToolBtn title="Heading 2" onClick={() => formatBlock("h2")}>
          <span className="font-bold text-xs">H2</span>
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => formatBlock("h3")}>
          <span className="font-bold text-xs">H3</span>
        </ToolBtn>
        <ToolBtn title="Paragraph" onClick={() => formatBlock("p")}>
          <span className="text-xs">P</span>
        </ToolBtn>

        <Sep />

        {/* Formatting */}
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h8a4 4 0 010 8H6V4zM6 12h9a4 4 0 010 8H6v-8z" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.5 4h1L9.5 20h-1l3-16zm2 0h5v2h-5V4zm-7 14h5v2H6.5v-2z" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 21h14v-2H5v2zM12 17a6 6 0 006-6V3h-2.5v8a3.5 3.5 0 01-7 0V3H6v8a6 6 0 006 6z" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 12h18v-2H3v2zm7-8v4h4V4h-4zm0 12h4v4h-4v-4z" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn title="Bullet List" onClick={() => exec("insertUnorderedList")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Numbered List" onClick={() => exec("insertOrderedList")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M8 6V4m0 16v-2" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn title="Align Left" onClick={() => exec("justifyLeft")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Align Center" onClick={() => exec("justifyCenter")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Align Right" onClick={() => exec("justifyRight")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Indent */}
        <ToolBtn title="Indent" onClick={() => exec("indent")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12l5 3-5 3V12zm8 0h10M11 18h10" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Outdent" onClick={() => exec("outdent")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12l-5 3 5 3V12zm3 0h10M12 18h10" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn title="Insert Link" onClick={insertLink}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Remove Link" onClick={() => exec("unlink")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </ToolBtn>

        <Sep />

        {/* Text colors */}
        {["#ffffff", "#000000"].map((c) => (
          <button
            key={c}
            type="button"
            title={`Color ${c}`}
            onMouseDown={(e) => { e.preventDefault(); insertColor(c); }}
            className="w-5 h-5 rounded-full border-2 border-white/20 hover:border-white/60 transition-colors shrink-0"
            style={{ background: c }}
          />
        ))}

        <Sep />

        {/* Clear formatting */}
        <ToolBtn title="Clear Formatting" onClick={() => exec("removeFormat")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ToolBtn>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        id="rich-text-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={`
          rich-editor
          px-6 py-5 text-white/90 text-sm leading-relaxed outline-none
          focus:outline-none
        `}
      />

      {/* Inline styles for editor typography */}
      <style>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
        .rich-editor h1 { font-size: 1.875rem; font-weight: 700; margin: 0.75rem 0; color: #f9fafb; }
        .rich-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 0.6rem 0; color: #f3f4f6; }
        .rich-editor h3 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; color: #e5e7eb; }
        .rich-editor p  { margin: 0.4rem 0; }
        .rich-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .rich-editor li { margin: 0.2rem 0; }
        .rich-editor a  { color: #ffffff; text-decoration: underline; }
        .rich-editor blockquote { border-left: 3px solid #ffffff; padding-left: 1rem; color: #9ca3af; margin: 0.5rem 0; }
        .rich-editor strong { font-weight: 700; }
        .rich-editor em { font-style: italic; }
        .rich-editor u  { text-decoration: underline; }
        .rich-editor s  { text-decoration: line-through; }
      `}</style>
    </div>
  );
}
