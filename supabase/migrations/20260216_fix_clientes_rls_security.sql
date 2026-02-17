-- ============================================================
-- MIGRACIÓN: Fix RLS Security Vulnerability on Clientes Table
-- Fecha: 2026-02-16
-- Descripción: Elimina la política insegura que permite INSERT público
--              sin restricciones y la reemplaza con una política segura
--              que solo permite INSERT autenticado con validación.
-- ============================================================

-- PROBLEMA:
-- La policy "Cualquiera puede insertar clientes" permite WITH CHECK (true)
-- para roles anon y authenticated, lo que significa que cualquiera puede
-- insertar clientes con datos arbitrarios (spam/abuso).

-- SOLUCIÓN:
-- 1. Eliminar la política insegura de INSERT público
-- 2. Crear nueva política que solo permite INSERT a usuarios autenticados
-- 3. Validar campos requeridos: nombre_completo (no vacío)
-- 4. Validar al menos un método de contacto: email O telefono

-- ============================================================
-- Eliminar política insegura
-- ============================================================

DROP POLICY IF EXISTS "Cualquiera puede insertar clientes" ON clientes;

-- ============================================================
-- Crear política segura con validación
-- ============================================================

CREATE POLICY "Authenticated can insert valid clients"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Validar que nombre_completo no sea NULL ni vacío
    nombre_completo IS NOT NULL 
    AND nombre_completo != '' 
    -- Validar que tenga al menos un método de contacto
    AND (email IS NOT NULL OR telefono IS NOT NULL)
  );

-- ============================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================

COMMENT ON POLICY "Authenticated can insert valid clients" ON clientes IS 
'Permite INSERT solo a usuarios autenticados (authenticated role). '
'Valida que nombre_completo no esté vacío y que exista al menos un '
'método de contacto (email o teléfono). Previene spam y abuso.';

-- ============================================================
-- NOTAS IMPORTANTES:
-- ============================================================
-- 
-- IMPACTO EN FUNCIONALIDAD EXISTENTE:
-- - Los formularios públicos de reserva ya NO pueden insertar directamente
--   en la tabla clientes usando el rol anon.
-- - Las inserciones deben hacerse desde:
--   * Server Actions (Next.js)
--   * Edge Functions con service_role
--   * API Routes con autenticación
--
-- BENEFICIOS DE SEGURIDAD:
-- ✓ Previene spam y abuso de usuarios anónimos
-- ✓ Garantiza calidad de datos (nombre y contacto requeridos)
-- ✓ Solo personal autenticado puede crear clientes
-- ✓ Protege la integridad de la base de datos
--
-- ============================================================
