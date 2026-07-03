import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any;
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("midtrans_order_id", pi.id)
      .single();

    if (order) {
      await admin.from("orders").update({
        status: "paid",
        payment_type: pi.payment_method_types?.[0] ?? "card",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", order.id);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as any;
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("midtrans_order_id", pi.id)
      .single();

    if (order) {
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
            await admin.from("products")
              .update({ stock: product.stock + item.quantity })
              .eq("id", item.product_id);
          }
        }
      }

      await admin.from("orders").update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }).eq("id", order.id);
    }
  }

  return NextResponse.json({ received: true });
}