-- ============================================================
-- MIGRACIÓN: Mejoras CMS y corrección de permisos
-- Fecha: 2026-02-09
-- ============================================================

-- 1. Agregar columnas a la tabla tours
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS galeria TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS itinerario JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tours.galeria IS 'Array de URLs de imágenes para la galería';
COMMENT ON COLUMN tours.itinerario IS 'Lista detallada de actividades por día (jsonb)';

-- 2. Función segura para obtener reservas (Admin)
-- Bypass RLS para obtener datos completos de reservas
CREATE OR REPLACE FUNCTION get_reservas_admin(
    estado_filter TEXT DEFAULT NULL,
    tour_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    fecha_tour DATE,
    hora_tour TIME,
    num_personas INTEGER,
    precio_total DECIMAL,
    estado estado_reserva,
    metodo_pago metodo_pago,
    notas TEXT,
    codigo_reserva VARCHAR,
    tour_nombre VARCHAR,
    tour_destino VARCHAR,
    cliente_nombre VARCHAR,
    cliente_email VARCHAR,
    cliente_telefono VARCHAR,
    user_id UUID
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar si es admin (usando la función existente is_admin o user_roles)
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND activo = true
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        r.id,
        r.created_at,
        r.fecha_tour,
        r.hora_tour,
        r.num_personas,
        r.precio_total,
        r.estado,
        r.metodo_pago,
        r.notas,
        r.codigo_reserva,
        t.nombre AS tour_nombre,
        t.destino AS tour_destino,
        c.nombre_completo AS cliente_nombre,
        c.email AS cliente_email,
        c.telefono AS cliente_telefono,
        r.user_id
    FROM reservas r
    LEFT JOIN tours t ON r.tour_id = t.id
    LEFT JOIN clientes c ON r.cliente_id = c.id
    WHERE 
        (estado_filter IS NULL OR r.estado::TEXT = estado_filter)
        AND (tour_id_filter IS NULL OR r.tour_id = tour_id_filter)
    ORDER BY r.created_at DESC;
END;
$$;

-- 3. Función segura para obtener clientes (Admin)
CREATE OR REPLACE FUNCTION get_clientes_admin(
    search_term TEXT DEFAULT NULL
)
RETURNS SETOF clientes
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar admin
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND activo = true
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    IF search_term IS NOT NULL AND search_term != '' THEN
        RETURN QUERY
        SELECT * FROM clientes
        WHERE 
            nombre_completo ILIKE '%' || search_term || '%'
            OR email ILIKE '%' || search_term || '%'
            OR ci ILIKE '%' || search_term || '%'
        ORDER BY created_at DESC;
    ELSE
        RETURN QUERY
        SELECT * FROM clientes
        ORDER BY created_at DESC;
    END IF;
END;
$$;
