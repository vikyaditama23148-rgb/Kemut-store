import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary mt-32">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <p className="font-display text-2xl tracking-tightest uppercase mb-4">KEMUT.STORE</p>
          <p className="text-sm text-white/60 max-w-xs">
            Curation over volume. A premium marketplace built on unspoken luxury.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="label-sm text-white/50 mb-2">Shop</span>
          <Link href="/search" className="text-sm text-white/80 hover:text-gold">
            Collections
          </Link>
          <Link href="/cart" className="text-sm text-white/80 hover:text-gold">
            Cart
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <span className="label-sm text-white/50 mb-2">Account</span>
          <Link href="/login" className="text-sm text-white/80 hover:text-gold">
            Sign in
          </Link>
          <Link href="/account/orders" className="text-sm text-white/80 hover:text-gold">
            Orders
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} KEMUT.STORE. All rights reserved.
      </div>
    </footer>
  );
}
