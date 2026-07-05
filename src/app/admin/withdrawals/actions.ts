"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveWithdrawal(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  await supabase.from("withdrawals").update({
    status: "completed",
    processed_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/admin/withdrawals");
}

export async function rejectWithdrawal(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const sellerId = String(formData.get("seller_id"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") || "");

  // Tolak request
  await supabase.from("withdrawals").update({
    status: "rejected",
    admin_note: note,
    processed_at: new Date().toISOString(),
  }).eq("id", id);

  // Kembalikan saldo ke seller
  const { data: seller } = await supabase
    .from("sellers")
    .select("balance")
    .eq("id", sellerId)
    .single();

  if (seller) {
    await supabase.from("sellers")
      .update({ balance: seller.balance + amount })
      .eq("id", sellerId);
  }

  revalidatePath("/admin/withdrawals");
}