/*
  # Add cancelled status to order_status enum

  1. Changes
    - Add 'cancelled' as a valid status to the order_status enum type
    - Use safe ALTER TYPE syntax to avoid conflicts
  
  2. Notes
    - This migration adds a new status option for cancelled orders
    - Ensures idempotent operation with IF NOT EXISTS
*/

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'order_status'
        AND e.enumlabel = 'cancelled'
    ) THEN
        ALTER TYPE order_status ADD VALUE 'cancelled';
    END IF;
END $$;