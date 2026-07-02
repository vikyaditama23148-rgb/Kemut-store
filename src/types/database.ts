export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired";

export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";

export type Seller = {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  phone: string | null;
  status: SellerStatus;
  rejection_reason: string | null;
  created_at: string;
  approved_at: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  alt: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_id: string | null;
  seller_id: string | null;
  brand: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  product_images?: ProductImage[];
  categories?: Category | null;
  sellers?: Seller | null;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products?: Product;
};

export type Address = {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  shipping_snapshot: Address;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  midtrans_order_id: string | null;
  payment_type: string | null;
  paid_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "seller" | "admin";
};