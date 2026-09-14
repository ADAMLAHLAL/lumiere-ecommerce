/*
# E-commerce Schema for Projectors & Lamps Store

## Overview
Creates the complete database schema for a professional e-commerce store
selling projectors and lamps. No authentication required — customers browse
and place orders without creating accounts.

## New Tables

### categories
- `id` (uuid, primary key)
- `name` (text, not null) — category display name
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text) — category description
- `image_url` (text) — category image
- `created_at` (timestamp)

### products
- `id` (uuid, primary key)
- `name` (text, not null) — product name
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text, not null) — product description
- `price` (numeric, not null) — price in EUR
- `old_price` (numeric) — optional original price for discounts
- `image_url` (text, not null) — main product image
- `images` (text[]) — additional product images
- `category_id` (uuid, FK to categories) — product category
- `brand` (text) — manufacturer brand
- `stock` (integer, default 0) — available inventory
- `rating` (numeric, default 0) — average rating (0-5)
- `review_count` (integer, default 0) — number of reviews
- `featured` (boolean, default false) — show on homepage
- `specifications` (jsonb) — key-value product specs (wattage, lumens, etc.)
- `created_at` (timestamp)

### orders
- `id` (uuid, primary key)
- `order_number` (text, unique, not null) — human-readable order number
- `customer_name` (text, not null)
- `customer_email` (text, not null)
- `customer_phone` (text)
- `shipping_address` (text, not null)
- `city` (text, not null)
- `postal_code` (text, not null)
- `country` (text, not null, default 'France')
- `total` (numeric, not null) — order total
- `status` (text, default 'pending') — pending, confirmed, shipped, delivered
- `created_at` (timestamp)

### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, FK to orders, cascade delete)
- `product_id` (uuid, FK to products, set null on delete)
- `product_name` (text, not null) — snapshot of product name at order time
- `product_image` (text) — snapshot of product image
- `price` (numeric, not null) — unit price at order time
- `quantity` (integer, not null) — quantity ordered

## Security
- RLS enabled on all tables.
- Products and categories: public read (anon + authenticated), no writes from client.
- Orders and order_items: public read + insert (customers place orders without auth).
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  image_url text NOT NULL,
  images text[],
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand text,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'France',
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
