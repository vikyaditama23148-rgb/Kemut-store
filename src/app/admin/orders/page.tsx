import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";
import { updateOrderStatus } from "../actions";

const statuses = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "expired",
];

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">ORDERS</h1>

      <div className="flex flex-col gap-6">
        {orders?.map((order) => (
          <div key={order.id} className="border border-outline-variant p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <p className="font-medium">{order.order_number}</p>
                <p className="text-sm text-on-surface-variant">
                  {order.shipping_snapshot?.recipient_name} ·{" "}
                  {new Date(order.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <form action={updateOrderStatus} className="flex items-center gap-3">
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="border border-outline-variant px-3 py-2 text-sm bg-white"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="label-sm hover:text-gold">
                  Update
                </button>
              </form>
            </div>
            <div className="text-sm text-on-surface-variant mb-2">
              {order.order_items?.map((i: any) => `${i.product_name} ×${i.quantity}`).join(", ")}
            </div>
            <p className="font-semibold">{formatRupiah(order.total)}</p>
          </div>
        ))}
      </div>
      {(!orders || orders.length === 0) && <p className="text-on-surface-variant">No orders yet.</p>}
    </div>
  );
}
