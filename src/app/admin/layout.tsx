import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-16 grid md:grid-cols-[200px_1fr] gap-12">
      <aside className="flex md:flex-col gap-4 md:gap-2">
        <Link href="/admin" className="label-sm hover:text-gold">
          Overview
        </Link>
        <Link href="/admin/products" className="label-sm hover:text-gold">
          Products
        </Link>
        <Link href="/admin/sellers" className="label-sm hover:text-gold">
          Sellers
        </Link>
        <Link href="/admin/orders" className="label-sm hover:text-gold">
          Orders
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}