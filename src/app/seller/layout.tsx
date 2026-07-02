import Link from "next/link";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-16 grid md:grid-cols-[200px_1fr] gap-12">
      <aside className="flex md:flex-col gap-4 md:gap-2">
        <Link href="/seller" className="label-sm hover:text-gold">
          Overview
        </Link>
        <Link href="/seller/products" className="label-sm hover:text-gold">
          My Products
        </Link>
        <Link href="/seller/orders" className="label-sm hover:text-gold">
          My Sales
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}