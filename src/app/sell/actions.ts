"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function applyAsSeller(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell");

  const storeName = String(formData.get("store_name"));
  const phone = String(formData.get("phone"));
  const description = String(formData.get("description") || "");

  const { error } = await supabase.from("sellers").insert({
    id: user.id,
    store_name: storeName,
    store_slug: `${slugify(storeName)}-${user.id.slice(0, 6)}`,
    phone,
    description,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  // Mark the profile as a (pending) seller so the UI can route them correctly
  await supabase.from("profiles").update({ role: "seller" }).eq("id", user.id);

  revalidatePath("/sell");
  revalidatePath("/", "layout");
}