"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addToCart(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const productId = String(formData.get("product_id"));
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!user) {
    redirect(`/login?next=/products/${formData.get("slug") ?? ""}`);
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateCartItem(formData: FormData) {
  const supabase = createClient();
  const itemId = String(formData.get("item_id"));
  const quantity = Number(formData.get("quantity"));

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  const supabase = createClient();
  const itemId = String(formData.get("item_id"));
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
