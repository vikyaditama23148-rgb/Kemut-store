import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { formatRupiah } from "@/lib/midtrans";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group cursor-pointer block">
      {/* Image container */}
      <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-[#f5f3f0]">
        <Image
          src={image}
          alt={product.product_images?.[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Badges */}
        {isOnSale && (
          <span className="absolute top-4 right-4 bg-[#ffe088] text-black px-3 py-1 label-caps text-[9px] tracking-widest">
            Sale
          </span>
        )}
        {!isOnSale && product.is_featured && (
          <span className="absolute top-4 right-4 bg-black text-white px-3 py-1 label-caps text-[9px] tracking-widest">
            New
          </span>
        )}

        {/* Quick Add overlay */}
        <div className="absolute bottom-0 w-full bg-black py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
          <span className="label-caps text-white tracking-widest">Quick Add</span>
        </div>
      </div>

      {/* Info */}
      {product.brand && (
        <p className="label-caps text-[#747878] tracking-[0.1em] mb-1">{product.brand}</p>
      )}
      <h4 className="text-body-md text-[#1a1a1a] mb-2 leading-snug">{product.name}</h4>
      <div className="flex items-center space-x-3">
        <span className="label-caps text-[#1a1a1a]">{formatRupiah(product.price)}</span>
        {isOnSale && (
          <span className="label-caps text-[#747878] line-through">
            {formatRupiah(product.compare_at_price!)}
          </span>
        )}
      </div>
    </Link>
  );
}