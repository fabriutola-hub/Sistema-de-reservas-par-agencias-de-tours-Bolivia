-- ============================================================
-- MIGRACIÓN: Corrección de columnas faltantes en get_reservas_admin
-- Fecha: 2026-02-10
-- ============================================================

-- Corregir get_reservas_admin para manejar columnas faltantes en la tabla reservas real
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
    -- Verificar si es admin con alias explícito
    IF NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.activo = true
    ) THEN
        RAISE EXCEPTION 'Acceso denegado';
    END IF;

    RETURN QUERY
    SELECT 
        r.id,
        r.created_at,
        r.fecha_tour,
        NULL::TIME as hora_tour, -- Columna no existe en tabla real
        r.num_personas,
        r.precio_total,
        r.estado,
        r.metodo_pago,
        r.notas,
        CAST(NULL as VARCHAR) as codigo_reserva, -- Columna no existe en tabla real
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
