-- ============================================================
-- MIGRACIÓN: Corregir triggers de autenticación
-- Fecha: 2026-02-08
-- ============================================================

-- Corregir handle_new_user
-- Asegura que el perfil se cree correctamente al registrarse un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
   -- Forzar search_path para evitar problemas de seguridad
   SET search_path = public, auth;
   
   INSERT INTO public.profiles (id, email)
   VALUES (NEW.id, NEW.email)
   ON CONFLICT (id) DO NOTHING;
   
   RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corregir link_existing_reservations
-- Vincula reservas existentes (por email) al nuevo usuario registrado
CREATE OR REPLACE FUNCTION public.link_existing_reservations()
RETURNS TRIGGER AS $$
BEGIN
   -- Forzar search_path
   SET search_path = public;
   
   -- Actualizar reservas que coincidan con el email y no tengan user_id asignado
   UPDATE public.reservas r
   SET user_id = NEW.id
   WHERE r.user_id IS NULL
   AND EXISTS (
       SELECT 1 FROM public.clientes c
       WHERE c.id = r.cliente_id
       AND c.email = NEW.email
   );
   
   RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Asegurar que los triggers estén correctamente definidos (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_link_reservations ON auth.users;
CREATE TRIGGER on_auth_user_created_link_reservations
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_existing_reservations();
