import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/stripe";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [
    { count: productCount },
    { count: orderCount },
    { count: sellerPendingCount },
    { data: paidOrders },
    { data: pendingWithdrawals },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total").eq("status", "paid"),
    supabase.from("withdrawals").select("amount").eq("status", "pending"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const revenue = paidOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const pendingWithdrawalTotal = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">DASHBOARD</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="border border-outline-variant p-5">
          <p className="label-sm text-on-surface-variant mb-2">Produk</p>
          <p className="text-3xl font-semibold">{productCount ?? 0}</p>
        </div>
        <div className="border border-outline-variant p-5">
          <p className="label-sm text-on-surface-variant mb-2">Total Order</p>
          <p className="text-3xl font-semibold">{orderCount ?? 0}</p>
        </div>
        <div className="border border-outline-variant p-5">
          <p className="label-sm text-on-surface-variant mb-2">Revenue (Paid)</p>
          <p className="text-xl font-semibold">{formatRupiah(revenue)}</p>
        </div>
        <div className="border border-outline-variant p-5">
          <p className="label-sm text-on-surface-variant mb-2">Platform Fee (5%)</p>
          <p className="text-xl font-semibold">{formatRupiah(revenue * 0.05)}</p>
        </div>
      </div>

      {/* Alert jika ada yang perlu ditindak */}
      {((sellerPendingCount ?? 0) > 0 || (pendingWithdrawals?.length ?? 0) > 0) && (
        <div className="space-y-3 mb-12">
          <p className="label-sm text-on-surface-variant">Perlu Perhatian</p>
          {(sellerPendingCount ?? 0) > 0 && (
            <Link href="/admin/sellers" className="flex justify-between items-center border border-gold p-4 hover:bg-surface-container-low transition-colors">
              <span className="text-sm font-medium">
                {sellerPendingCount} seller menunggu approval
              </span>
              <span className="label-sm text-gold">Review →</span>
            </Link>
          )}
          {(pendingWithdrawals?.length ?? 0) > 0 && (
            <Link href="/admin/withdrawals" className="flex justify-between items-center border border-gold p-4 hover:bg-surface-container-low transition-colors">
              <span className="text-sm font-medium">
                {pendingWithdrawals?.length} request withdraw · {formatRupiah(pendingWithdrawalTotal)}
              </span>
              <span className="label-sm text-gold">Proses →</span>
            </Link>
          )}
        </div>
      )}

      <h2 className="label-sm text-on-surface-variant mb-4">Order Terbaru</h2>
      <div className="divide-y divide-outline-variant">
        {recentOrders?.map((o) => (
          <div key={o.id} className="flex justify-between py-4 text-sm">
            <span className="font-medium">{o.order_number}</span>
            <span className="text-on-surface-variant">{o.status}</span>
            <span>{formatRupiah(o.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}