import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";

const statusLabel: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-5 md:px-16 max-w-3xl mx-auto py-20">
      <h1 className="font-display text-3xl font-semibold mb-12 tracking-tightest">ORDER HISTORY</h1>

      {(!orders || orders.length === 0) && (
        <p className="text-on-surface-variant">You haven't placed any orders yet.</p>
      )}

      <div className="flex flex-col gap-6">
        {orders?.map((order) => (
          <div key={order.id} className="border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium">{order.order_number}</p>
                <p className="text-sm text-on-surface-variant">
                  {new Date(order.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="label-sm px-3 py-1 bg-surface-container-low">
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>
            <div className="text-sm text-on-surface-variant mb-3">
              {order.order_items?.length} item(s)
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold">{formatRupiah(order.total)}</p>
              <Link href={`/checkout/success?order=${order.order_number}`} className="label-sm hover:text-gold">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
