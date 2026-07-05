import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import CheckoutPayButton from "./CheckoutPayButton";
import { saveAddress } from "../account/actions";

export default async function CheckoutPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false });

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products:product_id(*, product_images(*))")
    .eq("user_id", user!.id);

  const subtotal = cartItems?.reduce(
    (sum, i) => sum + (i.products?.price ?? 0) * i.quantity, 0
  ) ?? 0;
  const shippingFee = subtotal > 1_000_000 ? 0 : 50_000;
  const total = subtotal + shippingFee;

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto text-center">
        <p className="label-caps text-[#747878] mb-8">Your bag is empty</p>
        <Link href="/search" className="btn-primary">Start Shopping</Link>
      </main>
    );
  }

  const defaultAddress = addresses?.[0] ?? null;

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto bg-[#f8f6f3]">

      {/* Progress Indicator */}
      <div className="flex justify-center items-center gap-4 md:gap-12 mb-20">
        {[
          { n: "01", label: "SHIPPING", active: true },
          { n: "02", label: "PAYMENT", active: true },
          { n: "03", label: "CONFIRMATION", active: false },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-3">
            <div className={`flex items-center gap-3 ${step.active ? "" : "opacity-40"}`}>
              <span className={`label-caps ${step.active ? "text-[#d4af37]" : ""}`}>{step.n}</span>
              <span className={`label-caps ${step.active ? "text-[#d4af37]" : ""}`}>{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`h-px w-12 md:w-20 ml-4 ${i === 0 ? "bg-[#d4af37]" : "bg-[#c4c7c7]"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20 items-start">

        {/* LEFT — Form */}
        <section className="space-y-16">

          {/* Shipping Address */}
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
              Shipping Address
            </h2>

            {defaultAddress ? (
              <div className="border border-black p-6 mb-6 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="label-caps text-[#d4af37] mb-2">Default Address</p>
                    <p className="font-medium">{defaultAddress.recipient_name}</p>
                    <p className="text-[#747878] text-sm mt-1">{defaultAddress.phone}</p>
                    <p className="text-[#747878] text-sm mt-1">
                      {defaultAddress.line1}, {defaultAddress.city},{" "}
                      {defaultAddress.province} {defaultAddress.postal_code}
                    </p>
                  </div>
                  <Link href="/account" className="label-caps text-[#747878] underline underline-offset-4 hover:text-black transition-colors shrink-0 ml-4">
                    Change
                  </Link>
                </div>
              </div>
            ) : (
              <form action={saveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="label-caps text-[#747878]/60">Full Name</label>
                  <input name="recipient_name" required placeholder="Enter your legal name" className="input-line" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label-caps text-[#747878]/60">Phone Number</label>
                  <input name="phone" required placeholder="+62 ..." className="input-line" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="label-caps text-[#747878]/60">Street Address</label>
                  <input name="line1" required placeholder="Apartment, suite, or house number" className="input-line" />
                </div>
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <label className="label-caps text-[#747878]/60">City</label>
                    <input name="city" required placeholder="Jakarta" className="input-line" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-caps text-[#747878]/60">Province</label>
                    <input name="province" required placeholder="DKI" className="input-line" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-caps text-[#747878]/60">Postal Code</label>
                    <input name="postal_code" required placeholder="10110" className="input-line" />
                  </div>
                </div>
                <button type="submit" className="btn-ghost md:col-span-2">
                  Save Address
                </button>
              </form>
            )}
          </div>

          {/* Payment Method — Info only (Midtrans handles actual selection in popup) */}
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[
                { icon: "credit_card", title: "Credit Card", sub: "Visa, Mastercard, JCB" },
                { icon: "account_balance", title: "Bank Transfer", sub: "Virtual Account (BCA, Mandiri, BNI)" },
                { icon: "qr_code_2", title: "QRIS", sub: "GoPay, OVO, Dana, ShopeePay" },
                { icon: "wallet", title: "GoPay", sub: "Direct Gojek App Link" },
              ].map((m) => (
                <div
                  key={m.title}
                  className="p-6 border border-[#c4c7c7]/30 bg-white flex flex-col gap-4"
                >
                  <span className="material-symbols-outlined text-black">{m.icon}</span>
                  <div>
                    <h4 className="label-caps mb-1">{m.title}</h4>
                    <p className="text-sm text-[#747878]">{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="label-caps text-[#747878] text-center">
              Select your preferred method in the payment popup
            </p>
          </div>

          {/* Pay button */}
          {defaultAddress ? (
            <CheckoutPayButton addressId={defaultAddress.id} />
          ) : (
            <p className="label-caps text-[#747878] text-center py-4">
              Please save your address above to continue
            </p>
          )}
        </section>

        {/* RIGHT — Order Summary sticky */}
        <aside className="lg:sticky lg:top-32 space-y-10">
          <div className="border border-[#c4c7c7]/30 bg-white p-8">
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-6 mb-10">
              {cartItems.map((item) => {
                const product = item.products!;
                const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 shrink-0 bg-[#efeeeb] overflow-hidden">
                      <Image
                        src={image}
                        alt={product.name}
                        width={80}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h3 className="label-caps mb-1">{product.name}</h3>
                        <p className="text-sm text-[#747878]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-base font-semibold">
                        {formatRupiah(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-8 border-t border-[#c4c7c7]/30">
              <div className="flex justify-between text-[#747878] text-sm">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#747878] text-sm">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="label-caps text-[#d4af37]">FREE</span>
                ) : (
                  <span>{formatRupiah(shippingFee)}</span>
                )}
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-black">
                <span className="font-display font-bold text-2xl tracking-tight">Total</span>
                <span className="font-display font-bold text-2xl tracking-tight">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-col items-center gap-4 opacity-50">
            <div className="flex gap-8 items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
                <span className="label-caps text-[10px]">SSL SECURED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified_user</span>
                <span className="label-caps text-[10px]">MIDTRANS SECURED</span>
              </div>
            </div>
            <p className="text-[10px] text-center max-w-[280px] leading-relaxed label-caps">
              YOUR DATA IS ENCRYPTED AND PROTECTED. KEMUT.STORE DOES NOT STORE FULL PAYMENT INFORMATION ON OUR SERVERS.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}