-- ============================================================
-- MIGRACIÓN: Corregir Permisos de Lectura del Bucket
-- ============================================================

-- Permitir que CUALQUIERA vea la existencia del bucket 'comprobantes'
-- Esto soluciona el error "Bucket not found" del cliente JS
DROP POLICY IF EXISTS "Publico ve buckets" ON storage.buckets;
CREATE POLICY "Publico ve buckets"
ON storage.buckets FOR SELECT
TO public
USING (
  name = 'comprobantes'
);
