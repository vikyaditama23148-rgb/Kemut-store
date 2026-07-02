import ProductForm from "@/components/ProductForm";
import { createSellerProduct } from "../actions";

export default function SellerNewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">NEW PRODUCT</h1>
      <ProductForm action={createSellerProduct} />
    </div>
  );
}