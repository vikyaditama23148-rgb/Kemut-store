import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";

const statusLabel: Record<string, string> = {
  pending_payment: "Waiting for Payment",
  paid: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", searchParams.order)
    .single();

  if (!order) {
    return (
      <div className="px-5 max-w-2xl mx-auto py-32 text-center">
        <p className="text-on-surface-variant">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-2xl mx-auto py-32 text-center">
      <span className="material-symbols-outlined text-gold !text-6xl mb-6">check_circle</span>
      <h1 className="font-display text-3xl font-semibold mb-3 tracking-tightest">
        Thank You For Your Order
      </h1>
      <p className="text-on-surface-variant mb-2">Order {order.order_number}</p>
      <p className="label-sm text-gold mb-10">{statusLabel[order.status] ?? order.status}</p>

      <div className="border border-outline-variant p-8 text-left mb-10">
        {order.order_items?.map((item: any) => (
          <div key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span>{formatRupiah(item.line_total)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 mt-4 border-t border-outline-variant font-semibold">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      <Link href="/search" className="btn-primary">
        Continue Shopping
      </Link>
    </div>
  );
}
