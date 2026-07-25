import React, { useState, useRef, useCallback } from "react";

export interface ImageUploaderProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onUpload?: (file: File, onProgress: (percent: number) => void) => Promise<string>;
  disabled?: boolean;
  className?: string;
  heightClass?: string;
}

export default function ImageUploader({
  value,
  onChange,
  onUpload,
  disabled = false,
  className = "",
  heightClass = "h-48 sm:h-56",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | undefined>(value);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value updates
  React.useEffect(() => {
    setPreview(value);
  }, [value]);

  // Handle file processing & simulated/actual progress
  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG, WebP, GIF).");
        return;
      }

      // Local preview URL
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      setIsUploading(true);
      setProgress(0);

      try {
        if (onUpload) {
          // Custom uploader callback with progress callback
          const uploadedUrl = await onUpload(file, (pct) => {
            setProgress(Math.min(100, Math.max(0, Math.round(pct))));
          });
          setPreview(uploadedUrl);
          onChange?.(uploadedUrl);
        } else {
          // Default simulated progress for smooth UI feedback
          for (let p = 0; p <= 100; p += 10) {
            setProgress(p);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          onChange?.(localUrl);
        }
      } catch (err: unknown) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload]
  );

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(undefined);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`relative w-full ${heightClass} rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center border-2 ${
          isDragging
            ? "border-sky-500 bg-sky-500/10 scale-[1.01]"
            : preview
            ? "border-slate-200 bg-slate-900"
            : "border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/40"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {/* State 1: Image Preview */}
        {preview && !isUploading && (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover Actions Bar */}
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-md hover:bg-slate-100 transition-all active:scale-95"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-600 transition-all active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* State 2: Upload Progress Overlay (Centered percentage) */}
        {isUploading && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <div className="relative flex items-center justify-center">
              {/* Circular Progress SVG */}
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-400 transition-all duration-150 ease-out"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Percentage Number in Middle */}
              <span className="absolute text-lg font-black text-white font-mono">
                {progress}%
              </span>
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Uploading...
            </p>
          </div>
        )}

        {/* State 3: Clean Empty Dropzone (No Image, Not Uploading) */}
        {!preview && !isUploading && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                isDragging ? "bg-sky-500 text-white" : "bg-sky-500 text-slate-950 shadow-sm"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-950">
              {isDragging ? "Drop image here" : "Drag & drop image or browse"}
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
