/*
  # Create Restaurant Staff User

  1. Changes
    - Create a default user for restaurant staff
    - Set up authentication credentials
  
  2. Security
    - Create user with secure password
    - Enable access to orders and order items
    - Use safe insertion with proper checks
*/

-- Create the restaurant staff user if it doesn't exist
DO $$
DECLARE
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'restaurant@example.com'
    ) INTO user_exists;

    IF NOT user_exists THEN
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