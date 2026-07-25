import { useState } from "react";
import { postsApi } from "../../lib/api";
import ImageUploader from "../ui/ImageUploader";

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
  const [urlInput, setUrlInput] = useState(imageUrl ?? "");
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File, onProgress: (pct: number) => void) => {
    // Local preview URL as fallback
    const localUrl = URL.createObjectURL(file);
    // If post ID exists, upload to server directly
    if (postId) {
      setError(null);
      try {
        onProgress(30);
        const updated = await postsApi.uploadImage(postId, file);
        onProgress(100);
        return updated.image ?? localUrl;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload banner image.";
        setError(msg);
        throw err;
      }
    }
    onProgress(100);
    return localUrl;
  };

  const handleRemoveImage = async () => {
    onImageChange(undefined);
    setUrlInput("");
    if (postId) {
      try {
        await postsApi.deleteImage(postId);
      } catch {/* ignore */}
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setShowUrlField(false);
    }
  };

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

      {/* Global ImageUploader Component */}
      <ImageUploader
        value={imageUrl}
        onChange={onImageChange}
        onUpload={handleUpload}
        heightClass="h-48 sm:h-64"
      />
    </div>
  );
}
