import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 30;

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
};

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

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

  return (
    <div className="px-5 md:px-16 max-w-[1440px] mx-auto py-20">
      <h1 className="font-display text-3xl md:text-5xl font-semibold mb-12 tracking-tightest">
        ALL COLLECTIONS
      </h1>

      <form className="flex flex-wrap gap-4 mb-10 items-center" action="/search">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search products..."
          className="input-line max-w-xs"
        />
        <select name="category" defaultValue={searchParams.category ?? ""} className="border border-outline-variant px-4 py-3 text-sm bg-white">
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="number" name="min" placeholder="Min" defaultValue={searchParams.min} className="border border-outline-variant px-4 py-3 text-sm w-24" />
        <input type="number" name="max" placeholder="Max" defaultValue={searchParams.max} className="border border-outline-variant px-4 py-3 text-sm w-24" />
        <select name="sort" defaultValue={searchParams.sort ?? ""} className="border border-outline-variant px-4 py-3 text-sm bg-white">
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button type="submit" className="btn-primary">Apply</button>
        {(searchParams.q || searchParams.category || searchParams.min || searchParams.max || searchParams.sort) && (
          <Link href="/search" className="label-sm text-on-surface-variant hover:text-gold">Reset</Link>
        )}
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-on-surface-variant py-20 text-center">No products match your filters.</p>
      )}
    </div>
  );
}
