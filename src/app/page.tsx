import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const { data: featured } = await supabase
    .from("products")
    .select("*, product_images(*), categories:category_id(name, slug)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: latest } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full flex items-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000"
          alt="Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-20 px-5 md:px-16 max-w-[1440px] mx-auto w-full">
          <div className="max-w-2xl">
            <span className="label-sm uppercase tracking-[0.4em] text-white/80 block mb-6">
              Inaugural Release
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-10 leading-[1.05] font-bold tracking-tightest">
              UNSPOKEN
              <br />
              LUXURY
            </h1>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/search" className="px-12 py-5 bg-primary text-white label-sm uppercase hover:bg-gold transition-colors">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest collections */}
      <section className="py-[120px] px-5 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl md:text-4xl font-semibold mb-4">LATEST COLLECTIONS</h2>
            <p className="text-on-surface-variant text-lg">
              Newly curated pieces, selected for restraint and precision.
            </p>
          </div>
          <Link href="/search" className="label-sm hidden md:block hover:text-gold">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {latest?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {(!latest || latest.length === 0) && (
          <p className="text-on-surface-variant">
            Belum ada produk. Tambahkan produk lewat dashboard admin.
          </p>
        )}
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="py-[120px] px-5 md:px-16 max-w-[1440px] mx-auto bg-surface-container-low">
          <h2 className="font-display text-2xl md:text-4xl font-semibold mb-16 text-center">
            FEATURED PIECES
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
