/*
  # Add Analytics Table

  1. New Tables
    - `analytics`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `total_amount` (numeric)
      - `payment_status` (enum: paid, unpaid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analytics` table
    - Add policy for authenticated users to read and write analytics data
*/

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable full access for authenticated users"
ON analytics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS analytics_order_id_idx ON analytics(order_id);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at);
CREATE INDEX IF NOT EXISTS analytics_payment_status_idx ON analytics(payment_status);

-- Add trigger to automatically create analytics entry when order is created
CREATE OR REPLACE FUNCTION create_analytics_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics (order_id, total_amount, payment_status)
  VALUES (NEW.id, NEW.total, CASE WHEN NEW.status = 'paid' THEN 'paid'::payment_status ELSE 'unpaid'::payment_status END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_analytics_trigger
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION create_analytics_on_order();