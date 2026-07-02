import ProductForm from "@/components/ProductForm";
import { createProduct } from "../../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-10 tracking-tightest">NEW PRODUCT</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
