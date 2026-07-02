"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

export async function createProduct(formData: FormData) {
  const supabase = createClient();
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

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { imageUrls, videoUrl } = extractMediaFromFormData(formData);

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

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function approveSeller(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await supabase.from("sellers").update({
    status: "approved",
    approved_at: new Date().toISOString(),
    rejection_reason: null,
  }).eq("id", id);
  revalidatePath("/admin/sellers");
}

export async function rejectSeller(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") || "");
  await supabase.from("sellers").update({ status: "rejected", rejection_reason: reason }).eq("id", id);
  revalidatePath("/admin/sellers");
}

export async function suspendSeller(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await supabase.from("sellers").update({ status: "suspended" }).eq("id", id);
  revalidatePath("/admin/sellers");
}