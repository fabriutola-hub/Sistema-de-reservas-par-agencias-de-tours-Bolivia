-- ============================================================
-- MIGRACIÓN: Habilitar Bucket de Imágenes de Tours (Corregido)
-- ============================================================

-- 1. Crear bucket 'tour-images' (singular, como en el código)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permisos del Bucket (para evitar "Bucket not found")
DROP POLICY IF EXISTS "Publico ve bucket tour-images" ON storage.buckets;
CREATE POLICY "Publico ve bucket tour-images"
ON storage.buckets FOR SELECT
TO public
USING (
  name = 'tour-images'
);

-- 3. PERMISOS DE OBJETOS

-- Ver imágenes: Todo el mundo
DROP POLICY IF EXISTS "Publico ve imagenes tour-images" ON storage.objects;
CREATE POLICY "Publico ve imagenes tour-images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'tour-images'
);

-- Gestionar imágenes: Solo Administradores
DROP POLICY IF EXISTS "Admins tour-images" ON storage.objects;
CREATE POLICY "Admins tour-images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'tour-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);
