import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { applyAsSeller } from "./actions";

export default async function SellPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/sell");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: seller } = await supabase.from("sellers").select("*").eq("id", user.id).maybeSingle();

  if (profile?.role === "admin") {
    return (
      <div className="px-5 max-w-xl mx-auto py-32 text-center">
        <p className="text-on-surface-variant">Akun admin tidak perlu mendaftar sebagai seller.</p>
      </div>
    );
  }

  if (seller) {
    return (
      <div className="px-5 max-w-xl mx-auto py-32 text-center">
        <h1 className="font-display text-2xl font-semibold mb-4">{seller.store_name}</h1>
        {seller.status === "pending" && (
          <p className="text-on-surface-variant">
            Pendaftaran toko Anda sedang ditinjau oleh tim kami. Kami akan memberi tahu setelah disetujui.
          </p>
        )}
        {seller.status === "approved" && (
          <>
            <p className="text-on-surface-variant mb-6">Toko Anda sudah aktif.</p>
            <a href="/seller" className="btn-primary">
              Buka Seller Dashboard
            </a>
          </>
        )}
        {seller.status === "rejected" && (
          <p className="text-error">
            Pendaftaran ditolak. {seller.rejection_reason || "Silakan hubungi support untuk informasi lebih lanjut."}
          </p>
        )}
        {seller.status === "suspended" && (
          <p className="text-error">Toko Anda saat ini ditangguhkan. Hubungi support untuk informasi lebih lanjut.</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 max-w-xl mx-auto py-32">
      <h1 className="font-display text-3xl font-semibold mb-4 tracking-tightest">JUAL DI KEMUT.STORE</h1>
      <p className="text-on-surface-variant mb-10">
        Daftarkan toko Anda. Tim kami akan meninjau pendaftaran sebelum toko Anda aktif berjualan.
      </p>
      <form action={applyAsSeller} className="flex flex-col gap-6">
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">Nama Toko</label>
          <input name="store_name" required className="input-line" />
        </div>
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">Nomor Telepon</label>
          <input name="phone" required className="input-line" />
        </div>
        <div>
          <label className="label-sm text-on-surface-variant block mb-2">Deskripsi Toko</label>
          <textarea name="description" rows={4} placeholder="Ceritakan tentang toko Anda..." className="input-line" />
        </div>
        <button type="submit" className="btn-primary mt-4">
          Ajukan Pendaftaran
        </button>
      </form>
    </div>
  );
}