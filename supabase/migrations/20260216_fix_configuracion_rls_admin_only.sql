-- ============================================================
-- Migración: Restringir modificación de "configuracion" solo a admins
-- Fecha: 2026-02-16
-- Descripción: Elimina la policy permisiva que permitía a cualquier
--   usuario autenticado modificar la tabla configuracion y la reemplaza
--   con una policy que solo permite modificaciones a administradores
--   usando is_admin(auth.uid()). Se mantiene la lectura pública.
-- ============================================================

-- 1. Eliminar la policy permisiva existente
DROP POLICY IF EXISTS "Autenticados modifican configuracion" ON public.configuracion;

-- 2. Crear nueva policy: solo admins pueden INSERT
CREATE POLICY "Admins insertan configuracion"
  ON public.configuracion
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- 3. Crear nueva policy: solo admins pueden UPDATE
CREATE POLICY "Admins actualizan configuracion"
  ON public.configuracion
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 4. Crear nueva policy: solo admins pueden DELETE
CREATE POLICY "Admins eliminan configuracion"
  ON public.configuracion
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
