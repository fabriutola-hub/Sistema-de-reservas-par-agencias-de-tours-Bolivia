-- ============================================================
-- MIGRACIÓN: Configuración de Storage Buckets y Políticas
-- Fecha: 2026-02-07
-- ============================================================

-- 1. Crear bucket 'comprobantes'
-- Este bucket es público para permitir referencias, pero controlamos acceso vía RLS
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear bucket 'tours-images'
-- Este bucket es público para imágenes de tours
INSERT INTO storage.buckets (id, name, public)
VALUES ('tours-images', 'tours-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- POLÍTICAS DE SEGURIDAD (RLS) PARA STORAGE
-- ============================================================

-- Habilitar RLS en storage.objects si no está habilitado (por defecto lo está en Supabase)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- BUCKET: comprobantes
-- ------------------------------------------------------------

-- Política: Usuarios autenticados pueden subir sus propios comprobantes
DROP POLICY IF EXISTS "Usuarios autenticados suben comprobantes" ON storage.objects;
CREATE POLICY "Usuarios autenticados suben comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes' AND
  (storage.foldername(name))[1] != 'private' AND -- Opcional: prevenir carpetas privadas si se desea
  auth.uid() = owner -- El owner se asigna automáticamente al subir autenticado
);

-- Política: Usuarios pueden ver sus propios comprobantes
DROP POLICY IF EXISTS "Usuarios ven sus propios comprobantes" ON storage.objects;
CREATE POLICY "Usuarios ven sus propios comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes' AND
  auth.uid() = owner
);

-- Política: Administradores pueden ver todos los comprobantes
-- Usamos una subquery directa a user_roles para verificar si es admin o super_admin
DROP POLICY IF EXISTS "Admins ven todos los comprobantes" ON storage.objects;
CREATE POLICY "Admins ven todos los comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.activo = true
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- ------------------------------------------------------------
-- BUCKET: tours-images
-- ------------------------------------------------------------

-- Política: Acceso público de lectura para imágenes de tours
DROP POLICY IF EXISTS "Publico puede ver imagenes de tours" ON storage.objects;
CREATE POLICY "Publico puede ver imagenes de tours"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'tours-images'
);

-- Política: Administradores tienen control total sobre imágenes de tours
DROP POLICY IF EXISTS "Admins gestionan imagenes de tours" ON storage.objects;
CREATE POLICY "Admins gestionan imagenes de tours"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'tours-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.activo = true
    AND user_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'tours-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.activo = true
    AND user_roles.role IN ('admin', 'super_admin')
  )
);
