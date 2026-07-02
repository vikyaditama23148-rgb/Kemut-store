"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type MediaFile = {
  url: string;
  type: "image" | "video";
  name: string;
};

type Props = {
  existingImages?: string[];
  existingVideo?: string | null;
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string | null) => void;
};

export default function MediaUploader({
  existingImages = [],
  existingVideo = null,
  onImagesChange,
  onVideoChange,
}: Props) {
  const [images, setImages] = useState<MediaFile[]>(
    existingImages.map((url) => ({ url, type: "image", name: url.split("/").pop() ?? "image" }))
  );
  const [video, setVideo] = useState<MediaFile | null>(
    existingVideo ? { url: existingVideo, type: "video", name: existingVideo.split("/").pop() ?? "video" } : null
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Path: userId/folder/timestamp-filename
    const path = `${user.id}/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("product-media")
      .upload(path, file, { upsert: false, cacheControl: "3600" });

    if (error) {
      console.error("Upload error:", error);
      setError(`Gagal upload ${file.name}: ${error.message}`);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("product-media")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    // Max 5 gambar
    if (images.length + imageFiles.length > 5) {
      setError("Maksimal 5 gambar per produk.");
      return;
    }

    setUploading(true);
    const newImages: MediaFile[] = [];

    for (const file of imageFiles) {
      setProgress((p) => ({ ...p, [file.name]: 0 }));
      const url = await uploadFile(file, "images");
      setProgress((p) => ({ ...p, [file.name]: 100 }));
      if (url) {
        newImages.push({ url, type: "image", name: file.name });
      }
    }

    const updated = [...images, ...newImages];
    setImages(updated);
    onImagesChange(updated.map((i) => i.url));
    setUploading(false);
    setProgress({});
  }, [images, onImagesChange]);

  const handleVideoFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("File harus berformat video (MP4, MOV, WebM).");
      return;
    }

    if (file.size > 52428800) {
      setError("Ukuran video maksimal 50MB.");
      return;
    }

    setUploading(true);
    setProgress({ [file.name]: 0 });
    const url = await uploadFile(file, "videos");
    setProgress({ [file.name]: 100 });

    if (url) {
      const newVideo = { url, type: "video" as const, name: file.name };
      setVideo(newVideo);
      onVideoChange(url);
    }
    setUploading(false);
    setProgress({});
  }, [onVideoChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const videoFile = Array.from(files).find((f) => f.type.startsWith("video/"));

    if (imageFiles.length > 0) handleImageFiles(imageFiles);
    if (videoFile) handleVideoFile(videoFile);
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated.map((i) => i.url));
  }

  function removeVideo() {
    setVideo(null);
    onVideoChange(null);
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded transition-colors p-8 text-center ${
          dragOver ? "border-gold bg-yellow-50" : "border-outline-variant"
        }`}
      >
        <span className="material-symbols-outlined !text-5xl text-outline-variant mb-3 block">
          cloud_upload
        </span>
        <p className="text-sm font-medium mb-1">
          Drag & drop gambar atau video ke sini
        </p>
        <p className="text-xs text-on-surface-variant mb-4">
          Gambar: JPG, PNG, WebP (maks. 5 foto) · Video: MP4, MOV, WebM (maks. 50MB)
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary text-xs px-6 py-3"
          >
            <span className="material-symbols-outlined !text-base mr-1">image</span>
            Pilih Foto
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading || !!video}
            className="btn-ghost text-xs px-6 py-3"
          >
            <span className="material-symbols-outlined !text-base mr-1">videocam</span>
            {video ? "Video sudah ada" : "Pilih Video"}
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
        />
      </div>

      {/* Upload progress */}
      {uploading && Object.keys(progress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progress).map(([name]) => (
            <div key={name} className="flex items-center gap-3 text-sm">
              <div className="flex-1 bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="h-full bg-gold animate-pulse rounded" style={{ width: "60%" }} />
              </div>
              <span className="text-on-surface-variant text-xs truncate max-w-[200px]">{name}</span>
              <span className="text-xs text-on-surface-variant">Uploading...</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div>
          <p className="label-sm text-on-surface-variant mb-3">
            Foto Produk ({images.length}/5)
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square bg-surface-container-low rounded overflow-hidden">
                <Image
                  src={img.url}
                  alt={`Foto ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary/70 text-white text-[10px] text-center py-1">
                    Utama
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {/* Add more slot */}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-outline-variant flex items-center justify-center rounded hover:border-gold transition-colors"
              >
                <span className="material-symbols-outlined text-outline-variant">add</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video preview */}
      {video && (
        <div>
          <p className="label-sm text-on-surface-variant mb-3">Video Produk</p>
          <div className="relative rounded overflow-hidden bg-black max-w-md">
            <video
              src={video.url}
              controls
              className="w-full max-h-64 object-contain"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">{video.name}</p>
        </div>
      )}
    </div>
  );
}