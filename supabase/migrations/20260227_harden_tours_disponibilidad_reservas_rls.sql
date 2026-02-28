-- ============================================================
-- MIGRACIÓN: Endurecer RLS en tours, disponibilidad y reservas
-- Fecha: 2026-02-27
-- Descripción: Restringe INSERT/UPDATE/DELETE en tours y
--   disponibilidad a solo admins (is_admin). Para reservas,
--   mantiene INSERT público (necesario para create_booking_atomic
--   RPC) pero restringe UPDATE/DELETE a admins.
-- ============================================================

-- ============================================================
-- TOURS: Solo admins pueden escribir
-- ============================================================

-- Eliminar policies permisivas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar tours" ON public.tours;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar tours" ON public.tours;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar tours" ON public.tours;

-- Crear policies restrictivas: solo admins
CREATE POLICY "Admins insertan tours"
  ON public.tours
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins actualizan tours"
  ON public.tours
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins eliminan tours"
  ON public.tours
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- DISPONIBILIDAD: Solo admins pueden escribir
-- ============================================================

-- Eliminar policy permisiva existente (FOR ALL)
DROP POLICY IF EXISTS "Usuarios autenticados gestionan disponibilidad" ON public.disponibilidad;

-- Crear policies restrictivas: solo admins
CREATE POLICY "Admins insertan disponibilidad"
  ON public.disponibilidad
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins actualizan disponibilidad"
  ON public.disponibilidad
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins eliminan disponibilidad"
  ON public.disponibilidad
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- RESERVAS: INSERT público se mantiene, UPDATE/DELETE solo admins
-- ============================================================

-- Eliminar policies permisivas existentes de escritura
DROP POLICY IF EXISTS "Autenticados actualizan reservas" ON public.reservas;
DROP POLICY IF EXISTS "Autenticados eliminan reservas" ON public.reservas;

-- Nota: "Cualquiera puede crear reservas" se MANTIENE porque:
-- - El formulario público usa create_booking_atomic (SECURITY DEFINER)
-- - Pero la policy de INSERT también es necesaria como fallback seguro

-- Crear policies restrictivas para UPDATE/DELETE: solo admins
CREATE POLICY "Admins actualizan reservas"
  ON public.reservas
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins eliminan reservas"
  ON public.reservas
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================
-- COMENTARIOS
-- ============================================================
COMMENT ON POLICY "Admins insertan tours" ON public.tours IS 
'Solo administradores pueden crear tours. Verifica rol via is_admin() SECURITY DEFINER.';

COMMENT ON POLICY "Admins insertan disponibilidad" ON public.disponibilidad IS 
'Solo administradores pueden crear disponibilidad. Verifica rol via is_admin() SECURITY DEFINER.';

COMMENT ON POLICY "Admins actualizan reservas" ON public.reservas IS 
'Solo administradores pueden modificar reservas. Verifica rol via is_admin() SECURITY DEFINER.';
