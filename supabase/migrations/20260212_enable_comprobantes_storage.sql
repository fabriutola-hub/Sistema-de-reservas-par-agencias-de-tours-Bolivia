-- ============================================================
-- MIGRACIÓN: Habilitar Bucket de Comprobantes
-- ============================================================

-- 1. Crear bucket 'comprobantes' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en storage.objects (por seguridad general)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Política: Permitir a CUALQUIERA (anon/auth) subir a 'comprobantes'
-- Esto es necesario porque la página de confirmación es pública
DROP POLICY IF EXISTS "Publico sube comprobantes" ON storage.objects;
CREATE POLICY "Publico sube comprobantes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'comprobantes'
);

-- 4. Política: Permitir a CUALQUIERA ver comprobantes
-- Necesario para que el admin pueda ver la imagen (ya que usa URL pública en <Image>)
-- y para que el usuario vea su propia subida si la app lo requiere
DROP POLICY IF EXISTS "Publico ve comprobantes" ON storage.objects;
CREATE POLICY "Publico ve comprobantes"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'comprobantes'
);

-- 5. Permitir update/delete solo a admins (opcional, por si acaso)
DROP POLICY IF EXISTS "Admins gestionan comprobantes" ON storage.objects;
CREATE POLICY "Admins gestionan comprobantes"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'comprobantes' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);
