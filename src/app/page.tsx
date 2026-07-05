import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

const categories = [
  {
    name: "Apparel",
    slug: "apparel",
    sub: "Shop Collection",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
  },
  {
    name: "Footwear",
    slug: "footwear",
    sub: "Shop Edit",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
  },
  {
    name: "Accessories",
    slug: "accessories",
    sub: "Explore",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200",
  },
];

const brands = ["GUCCI", "PRADA", "BALENCIAGA", "CELINE", "FENDI", "DIOR"];

const instagramImages = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600",
];

export default async function HomePage() {
  const supabase = createClient();

  const { data: newArrivals } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="bg-[#f8f6f3]">

      {/* 1. HERO */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000"
            alt="Kemut Store Hero"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop w-full max-w-4xl">
          <p className="label-caps text-[#d4af37] mb-6 tracking-[0.3em]">
            Inaugural Collection — SS 2025
          </p>
          <h1
            className="text-white font-display font-bold leading-[0.9] tracking-[-0.04em] mb-10"
            style={{ fontSize: "clamp(64px, 10vw, 120px)" }}
          >
            UNSPOKEN
            <br />
            LUXURY
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href="/search" className="btn-primary">
              Explore Collection
            </Link>
            <Link href="/search?sort=newest" className="btn-ghost-white">
              New Arrivals
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="label-caps text-white/50 tracking-[0.3em]">Scroll</span>
          <div className="w-px h-12 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* 2. MARQUEE */}
      <section className="bg-black py-4 overflow-hidden border-y border-[#d4af37]/20">
        <div className="marquee-track">
          {[...Array(2)].map((_, di) => (
            <div key={di} className="flex items-center space-x-12 px-6">
              {["FREE SHIPPING ABOVE Rp 1.000.000", "CURATED LUXURY", "AUTHENTIC PRODUCTS", "EXCLUSIVE DROPS", "NEW ARRIVALS WEEKLY"].map((text, i) => (
                <span key={i} className="flex items-center gap-12">
                  <span className="label-caps text-[#d4af37] tracking-[0.2em]">{text}</span>
                  <span className="text-white/20 text-xl">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop reveal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-grid">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="relative group aspect-[4/5] overflow-hidden editorial-hover block"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-white font-display font-bold text-2xl uppercase tracking-widest">
                  {cat.name}
                </h3>
                <span className="label-caps text-white/80 mt-2 block group-hover:text-[#d4af37] transition-colors">
                  {cat.sub} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop reveal">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="label-caps text-[#747878] tracking-[0.2em] mb-2">
              Curated Selection
            </p>
            <h2 className="font-display font-bold text-headline-lg uppercase tracking-tight">
              NEW ARRIVALS
            </h2>
          </div>
          <Link
            href="/search"
            className="label-caps border-b border-black pb-1 hover:opacity-50 transition-opacity hidden md:block"
          >
            View All Items
          </Link>
        </div>

        {newArrivals && newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#747878] label-caps tracking-[0.2em]">
              Collection coming soon
            </p>
            <Link href="/sell" className="btn-primary mt-8 inline-flex">
              Sell With Us
            </Link>
          </div>
        )}
      </section>

      {/* 5. EDITORIAL BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] reveal">
        <div className="relative min-h-[500px]">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200"
            alt="Editorial"
            fill
            className="object-cover"
          />
        </div>
        <div className="bg-black flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-20 text-white">
          <p className="label-caps text-[#d4af37] tracking-[0.4em] mb-8">
            Philosophy
          </p>
          <h2
            className="font-display font-bold leading-tight tracking-tighter mb-8"
            style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
          >
            THE ART OF
            <br />
            RESTRAINT
          </h2>
          <p className="text-body-lg text-[#e4e2df] max-w-lg mb-12 leading-relaxed">
            Every piece in our collection is curated with a single guiding
            principle: the ability to speak without noise. We believe that true
            luxury is felt, not seen.
          </p>
          <Link href="/search" className="btn-ghost-white self-start">
            Discover The Edit
          </Link>
        </div>
      </section>

      {/* 6. BRANDS */}
      <section className="py-24 border-y border-[#c4c7c7]/30 overflow-hidden reveal">
        <div className="px-margin-mobile md:px-margin-desktop mb-12 text-center">
          <p className="label-caps text-[#747878] tracking-[0.2em]">
            Our Curated House
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 px-margin-desktop grayscale opacity-40 hover:opacity-100 transition-opacity duration-700">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-display font-bold text-2xl uppercase tracking-tight"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* 7. INSTAGRAM GRID */}
      <section className="py-section-gap reveal">
        <div className="px-margin-mobile md:px-margin-desktop mb-12 text-center">
          <h2 className="label-caps tracking-[0.3em]">
            Follow @KEMUT.STORE
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter-grid">
          {instagramImages.map((src, i) => (
            <div
              key={i}
              className="aspect-square relative group overflow-hidden"
            >
              <Image
                src={src}
                alt={`Gallery ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">
                  photo_camera
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}