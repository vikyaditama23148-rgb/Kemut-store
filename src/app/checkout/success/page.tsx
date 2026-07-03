import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";

const statusLabel: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  paid: "Pembayaran Berhasil",
  processing: "Sedang Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

const statusColor: Record<string, string> = {
  pending_payment: "text-yellow-600",
  paid: "text-green-600",
  processing: "text-blue-600",
  shipped: "text-blue-600",
  completed: "text-green-600",
  cancelled: "text-red-600",
  expired: "text-red-600",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: {
    order?: string;
    payment_intent?: string;
    redirect_status?: string;
  };
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", searchParams.order)
    .single();

  if (!order) {
    return (
      <div className="px-5 max-w-2xl mx-auto py-32 text-center">
        <p className="text-on-surface-variant">Order tidak ditemukan.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isSuccess =
    order.status === "paid" ||
    searchParams.redirect_status === "succeeded";

  return (
    <div className="px-5 max-w-2xl mx-auto py-32 text-center">
      {/* Icon */}
      <span
        className={`material-symbols-outlined !text-6xl mb-6 block ${
          isSuccess ? "text-green-500" : "text-yellow-500"
        }`}
      >
        {isSuccess ? "check_circle" : "schedule"}
      </span>

      <h1 className="font-display text-3xl font-semibold mb-3 tracking-tightest">
        {isSuccess ? "Terima Kasih!" : "Pesanan Dibuat"}
      </h1>
      <p className="text-on-surface-variant mb-2">
        Nomor Pesanan: <span className="font-medium text-on-surface">{order.order_number}</span>
      </p>
      <p className={`label-sm mb-10 ${statusColor[order.status] ?? "text-on-surface-variant"}`}>
        {statusLabel[order.status] ?? order.status}
      </p>

      {/* Detail pesanan */}
      <div className="border border-outline-variant p-8 text-left mb-10">
        <p className="label-sm text-on-surface-variant mb-4">Rincian Pesanan</p>
        <div className="divide-y divide-outline-variant">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.product_name}{" "}
                <span className="text-on-surface-variant">×{item.quantity}</span>
              </span>
              <span className="font-medium">{formatRupiah(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4 mt-2 border-t border-outline-variant">
          <span className="text-sm text-on-surface-variant">Ongkos Kirim</span>
          <span className="text-sm">
            {order.shipping_fee === 0 ? "Gratis" : formatRupiah(order.shipping_fee)}
          </span>
        </div>
        <div className="flex justify-between pt-3 font-semibold text-lg">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/account/orders" className="btn-ghost">
          Lihat Semua Pesanan
        </Link>
        <Link href="/search" className="btn-primary">
          Lanjut Belanja
        </Link>
      </div>
    </div>
  );
}