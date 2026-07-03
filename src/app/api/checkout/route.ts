import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId } = await req.json();

  // Ambil alamat
  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 400 });
  }

  // Ambil cart items
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*, seller_id)")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }

  // Validasi stok server-side
  for (const item of cartItems) {
    if (!item.products || item.products.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi untuk ${item.products?.name ?? "produk"}` },
        { status: 400 }
      );
    }
  }

  // Hitung total (SELALU di server, tidak percaya client)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.products!.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 1_000_000 ? 0 : 50_000;
  const total = subtotal + shippingFee;

  const admin = createAdminClient();
  const orderNumber = `KMT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

  // Buat order di database
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: address.id,
      shipping_snapshot: address,
      subtotal,
      shipping_fee: shippingFee,
      total,
      status: "pending_payment",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Gagal membuat order" },
      { status: 500 }
    );
  }

  // Simpan order items + kurangi stok
  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    seller_id: item.products!.seller_id,
    product_name: item.products!.name,
    product_image: null,
    unit_price: item.products!.price,
    quantity: item.quantity,
    line_total: item.products!.price * item.quantity,
  }));

  await admin.from("order_items").insert(orderItemsPayload);

  for (const item of cartItems) {
    await admin
      .from("products")
      .update({ stock: item.products!.stock - item.quantity })
      .eq("id", item.product_id);
  }

  // Buat Stripe Payment Intent
  // Stripe pakai satuan terkecil mata uang — IDR tidak punya desimal, jadi langsung integer
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total), // IDR tidak punya sen
    currency: "idr",
    metadata: {
      order_id: order.id,
      order_number: orderNumber,
      user_id: user.id,
    },
    description: `Pesanan ${orderNumber} — kemut.store`,
    receipt_email: user.email,
  });

  // Simpan stripe payment intent id ke order
  await admin
    .from("orders")
    .update({ midtrans_order_id: paymentIntent.id }) // reuse kolom untuk simpan payment intent id
    .eq("id", order.id);

  // Kosongkan cart
  await admin.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderNumber,
  });
}