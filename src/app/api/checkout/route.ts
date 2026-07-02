import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMidtransSnap } from "@/lib/midtrans";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId } = await req.json();

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 400 });
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*)")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Verify stock and compute totals server-side (never trust client prices)
  for (const item of cartItems) {
    if (!item.products || item.products.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${item.products?.name ?? "a product"}` },
        { status: 400 }
      );
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.products!.price * item.quantity, 0);
  const shippingFee = subtotal > 1_000_000 ? 0 : 50_000;
  const total = subtotal + shippingFee;

  const admin = createAdminClient();
  const orderNumber = `KMT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
  const midtransOrderId = `${orderNumber}`;

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
      midtrans_order_id: midtransOrderId,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
  }

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

  // Decrement stock
  for (const item of cartItems) {
    await admin
      .from("products")
      .update({ stock: item.products!.stock - item.quantity })
      .eq("id", item.product_id);
  }

  // Create Midtrans Snap transaction
  const snap = getMidtransSnap();
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: total,
    },
    customer_details: {
      first_name: address.recipient_name,
      email: user.email,
      phone: address.phone,
      shipping_address: {
        address: address.line1,
        city: address.city,
        postal_code: address.postal_code,
      },
    },
    item_details: [
      ...cartItems.map((item) => ({
        id: item.product_id,
        price: item.products!.price,
        quantity: item.quantity,
        name: item.products!.name.slice(0, 50),
      })),
      ...(shippingFee > 0 ? [{ id: "shipping", price: shippingFee, quantity: 1, name: "Shipping Fee" }] : []),
    ],
  });

  // Clear the cart now that the order + transaction exist
  await admin.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({
    snapToken: transaction.token,
    orderNumber,
  });
}