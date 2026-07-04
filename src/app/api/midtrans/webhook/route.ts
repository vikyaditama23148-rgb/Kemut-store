import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Verifikasi signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const admin = createAdminClient();

    let newStatus: string | null = null;

    if (transaction_status === "capture") {
      newStatus = fraud_status === "accept" ? "paid" : "pending_payment";
    } else if (transaction_status === "settlement") {
      newStatus = "paid";
    } else if (transaction_status === "pending") {
      newStatus = "pending_payment";
    } else if (transaction_status === "deny" || transaction_status === "cancel") {
      newStatus = "cancelled";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    }

    if (newStatus) {
      const update: Record<string, unknown> = {
        status: newStatus,
        midtrans_transaction_id: body.transaction_id,
        payment_type,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "paid") update.paid_at = new Date().toISOString();

      const { data: order } = await admin
        .from("orders")
        .update(update)
        .eq("midtrans_order_id", order_id)
        .select()
        .single();

      // Kembalikan stok jika dibatalkan/expired
      if ((newStatus === "cancelled" || newStatus === "expired") && order) {
        const { data: items } = await admin
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        for (const item of items ?? []) {
          if (item.product_id) {
            const { data: product } = await admin
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .single();
            if (product) {
              await admin
                .from("products")
                .update({ stock: product.stock + item.quantity })
                .eq("id", item.product_id);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}