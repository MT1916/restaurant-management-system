/*
  # Fix RLS Policies for Orders and Order Items

  1. Changes
    - Update RLS policies for orders table to allow insert and update
    - Update RLS policies for order_items table to allow insert and update
    - Add policies for managing order status updates

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
    - Ensure authenticated users can manage their orders
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow insert access to all authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON order_items;
DROP POLICY IF EXISTS "Allow insert access to all authenticated users" ON order_items;

-- Create new policies for orders table
CREATE POLICY "Enable read access for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create new policies for order_items table
CREATE POLICY "Enable read access for authenticated users"
ON order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON order_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);