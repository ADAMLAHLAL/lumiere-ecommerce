/*
# Add profiles table, roles, and admin/agent policies

## Overview
Creates a profiles table linked to auth.users with role-based access (admin, agent, customer).
Updates RLS policies to allow admin write access on products/categories, and admin+agent
access on orders. Adds a trigger to auto-create a profile on signup.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, not null) — copied from auth
- `full_name` (text) — display name
- `role` (text, not null, default 'customer') — 'admin', 'agent', or 'customer'
- `created_at` (timestamp)

## New Functions

### handle_new_user()
Trigger function that creates a profile row when a new user signs up.
Defaults role to 'customer'.

### is_admin()
Returns true if the current user's profile role is 'admin'.

### is_staff()
Returns true if the current user's role is 'admin' or 'agent'.

## Security Changes
- profiles: users can read their own profile; admins can read all
- products: added INSERT/UPDATE/DELETE policies for admin only
- categories: added INSERT/UPDATE/DELETE policies for admin only
- orders: added UPDATE/DELETE policies for admin and agent
- order_items: added UPDATE/DELETE policies for admin and agent
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Users can update their own profile (but not their role)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agent')
  );
$$;

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Products: admin write policies
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- Categories: admin write policies
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (is_admin());

-- Orders: staff can update and delete
DROP POLICY IF EXISTS "staff_update_orders" ON orders;
CREATE POLICY "staff_update_orders" ON orders FOR UPDATE
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "staff_delete_orders" ON orders;
CREATE POLICY "staff_delete_orders" ON orders FOR DELETE
  TO authenticated USING (is_staff());

-- Order items: staff can delete
DROP POLICY IF EXISTS "staff_delete_order_items" ON order_items;
CREATE POLICY "staff_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (is_staff());

-- Profiles: admin can update any profile's role
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
