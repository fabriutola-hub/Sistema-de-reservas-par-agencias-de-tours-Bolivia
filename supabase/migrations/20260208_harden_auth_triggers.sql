-- ============================================================
-- HARDEN AUTH TRIGGERS & CLEANUP
-- ============================================================

-- 1. Remove dummy table created for diagnostics
DROP TABLE IF EXISTS public.users;

-- 2. Harden handle_new_user trigger function
-- Wrap logic in exception block to prevent blocking user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail transaction
    RAISE WARNING 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$function$;

-- 3. Harden link_existing_reservations trigger function
-- Wrap logic in exception block
CREATE OR REPLACE FUNCTION public.link_existing_reservations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    IF NEW.email IS NOT NULL THEN
       UPDATE public.reservas r
       SET user_id = NEW.id
       WHERE r.user_id IS NULL
       AND EXISTS (
           SELECT 1 FROM public.clientes c
           WHERE c.id = r.cliente_id
           AND c.email = NEW.email
       );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail transaction
    RAISE WARNING 'Error in link_existing_reservations: % %', SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$function$;

-- 4. Ensure Insert Policy for Profiles exists
-- Even though triggers are SECURITY DEFINER, this is good practice
-- and allows manual profile creation if trigger fails
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;
