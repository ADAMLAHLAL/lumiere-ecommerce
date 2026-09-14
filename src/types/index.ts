export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string;
  images: string[] | null;
  category_id: string | null;
  brand: string | null;
  stock: number;
  rating: number;
  review_count: number;
  featured: boolean;
  specifications: Record<string, string> | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  city: string;
  postal_code: string;
  country: string;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'admin' | 'agent' | 'customer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
