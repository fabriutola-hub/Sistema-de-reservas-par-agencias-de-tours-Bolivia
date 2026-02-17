-- ============================================================
-- MIGRACIÓN: Corregir get_reservas_admin RPC
-- Fecha: 2026-02-13
-- Desc: Mover comprobante_url al final y usar casts explícitos para evitar error de tipos
-- ============================================================

DROP FUNCTION IF EXISTS get_reservas_admin(text, uuid);

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
    user_id UUID,
    comprobante_url TEXT
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
        r.id::UUID,
        r.created_at::TIMESTAMPTZ,
        r.fecha_tour::DATE,
        NULL::TIME AS hora_tour,
        r.num_personas::INTEGER,
        r.precio_total::DECIMAL,
        r.estado::estado_reserva,
        r.metodo_pago::metodo_pago,
        r.notas::TEXT,
        CAST(NULL as VARCHAR) AS codigo_reserva,
        t.nombre::VARCHAR AS tour_nombre,
        t.destino::VARCHAR AS tour_destino,
        c.nombre_completo::VARCHAR AS cliente_nombre,
        c.email::VARCHAR AS cliente_email,
        c.telefono::VARCHAR AS cliente_telefono,
        r.user_id::UUID,
        r.comprobante_url::TEXT
    FROM reservas r
    LEFT JOIN tours t ON r.tour_id = t.id
    LEFT JOIN clientes c ON r.cliente_id = c.id
    WHERE 
        (estado_filter IS NULL OR r.estado::TEXT = estado_filter)
        AND (tour_id_filter IS NULL OR r.tour_id = tour_id_filter)
    ORDER BY r.created_at DESC;
END;
$$;
