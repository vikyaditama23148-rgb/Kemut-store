import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import SearchFilters from "./SearchFilters";

export const revalidate = 30;

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true);

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }
  if (searchParams.category) {
    const cat = categories?.find((c) => c.slug === searchParams.category);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (searchParams.min) query = query.gte("price", Number(searchParams.min));
  if (searchParams.max) query = query.lte("price", Number(searchParams.max));

  switch (searchParams.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  const activeCategory = searchParams.category ?? null;
  const activeSort = searchParams.sort ?? "newest";

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1920px] mx-auto bg-[#f8f6f3]">

      {/* Page Header */}
      <header className="mb-12">
        <nav className="mb-4">
          <ol className="flex gap-2 label-caps text-[#747878]">
            <li><Link href="/" className="hover:text-black transition-colors">Home</Link></li>
            <li>&gt;</li>
            <li><span className="text-black">Collections</span></li>
          </ol>
        </nav>
        <div className="flex flex-col md:flex-row md:items-baseline gap-4">
          <h1 className="font-display font-bold text-[32px] md:text-[48px] uppercase tracking-tight">
            {searchParams.q
              ? `Results for "${searchParams.q}"`
              : activeCategory
              ? categories?.find((c) => c.slug === activeCategory)?.name?.toUpperCase() ?? "ALL COLLECTIONS"
              : "ALL COLLECTIONS"}
          </h1>
          <span className="label-caps text-[#747878]/60">
            {products?.length ?? 0} pieces
          </span>
        </div>
      </header>

      {/* Filter + Sort Bar — sticky */}
      <SearchFilters
        categories={categories ?? []}
        activeCategory={activeCategory}
        activeSort={activeSort}
        searchQ={searchParams.q ?? ""}
      />

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[2px] gap-y-16">
            {products.map((product) => {
              const image = product.product_images?.[0]?.url ?? "/placeholder-product.svg";
              const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group cursor-pointer block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#efeeeb]">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Sale badge */}
                    {isOnSale && (
                      <div className="absolute top-4 left-4 bg-[#d4af37] px-3 py-1 label-caps text-white">
                        SALE
                      </div>
                    )}

                    {/* New badge */}
                    {!isOnSale && product.is_featured && (
                      <div className="absolute top-4 left-4 bg-black px-3 py-1 label-caps text-white">
                        NEW
                      </div>
                    )}

                    {/* Wishlist icon */}
                    <button
                      className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm transition-opacity duration-300"
                    >
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                    </button>

                    {/* Quick add overlay */}
                    <div className="absolute bottom-0 w-full bg-black py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <span className="label-caps text-white tracking-widest">Quick Add</span>
                    </div>
                  </div>

                  <div className="px-2">
                    {product.brand && (
                      <p className="label-caps text-[#747878] mb-1">{product.brand}</p>
                    )}
                    <h3 className="text-base text-black mb-2 leading-snug">{product.name}</h3>
                    <div className="flex items-baseline gap-3">
                      <p className={`text-base ${isOnSale ? "text-[#d4af37]" : "text-black"}`}>
                        {formatRupiah(product.price)}
                      </p>
                      {isOnSale && (
                        <p className="text-[10px] line-through text-[#747878]">
                          {formatRupiah(product.compare_at_price!)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Load more hint */}
          <div className="mt-24 flex justify-center">
            <div className="px-16 py-5 border border-[#e8e4de] label-caps text-[#747878] tracking-[0.2em]">
              {products.length} of {products.length} pieces shown
            </div>
          </div>
        </>
      ) : (
        <div className="py-32 text-center">
          <p className="label-caps text-[#747878] tracking-[0.2em] mb-8">
            No pieces found
          </p>
          <Link href="/search" className="btn-ghost">
            View All Collections
          </Link>
        </div>
      )}
    </main>
  );
}