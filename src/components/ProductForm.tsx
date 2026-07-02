"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MediaUploader from "./MediaUploader";

type Category = { id: string; name: string };

type Props = {
  action: (formData: FormData) => void;
  product?: any;
};

export default function ProductForm({ action, product }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.product_images?.map((i: any) => i.url) ?? []
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(
    product?.video_url ?? null
  );

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Hapus image_url lama, ganti dengan hasil upload
    formData.delete("image_url");
    imageUrls.forEach((url, i) => formData.append(`image_url_${i}`, url));
    formData.set("image_count", String(imageUrls.length));
    if (videoUrl) formData.set("video_url", videoUrl);

    action(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {/* Media Upload */}
      <div>
        <label className="label-sm text-on-surface-variant block mb-4">
          Foto & Video Produk
        </label>
        <MediaUploader
          existingImages={imageUrls}
          existingVideo={videoUrl}
          onImagesChange={setImageUrls}
          onVideoChange={setVideoUrl}
        />
        {imageUrls.length === 0 && (
          <p className="text-xs text-on-surface-variant mt-2">
            * Minimal 1 foto produk wajib diunggah
          </p>
        )}
      </div>

      {/* Nama */}
      <div>
        <label className="label-sm text-on-surface-variant block mb-2">
          Nama Produk <span className="text-error">*</span>
        </label>
        <input name="name" required defaultValue={product?.name} className="input-line" />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="label-sm text-on-surface-variant block mb-2">Deskripsi</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          placeholder="Ceritakan detail produk Anda..."
          className="input-line resize-none"
        />
      </div>

      {/* Harga & Stok */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">
            Harga (IDR) <span className="text-error">*</span>
          </label>
          <input
            type="number"
            name="price"
            required
            min={0}
            defaultValue={product?.price}
            placeholder="150000"
            className="input-line"
          />
        </div>
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">
            Stok <span className="text-error">*</span>
          </label>
          <input
            type="number"
            name="stock"
            required
            min={0}
            defaultValue={product?.stock ?? 0}
            className="input-line"
          />
        </div>
      </div>

      {/* Brand & Kategori */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">Brand</label>
          <input name="brand" defaultValue={product?.brand} className="input-line" />
        </div>
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">Kategori</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="border border-outline-variant px-4 py-3 text-sm bg-white w-full"
          >
            <option value="">— Pilih Kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-8">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.is_featured}
            className="w-4 h-4 accent-primary"
          />
          Tampilkan sebagai Featured
        </label>
        {product && (
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
              className="w-4 h-4 accent-primary"
            />
            Produk Aktif (terlihat di katalog)
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={imageUrls.length === 0}
        className="btn-primary mt-2"
      >
        {product ? "Simpan Perubahan" : "Tambah Produk"}
      </button>
    </form>
  );
}