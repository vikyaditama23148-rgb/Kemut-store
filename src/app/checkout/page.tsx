import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import CheckoutPayButton from "./CheckoutPayButton";

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false });

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*)")
    .eq("user_id", user!.id);

  const subtotal = cartItems?.reduce((sum, i) => sum + (i.products?.price ?? 0) * i.quantity, 0) ?? 0;
  const shippingFee = subtotal > 1_000_000 || subtotal === 0 ? 0 : 50_000;
  const total = subtotal + shippingFee;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="px-5 max-w-2xl mx-auto py-32 text-center">
        <p className="text-on-surface-variant mb-6">Your bag is empty.</p>
        <Link href="/search" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="px-5 max-w-2xl mx-auto py-32 text-center">
        <p className="text-on-surface-variant mb-6">Please add a shipping address before checking out.</p>
        <Link href="/account" className="btn-primary">
          Add Address
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-20">
      <h1 className="font-display text-3xl md:text-5xl font-semibold mb-12 tracking-tightest">CHECKOUT</h1>

      <div className="grid md:grid-cols-3 gap-16">
        <div className="md:col-span-2">
          <h2 className="label-sm mb-6">Shipping Address</h2>
          <div className="border border-outline-variant p-6 mb-10">
            <p className="font-medium">{addresses[0].recipient_name}</p>
            <p className="text-sm text-on-surface-variant mt-1">{addresses[0].phone}</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {addresses[0].line1}, {addresses[0].city}, {addresses[0].province} {addresses[0].postal_code}
            </p>
            <Link href="/account" className="label-sm hover:text-gold mt-4 inline-block">
              Change Address
            </Link>
          </div>

          <h2 className="label-sm mb-6">Items</h2>
          <div className="divide-y divide-outline-variant">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-4 text-sm">
                <span>
                  {item.products?.name} × {item.quantity}
                </span>
                <span>{formatRupiah((item.products?.price ?? 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low p-8 h-fit">
          <h2 className="label-sm mb-6">Order Summary</h2>
          <div className="flex justify-between mb-3 text-sm">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-6 text-sm">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatRupiah(shippingFee)}</span>
          </div>
          <div className="flex justify-between mb-8 font-semibold text-lg border-t border-outline-variant pt-4">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          <CheckoutPayButton addressId={addresses[0].id} />
        </div>
      </div>
    </div>
  );
}
