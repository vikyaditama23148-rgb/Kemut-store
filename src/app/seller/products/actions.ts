"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractMediaFromFormData(formData: FormData) {
  const imageCount = Number(formData.get("image_count") ?? 0);
  const imageUrls: string[] = [];
  for (let i = 0; i < imageCount; i++) {
    const url = formData.get(`image_url_${i}`);
    if (url) imageUrls.push(String(url));
  }
  const videoUrl = formData.get("video_url") ? String(formData.get("video_url")) : null;
  return { imageUrls, videoUrl };
}

async function requireApprovedSeller() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/seller");
  const { data: seller } = await supabase.from("sellers").select("*").eq("id", user.id).single();
  if (!seller || seller.status !== "approved") redirect("/sell");
  return { supabase, user, seller };
}

export async function createSellerProduct(formData: FormData) {
  const { supabase, user } = await requireApprovedSeller();
  const { imageUrls, videoUrl } = extractMediaFromFormData(formData);

  const name = String(formData.get("name"));
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      description: String(formData.get("description") || ""),
      category_id: String(formData.get("category_id") || "") || null,
      seller_id: user.id,
      brand: String(formData.get("brand") || ""),
      is_featured: formData.get("is_featured") === "on",
      video_url: videoUrl,
    })
    .select()
    .single();

  if (error || !product) throw new Error(error?.message ?? "Failed to create product");

  if (imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, i) => ({ product_id: product.id, url, position: i }))
    );
  }

  revalidatePath("/seller/products");
  revalidatePath("/");
  redirect("/seller/products");
}

export async function updateSellerProduct(formData: FormData) {
  const { supabase, user } = await requireApprovedSeller();
  const id = String(formData.get("id"));
  const { imageUrls, videoUrl } = extractMediaFromFormData(formData);

  const { data: existing } = await supabase.from("products").select("seller_id").eq("id", id).single();
  if (existing?.seller_id !== user.id) redirect("/seller/products");

  await supabase.from("products").update({
    name: String(formData.get("name")),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    description: String(formData.get("description") || ""),
    category_id: String(formData.get("category_id") || "") || null,
    brand: String(formData.get("brand") || ""),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    video_url: videoUrl,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (imageUrls.length > 0) {
    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("product_images").insert(
      imageUrls.map((url, i) => ({ product_id: id, url, position: i }))
    );
  }

  revalidatePath("/seller/products");
  revalidatePath("/");
  redirect("/seller/products");
}

export async function deleteSellerProduct(formData: FormData) {
  const { supabase, user } = await requireApprovedSeller();
  const id = String(formData.get("id"));
  const { data: existing } = await supabase.from("products").select("seller_id").eq("id", id).single();
  if (existing?.seller_id !== user.id) redirect("/seller/products");
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/seller/products");
}