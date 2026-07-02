import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { formatRupiah } from "@/lib/midtrans";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-surface-container-low">
        <Image
          src={image}
          alt={product.product_images?.[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-3 left-3 bg-gold text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider">
            Sale
          </span>
        )}
      </div>
      <div className="mt-4">
        {product.brand && <p className="label-sm text-on-surface-variant mb-1">{product.brand}</p>}
        <h3 className="text-base font-medium text-on-surface">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">{formatRupiah(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-on-surface-variant line-through">
              {formatRupiah(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
