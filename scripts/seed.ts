/**
 * Run with: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: categories } = await supabase.from("categories").select("*");
  const apparel = categories?.find((c) => c.slug === "apparel")?.id;
  const footwear = categories?.find((c) => c.slug === "footwear")?.id;
  const accessories = categories?.find((c) => c.slug === "accessories")?.id;

  const products = [
    {
      name: "The Chronos Essential Watch",
      slug: "chronos-essential-watch",
      description: "A matte gold timepiece, brushed to perfection. Minimal, exclusive, timeless.",
      price: 4500000,
      compare_at_price: 5200000,
      stock: 12,
      category_id: accessories,
      brand: "KEMUT",
      is_featured: true,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200",
    },
    {
      name: "Structured Wool Overcoat",
      slug: "structured-wool-overcoat",
      description: "Tailored from premium Italian wool with a clean, architectural silhouette.",
      price: 3200000,
      stock: 8,
      category_id: apparel,
      brand: "KEMUT",
      is_featured: true,
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1200",
    },
    {
      name: "Minimal Leather Derby",
      slug: "minimal-leather-derby",
      description: "Hand-finished calfskin leather shoes built for quiet confidence.",
      price: 2100000,
      stock: 15,
      category_id: footwear,
      brand: "KEMUT",
      is_featured: false,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200",
    },
    {
      name: "Charcoal Cashmere Scarf",
      slug: "charcoal-cashmere-scarf",
      description: "100% cashmere, woven in a single charcoal tone for understated luxury.",
      price: 950000,
      stock: 20,
      category_id: accessories,
      brand: "KEMUT",
      is_featured: false,
      image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1200",
    },
  ];

  for (const p of products) {
    const { image, ...rest } = p;
    const payload = {
      ...rest,
      compare_at_price: rest.compare_at_price ?? null,
    };
    const { data: product, error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert", p.name, error.message);
      continue;
    }

    await supabase.from("product_images").delete().eq("product_id", product.id);
    await supabase.from("product_images").insert({ product_id: product.id, url: image, position: 0 });
    console.log("Seeded:", product.name);
  }
}

main().then(() => {
  console.log("Done.");
  process.exit(0);
});