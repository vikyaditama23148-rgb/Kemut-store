import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import { removeCartItem } from "./actions";
import QuantitySelect from "./QuantitySelect";

export default async function CartPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[64px] text-[#c4c7c7] mb-6">shopping_bag</span>
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight mb-4">Your Bag is Empty</h1>
        <p className="text-[#747878] label-caps mb-10">Sign in to view your saved items</p>
        <Link href="/login?next=/cart" className="btn-primary">Sign In</Link>
      </main>
    );
  }

  const { data: items } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*, product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const subtotal = items?.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity, 0
  ) ?? 0;
  const shippingFee = subtotal > 1_000_000 ? 0 : 50_000;
  const total = subtotal + shippingFee;
  const itemCount = items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto bg-[#f8f6f3]">

      {/* Header */}
      <header className="mb-16">
        <h1 className="font-display font-bold text-[32px] md:text-[48px] uppercase tracking-tight mb-2">
          YOUR BAG
        </h1>
        <p className="label-caps text-[#747878]">
          {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"} IN YOUR BAG
        </p>
      </header>

      {/* Empty state */}
      {(!items || items.length === 0) && (
        <div className="py-32 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[64px] text-[#c4c7c7] mb-6">
            shopping_bag
          </span>
          <p className="label-caps text-[#747878] tracking-[0.2em] mb-10">
            Your bag is empty
          </p>
          <Link href="/search" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT — Cart Items */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex flex-col gap-10">
              {items.map((item) => {
                const product = item.products!;
                const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row gap-6 pb-10 border-b border-[#e8e4de]"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="shrink-0 w-full md:w-[160px] aspect-square overflow-hidden bg-[#efeeeb] block"
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {product.brand && (
                            <span className="label-caps text-[#d4af37] block mb-1">
                              {product.brand}
                            </span>
                          )}
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-display font-bold text-[20px] uppercase tracking-tight mb-1 hover:opacity-60 transition-opacity">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-[#747878] text-sm">
                            {product.categories?.name ?? ""}
                          </p>
                        </div>
                        <span className="font-display font-bold text-base shrink-0 ml-4">
                          {formatRupiah(product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <QuantitySelect
                          itemId={item.id}
                          quantity={item.quantity}
                          max={product.stock}
                        />
                        <form action={removeCartItem}>
                          <input type="hidden" name="item_id" value={item.id} />
                          <button
                            type="submit"
                            className="label-caps text-[#747878] underline underline-offset-4 hover:text-black transition-colors"
                          >
                            REMOVE
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipping notice */}
            <div className="mt-12 p-8 bg-white border border-[#e8e4de] flex items-center gap-4">
              <span className="material-symbols-outlined text-black shrink-0">
                local_shipping
              </span>
              {shippingFee === 0 ? (
                <p className="text-base">
                  You qualify for{" "}
                  <span className="font-bold">FREE SHIPPING</span>. Complimentary
                  delivery for all orders above Rp 1.000.000.
                </p>
              ) : (
                <p className="text-base">
                  Add{" "}
                  <span className="font-bold">
                    {formatRupiah(1_000_000 - subtotal)}
                  </span>{" "}
                  more to qualify for <span className="font-bold">FREE SHIPPING</span>.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white p-8 border border-[#e8e4de]">
              <h2 className="label-caps border-b border-[#e8e4de] pb-6 mb-8">
                ORDER SUMMARY
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[#747878] label-caps">SUBTOTAL</span>
                  <span className="text-base">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#747878] label-caps">SHIPPING</span>
                  {shippingFee === 0 ? (
                    <span className="label-caps text-[#d4af37] font-bold">FREE</span>
                  ) : (
                    <span className="text-base">{formatRupiah(shippingFee)}</span>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-6 border-t border-black mb-10">
                <span className="font-display font-bold text-2xl tracking-tight">TOTAL</span>
                <span className="font-display font-bold text-2xl tracking-tight">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Checkout button */}
              <Link
                href="/checkout"
                className="w-full bg-black text-white label-caps py-6 tracking-[0.2em]
                  hover:bg-[#d4af37] transition-all duration-500 flex items-center justify-center gap-3 group"
              >
                PROCEED TO CHECKOUT
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>

              {/* Payment icons */}
              <div className="flex flex-wrap justify-center gap-3 py-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {["VISA", "MASTERCARD", "GOPAY", "OVO", "QRIS"].map((p) => (
                  <span key={p} className="label-caps text-[9px] border border-black px-2 py-1">
                    {p}
                  </span>
                ))}
              </div>

              <div className="text-center mt-2">
                <Link
                  href="/search"
                  className="label-caps text-[#747878] hover:text-black transition-colors underline underline-offset-4"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>

            {/* Help links */}
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#747878] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">help_outline</span>
                NEED ASSISTANCE? CONTACT A SPECIALIST
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#747878] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                LEARN ABOUT OUR 14-DAY RETURNS
              </a>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}