import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { updateSellerProduct } from "../../actions";

export default async function SellerEditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", params.id)
    .single();

  if (!product) notFound();
  if (product.seller_id !== user!.id) redirect("/seller/products");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">EDIT PRODUCT</h1>
      <ProductForm action={updateSellerProduct} product={product} />
    </div>
  );
}