import { useState, useRef } from "react";
import { postsApi } from "../../lib/api";

interface PostBannerUploaderProps {
  postId?: number;
  imageUrl?: string;
  onImageChange: (url: string | undefined) => void;
}

export default function PostBannerUploader({
  postId,
  imageUrl,
  onImageChange,
}: PostBannerUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl ?? "");
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview URL
    const localUrl = URL.createObjectURL(file);
    onImageChange(localUrl);

    // If post ID exists, upload to API directly
    if (postId) {
      setUploading(true);
      setError(null);
      try {
        const updated = await postsApi.uploadImage(postId, file);
        onImageChange(updated.image);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to upload banner image.");
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleRemoveImage() {
    onImageChange(undefined);
    setUrlInput("");
    if (postId) {
      try {
        await postsApi.deleteImage(postId);
      } catch {/* ignore */}
    }
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setShowUrlField(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <span>🖼️</span> Post Banner / Cover Image
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add a header banner image to make your article stand out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlField(!showUrlField)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {showUrlField ? "Hide URL Input" : "Paste Image URL"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Remove Banner
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {showUrlField && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/banner.jpg"
            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-medium hover:bg-sky-400 transition-colors shadow-sm"
          >
            Apply URL
          </button>
        </form>
      )}

      {/* Banner Preview / Upload Area */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative group h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <img src={imageUrl} alt="Post Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-lg hover:bg-slate-100 transition-all"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-700 transition-all"
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-xs font-semibold">
              Uploading Banner...
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer p-6 group"
        >
          <div className="h-12 w-12 rounded-full bg-white border border-slate-200 group-hover:border-sky-300 flex items-center justify-center text-xl text-slate-500 mb-2 shadow-xs">
            📤
          </div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">
            Click to upload Banner Image
          </p>
          <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or WebP (Recommended 1200×630px)</p>
        </div>
      )}
    </div>
  );
}
