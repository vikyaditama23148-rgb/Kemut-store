import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import { addToCart } from "@/app/cart/actions";
import ProductCard from "@/components/ProductCard";
import ImageGallery from "./ImageGallery";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
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
    ? product.product_images
        .sort((a: any, b: any) => a.position - b.position)
        .map((i: any) => i.url)
    : ["/placeholder-product.svg"];

  const isOnSale =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <main className="pt-[100px] bg-[#f8f6f3]">
      {/* Breadcrumb */}
      <div className="px-margin-mobile md:px-margin-desktop py-8">
        <nav className="flex items-center gap-2 label-caps text-[#747878]">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-[10px]">/</span>
          {product.categories?.name && (
            <>
              <Link
                href={`/search?category=${product.categories.slug}`}
                className="hover:text-black transition-colors"
              >
                {product.categories.name}
              </Link>
              <span className="text-[10px]">/</span>
            </>
          )}
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="px-margin-mobile md:px-margin-desktop pb-section-gap grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

        {/* LEFT — Gallery */}
        <div className="md:col-span-7">
          <ImageGallery images={images} productName={product.name} />

          {/* Video */}
          {product.video_url && (
            <div className="mt-2">
              <p className="label-caps text-[#747878] mb-3">Video Produk</p>
              <video
                src={product.video_url}
                controls
                className="w-full bg-black"
                poster={images[0]}
              />
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div className="md:col-span-5 md:sticky md:top-[120px] flex flex-col">

          {/* Brand & Title */}
          {product.brand && (
            <span className="label-caps text-[#d4af37] tracking-widest mb-2">
              {product.brand}
            </span>
          )}
          <h1 className="font-display font-bold text-3xl md:text-[48px] leading-tight tracking-tighter text-black mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-4 mb-8">
            <p className="font-display font-bold text-2xl text-black">
              {formatRupiah(product.price)}
            </p>
            {isOnSale && (
              <p className="font-display text-lg text-[#747878] line-through">
                {formatRupiah(product.compare_at_price!)}
              </p>
            )}
            {isOnSale && (
              <span className="label-caps bg-[#ffe088] text-black px-3 py-1 text-[9px]">
                Sale
              </span>
            )}
          </div>

          {/* Stock info */}
          <p className="label-caps text-[#747878] mb-8">
            {product.stock > 10
              ? "In Stock"
              : product.stock > 0
              ? `Only ${product.stock} left`
              : "Out of Stock"}
          </p>

          {/* Add to Cart Form */}
          <form action={addToCart} className="flex flex-col gap-4 mb-12">
            <input type="hidden" name="product_id" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />

            {/* Quantity */}
            <div>
              <span className="label-caps block mb-3">Quantity</span>
              <div className="flex items-center border border-[#e8e4de] w-fit">
                <span className="px-4 py-3 text-black font-body text-sm border-r border-[#e8e4de]">
                  —
                </span>
                <select
                  name="quantity"
                  defaultValue={1}
                  className="px-6 py-3 bg-transparent border-none focus:ring-0 font-body text-sm appearance-none cursor-pointer"
                >
                  {Array.from(
                    { length: Math.min(product.stock, 10) || 1 },
                    (_, i) => i + 1
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="px-4 py-3 text-black font-body text-sm border-l border-[#e8e4de]">
                  +
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={product.stock <= 0}
              className="w-full py-5 bg-black text-white label-caps tracking-widest hover:bg-[#d4af37] transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none"
            >
              {product.stock > 0 ? "ADD TO BAG" : "OUT OF STOCK"}
            </button>
            <button
              type="button"
              className="w-full py-5 border border-black text-black label-caps tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
            >
              SAVE TO WISHLIST
            </button>
          </form>

          {/* Collapsible Details */}
          <div className="border-t border-[#e8e4de]">
            {product.description && (
              <details className="group border-b border-[#e8e4de]" open>
                <summary className="flex justify-between items-center py-5 cursor-pointer list-none">
                  <span className="label-caps">Description</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[20px]">
                    expand_more
                  </span>
                </summary>
                <div className="pb-6 text-body-md text-[#444748] leading-relaxed max-w-md">
                  {product.description}
                </div>
              </details>
            )}

            <details className="group border-b border-[#e8e4de]">
              <summary className="flex justify-between items-center py-5 cursor-pointer list-none">
                <span className="label-caps">Shipping & Returns</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[20px]">
                  expand_more
                </span>
              </summary>
              <div className="pb-6 text-body-md text-[#444748] leading-relaxed">
                Gratis ongkos kirim untuk pembelian di atas Rp 1.000.000.
                Pengembalian barang diterima dalam 14 hari sejak diterima dalam
                kondisi dan kemasan asli.
              </div>
            </details>

            <details className="group border-b border-[#e8e4de]">
              <summary className="flex justify-between items-center py-5 cursor-pointer list-none">
                <span className="label-caps">Authenticity</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-[20px]">
                  expand_more
                </span>
              </summary>
              <div className="pb-6 text-body-md text-[#444748] leading-relaxed">
                Setiap produk di KEMUT.STORE melalui proses kurasi dan
                verifikasi keaslian. Pembayaran aman melalui Midtrans dengan
                enkripsi SSL.
              </div>
            </details>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-[#e8e4de]">
            {[
              { icon: "verified", label: "Authentic" },
              { icon: "local_shipping", label: "Free Shipping" },
              { icon: "lock", label: "Secure Payment" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[#747878] text-[20px]">
                  {b.icon}
                </span>
                <span className="label-caps text-[#747878] text-[9px]">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* You May Also Like */}
      {related && related.length > 0 && (
        <section className="px-margin-mobile md:px-margin-desktop pb-section-gap">
          <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-black mb-12">
            YOU MAY ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}