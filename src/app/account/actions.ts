"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function saveAddress(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const addressId = String(formData.get("address_id") || "");

  const payload = {
    user_id: user.id,
    recipient_name: String(formData.get("recipient_name")),
    phone: String(formData.get("phone")),
    line1: String(formData.get("line1")),
    city: String(formData.get("city")),
    province: String(formData.get("province")),
    postal_code: String(formData.get("postal_code")),
    is_default: true,
  };

  if (addressId) {
    await supabase.from("addresses").update(payload).eq("id", addressId);
  } else {
    await supabase.from("addresses").insert(payload);
  }

  revalidatePath("/account");
  revalidatePath("/checkout");
}
