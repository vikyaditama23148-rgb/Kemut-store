import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { updateProduct } from "../../../actions";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">EDIT PRODUCT</h1>
      <ProductForm action={updateProduct} product={product} />
    </div>
  );
}
