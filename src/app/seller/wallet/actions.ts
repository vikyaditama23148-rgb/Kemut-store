"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireApprovedSeller() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/seller/wallet");
  const { data: seller } = await supabase.from("sellers").select("*").eq("id", user.id).single();
  if (!seller || seller.status !== "approved") redirect("/sell");
  return { supabase, user, seller };
}

export async function saveBankInfo(formData: FormData) {
  const { supabase, user } = await requireApprovedSeller();

  await supabase.from("sellers").update({
    bank_name: String(formData.get("bank_name")),
    bank_account_number: String(formData.get("bank_account_number")),
    bank_account_name: String(formData.get("bank_account_name")),
  }).eq("id", user.id);

  revalidatePath("/seller/wallet");
}

export async function requestWithdrawal(formData: FormData) {
  const { supabase, user, seller } = await requireApprovedSeller();

  const amount = Number(formData.get("amount"));

  if (amount < 50000) throw new Error("Minimum penarikan Rp 50.000");
  if (amount > seller.balance) throw new Error("Saldo tidak mencukupi");

  // Cek tidak ada withdrawal pending
  const { data: existing } = await supabase
    .from("withdrawals")
    .select("id")
    .eq("seller_id", user.id)
    .in("status", ["pending", "processing"])
    .maybeSingle();

  if (existing) throw new Error("Masih ada request penarikan yang diproses");

  // Kurangi saldo
  await supabase.from("sellers")
    .update({ balance: seller.balance - amount })
    .eq("id", user.id);

  // Buat withdrawal request
  await supabase.from("withdrawals").insert({
    seller_id: user.id,
    amount,
    bank_name: String(formData.get("bank_name")),
    bank_account_number: String(formData.get("bank_account_number")),
    bank_account_name: String(formData.get("bank_account_name")),
    status: "pending",
  });

  revalidatePath("/seller/wallet");
}