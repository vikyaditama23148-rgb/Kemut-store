import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-16 grid md:grid-cols-[220px_1fr] gap-12">
      <aside className="flex md:flex-col gap-4 md:gap-1">
        <p className="label-sm text-on-surface-variant mb-2 hidden md:block">Platform</p>
        <Link href="/admin" className="label-sm hover:text-gold py-1">Overview</Link>
        <Link href="/admin/sellers" className="label-sm hover:text-gold py-1">Sellers</Link>
        <Link href="/admin/withdrawals" className="label-sm hover:text-gold py-1">Withdrawals</Link>

        <p className="label-sm text-on-surface-variant mb-2 mt-4 hidden md:block">Katalog</p>
        <Link href="/admin/products" className="label-sm hover:text-gold py-1">Products</Link>

        <p className="label-sm text-on-surface-variant mb-2 mt-4 hidden md:block">Transaksi</p>
        <Link href="/admin/orders" className="label-sm hover:text-gold py-1">Orders</Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}