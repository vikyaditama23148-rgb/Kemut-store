import Link from "next/link";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-16 grid md:grid-cols-[220px_1fr] gap-12">
      <aside className="flex md:flex-col gap-4 md:gap-1">
        <p className="label-sm text-on-surface-variant mb-2 hidden md:block">Toko Saya</p>
        <Link href="/seller" className="label-sm hover:text-gold py-1">Overview</Link>
        <Link href="/seller/products" className="label-sm hover:text-gold py-1">Produk</Link>
        <Link href="/seller/orders" className="label-sm hover:text-gold py-1">Penjualan</Link>

        <p className="label-sm text-on-surface-variant mb-2 mt-4 hidden md:block">Keuangan</p>
        <Link href="/seller/wallet" className="label-sm hover:text-gold py-1">Dompet & Withdraw</Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}