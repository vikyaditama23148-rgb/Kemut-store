import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const navLinks = [
    { href: "/search", label: "Collections", show: true },
    { href: "/search?sort=newest", label: "New Arrivals", show: true },
    { href: "/admin", label: "Admin", show: isAdmin },
    { href: "/seller", label: "Seller Dashboard", show: !isAdmin && sellerStatus === "approved" },
    { href: "/sell", label: "Jual Produk", show: !isAdmin && !sellerStatus && !!user },
    { href: user ? "/account" : "/login", label: user ? "Account" : "Sign In", show: true },
  ].filter((l) => l.show);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[#d4af37]/20 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-6">

        {/* Desktop — kiri */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/search"
            className="label-caps text-[#444748] hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
          >
            Collections
          </Link>
          <Link
            href="/search?sort=newest"
            className="label-caps text-black border-b border-black pb-1"
          >
            New Arrivals
          </Link>
          {isAdmin && (
            <Link href="/admin" className="label-caps text-[#d4af37] hover:text-black transition-colors">
              Admin
            </Link>
          )}
          {!isAdmin && sellerStatus === "approved" && (
            <Link href="/seller" className="label-caps text-[#d4af37] hover:text-black transition-colors">
              My Store
            </Link>
          )}
          {!isAdmin && !sellerStatus && user && (
            <Link href="/sell" className="label-caps text-[#444748] hover:text-black transition-colors">
              Sell
            </Link>
          )}
        </div>

        {/* Logo — tengah absolute */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="font-display font-bold text-xl md:text-2xl tracking-tighter text-black uppercase"
          >
            KEMUT.STORE
          </Link>
        </div>

        {/* Kanan */}
        <div className="flex items-center space-x-5 md:space-x-6">
          <Link href="/search" className="text-black hover:opacity-50 transition-opacity hidden md:block" aria-label="Search">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>search</span>
          </Link>
          <Link href={user ? "/account" : "/login"} className="text-black hover:opacity-50 transition-opacity hidden md:block" aria-label="Account">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>person</span>
          </Link>
          <Link href="/cart" className="relative text-black hover:opacity-50 transition-opacity" aria-label="Cart">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          {/* Hamburger mobile */}
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </nav>
  );
}