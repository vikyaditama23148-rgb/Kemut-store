import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";
import { addToCart } from "@/app/cart/actions";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*), categories:category_id(name, slug)")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(4);

  const images = product.product_images?.length
    ? product.product_images.sort((a: any, b: any) => a.position - b.position)
    : [{ url: "/placeholder-product.svg", alt: product.name }];

  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-20">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="grid grid-cols-2 gap-4">
          {images.map((img: any, idx: number) => (
            <div
              key={idx}
              className={`relative aspect-[4/5] bg-surface-container-low overflow-hidden ${idx === 0 ? "col-span-2" : ""}`}
            >
              <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Info */}
        <div>
          {product.categories?.name && (
            <p className="label-sm text-on-surface-variant mb-3">{product.categories.name}</p>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-6 tracking-tightest">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl font-semibold">{formatRupiah(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-on-surface-variant line-through">
                {formatRupiah(product.compare_at_price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10">{product.description}</p>
          )}

          <form action={addToCart} className="flex items-center gap-4">
            <input type="hidden" name="product_id" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <select name="quantity" defaultValue={1} className="border border-outline-variant px-4 py-4 text-sm bg-white">
              {Array.from({ length: Math.min(product.stock, 10) || 1 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary flex-1" disabled={product.stock <= 0}>
              {product.stock > 0 ? "Add to Bag" : "Out of Stock"}
            </button>
          </form>

          <p className="text-sm text-on-surface-variant mt-4">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
          </p>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-32">
          <h2 className="font-display text-2xl font-semibold mb-12">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
