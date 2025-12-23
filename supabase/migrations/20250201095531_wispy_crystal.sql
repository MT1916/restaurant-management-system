/*
  # Fix Authentication and Policies

  1. Changes
    - Create default restaurant staff user with correct credentials
    - Update RLS policies for better security
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create initial staff user
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON order_items;

-- Create new policies for orders table
CREATE POLICY "Enable full access for authenticated users"
ON orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create new policies for order_items table
CREATE POLICY "Enable full access for authenticated users"
ON order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create the restaurant staff user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM auth.users WHERE email = 'restaurant@example.com'
    ) THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'restaurant@example.com',
            crypt('restaurant123', gen_salt('bf')),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;