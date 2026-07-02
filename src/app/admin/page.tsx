import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [{ count: productCount }, { count: orderCount }, { data: paidOrders }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("status", "paid"),
  ]);

  const revenue = paidOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">DASHBOARD</h1>

      <div className="grid grid-cols-3 gap-6 mb-16">
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Products</p>
          <p className="text-3xl font-semibold">{productCount ?? 0}</p>
        </div>
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Orders</p>
          <p className="text-3xl font-semibold">{orderCount ?? 0}</p>
        </div>
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Revenue (Paid)</p>
          <p className="text-3xl font-semibold">{formatRupiah(revenue)}</p>
        </div>
      </div>

      <h2 className="label-sm mb-6">Recent Orders</h2>
      <div className="divide-y divide-outline-variant">
        {recentOrders?.map((o) => (
          <div key={o.id} className="flex justify-between py-4 text-sm">
            <span>{o.order_number}</span>
            <span className="text-on-surface-variant">{o.status}</span>
            <span>{formatRupiah(o.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
