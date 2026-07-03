import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";

export default async function SellerOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, orders:order_id(order_number, status, created_at)")
    .eq("seller_id", user!.id)
    .order("id", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">MY SALES</h1>

      <div className="divide-y divide-outline-variant">
        {items?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center py-4 text-sm">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-on-surface-variant">
                {item.orders?.order_number} · {item.orders?.status} · ×{item.quantity}
              </p>
            </div>
            <span className="font-semibold">{formatRupiah(item.line_total)}</span>
          </div>
        ))}
      </div>
      {(!items || items.length === 0) && <p className="text-on-surface-variant">Belum ada penjualan.</p>}
    </div>
  );
}