/*
  # Initial Schema for TrackMy Tail Application

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_key` (text, unique)
      - `pet_profile_id` (text, unique)
      - `product_id` (uuid, foreign key)
      - Pet details columns
      - Delivery details columns
      - Payment details columns
      - `status` (text)
      - `total` (decimal)
      - `qr_code_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key)
      - `order_key` (text, unique)
      - `username` (text)
      - `password_hash` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
    - Public access for pet profiles (QR code scanning)
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_key text UNIQUE NOT NULL,
  pet_profile_id text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  pet_name text NOT NULL DEFAULT '',
  pet_info text DEFAULT '',
  pet_age text NOT NULL DEFAULT '',
  pet_chipped text NOT NULL DEFAULT 'no',
  pet_vaccinated text NOT NULL DEFAULT 'no',
  contact_number text NOT NULL DEFAULT '',
  additional_contact text,
  vet_number text,
  product_option text NOT NULL DEFAULT '',
  delivery_full_name text NOT NULL DEFAULT '',
  delivery_address text NOT NULL DEFAULT '',
  delivery_city text NOT NULL DEFAULT '',
  delivery_postal_code text NOT NULL DEFAULT '',
  delivery_phone text NOT NULL DEFAULT '',
  payment_cardholder_name text NOT NULL DEFAULT '',
  payment_expiry_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  total decimal(10,2) NOT NULL DEFAULT 0,
  qr_code_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_key text UNIQUE NOT NULL,
  username text,
  password_hash text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.order_key = current_setting('app.current_user_order_key', true)
      AND users.is_admin = true
    )
  );

-- Orders policies
CREATE POLICY "Anyone can read orders for pet profiles"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    order_key = current_setting('app.current_user_order_key', true)
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.order_key = current_setting('app.current_user_order_key', true)
      AND users.is_admin = true
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    order_key = current_setting('app.current_user_order_key', true)
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.order_key = current_setting('app.current_user_order_key', true)
      AND users.is_admin = true
    )
  );

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    order_key = current_setting('app.current_user_order_key', true)
    OR is_admin = true
  );

CREATE POLICY "Anyone can create user accounts"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    order_key = current_setting('app.current_user_order_key', true)
    OR is_admin = true
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_key ON orders(order_key);
CREATE INDEX IF NOT EXISTS idx_orders_pet_profile_id ON orders(pet_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_users_order_key ON users(order_key);

-- Insert default products
INSERT INTO products (id, name, description, price, image, category) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Dog ID Tag', 'Complete training program for your furry friend', 299.99, 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg', 'Training'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cat ID Tag', 'Comprehensive health examination for cats', 149.99, 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg', 'Healthcare')
ON CONFLICT (id) DO NOTHING;

-- Create admin user
INSERT INTO users (order_key, username, password_hash, is_admin) VALUES
  ('ADMIN001', 'Admin', '$2a$10$example_hash_here', true)
ON CONFLICT (order_key) DO NOTHING;