import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/stripe";
import { deleteProduct } from "../actions";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories:category_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-display text-2xl font-semibold tracking-tightest">PRODUCTS</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      <div className="divide-y divide-outline-variant">
        {products?.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-on-surface-variant">
                {p.categories?.name ?? "Uncategorized"} · Stock: {p.stock} · {p.is_active ? "Active" : "Hidden"}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm">{formatRupiah(p.price)}</span>
              <Link href={`/admin/products/${p.id}/edit`} className="label-sm hover:text-gold">
                Edit
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="label-sm text-error hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-on-surface-variant">No products yet.</p>
      )}
    </div>
  );
}
