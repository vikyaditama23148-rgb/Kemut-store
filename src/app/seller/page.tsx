import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";

export default async function SellerOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: seller } = await supabase.from("sellers").select("*").eq("id", user!.id).single();

  const [{ count: productCount }, { data: items }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user!.id),
    supabase.from("order_items").select("line_total, quantity").eq("seller_id", user!.id),
  ]);

  const revenue = items?.reduce((sum, i) => sum + Number(i.line_total), 0) ?? 0;
  const unitsSold = items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-2 tracking-tightest">{seller?.store_name}</h1>
      <p className="text-on-surface-variant mb-10">Seller Dashboard</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">My Products</p>
          <p className="text-3xl font-semibold">{productCount ?? 0}</p>
        </div>
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Units Sold</p>
          <p className="text-3xl font-semibold">{unitsSold}</p>
        </div>
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Total Revenue</p>
          <p className="text-3xl font-semibold">{formatRupiah(revenue)}</p>
        </div>
      </div>
    </div>
  );
}