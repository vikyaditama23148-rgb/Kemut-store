import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";
import { removeCartItem } from "./actions";
import QuantitySelect from "./QuantitySelect";

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-32 text-center">
        <p className="text-lg mb-6">Please sign in to view your bag.</p>
        <Link href="/login?next=/cart" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*, product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const subtotal =
    items?.reduce((sum, item) => sum + (item.products?.price ?? 0) * item.quantity, 0) ?? 0;

  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-20">
      <h1 className="font-display text-3xl md:text-5xl font-semibold mb-12 tracking-tightest">
        YOUR BAG
      </h1>

      {(!items || items.length === 0) && (
        <div className="text-center py-32">
          <p className="text-on-surface-variant mb-6">Your bag is empty.</p>
          <Link href="/search" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-16">
          <div className="md:col-span-2 divide-y divide-outline-variant">
            {items.map((item) => {
              const product = item.products!;
              const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";
              return (
                <div key={item.id} className="flex gap-6 py-8">
                  <div className="relative w-28 h-32 bg-surface-container-low shrink-0">
                    <Image src={image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`} className="font-medium hover:text-gold">
                        {product.name}
                      </Link>
                      <p className="text-sm text-on-surface-variant mt-1">{formatRupiah(product.price)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <QuantitySelect itemId={item.id} quantity={item.quantity} max={product.stock} />
                      <form action={removeCartItem}>
                        <input type="hidden" name="item_id" value={item.id} />
                        <button type="submit" className="text-sm text-on-surface-variant hover:text-error underline">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="font-semibold">{formatRupiah(product.price * item.quantity)}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-surface-container-low p-8 h-fit">
            <h2 className="label-sm mb-6">Order Summary</h2>
            <div className="flex justify-between mb-3 text-sm">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-6 text-sm text-on-surface-variant">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between mb-8 font-semibold text-lg border-t border-outline-variant pt-4">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
