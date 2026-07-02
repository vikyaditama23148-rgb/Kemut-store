import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cartCount = 0;
  let isAdmin = false;
  let sellerStatus: string | null = null;

  if (user) {
    const [{ data: cartItems }, { data: profile }, { data: seller }] = await Promise.all([
      supabase.from("cart_items").select("quantity").eq("user_id", user.id),
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("sellers").select("status").eq("id", user.id).maybeSingle(),
    ]);
    cartCount = cartItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    isAdmin = profile?.role === "admin";
    sellerStatus = seller?.status ?? null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-5 md:px-16 py-6 max-w-[1440px] mx-auto">
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/search" className="label-sm text-primary hover:text-gold transition-colors">
            Collections
          </Link>
          {isAdmin && (
            <Link href="/admin" className="label-sm text-on-surface-variant hover:text-gold transition-colors">
              Admin
            </Link>
          )}
          {!isAdmin && sellerStatus === "approved" && (
            <Link href="/seller" className="label-sm text-on-surface-variant hover:text-gold transition-colors">
              Seller Dashboard
            </Link>
          )}
          {!isAdmin && !sellerStatus && (
            <Link href="/sell" className="label-sm text-on-surface-variant hover:text-gold transition-colors">
              Jual Produk
            </Link>
          )}
        </div>
        <Link href="/" className="font-display text-2xl md:text-4xl tracking-tightest text-primary uppercase font-bold">
          KEMUT.STORE
        </Link>
        <div className="flex items-center gap-5 md:gap-6">
          <Link href="/search" aria-label="Search" className="text-on-surface-variant hover:text-gold transition-colors">
            <span className="material-symbols-outlined">search</span>
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            className="text-on-surface-variant hover:text-gold transition-colors"
          >
            <span className="material-symbols-outlined">person</span>
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative text-on-surface-variant hover:text-gold transition-colors">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}