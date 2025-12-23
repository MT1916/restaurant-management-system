/*
  # Restaurant Orders Schema

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `table_id` (integer)
      - `status` (enum)
      - `total` (integer, in paise)
      - `special_notes` (text)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `name` (text)
      - `quantity` (integer)
      - `price` (integer, in paise)
      - `image_url` (text)
      - `customizations` (text[])

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all orders
    - Add policies for authenticated users to insert orders
*/

-- Create enum for order status
CREATE TYPE order_status AS ENUM (
  'pending',
  'preparing',
  'ready',
  'served',
  'paid'
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id integer NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total integer NOT NULL,
  special_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL,
  price integer NOT NULL,
  image_url text NOT NULL,
  customizations text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to all authenticated users"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow read access to all authenticated users"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to all authenticated users"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);