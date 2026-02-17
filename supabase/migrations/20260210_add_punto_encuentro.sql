-- ============================================================
-- MIGRACIÓN: Agregar columna punto_encuentro faltante
-- Fecha: 2026-02-10
-- ============================================================

-- Agregar columna punto_encuentro a tours si no existe
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS punto_encuentro TEXT;

COMMENT ON COLUMN tours.punto_encuentro IS 'Lugar de encuentro para el inicio del tour';
