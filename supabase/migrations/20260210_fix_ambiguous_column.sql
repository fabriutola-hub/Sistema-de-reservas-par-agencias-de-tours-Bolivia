-- ============================================================
-- MIGRACIÓN: Corrección de error de ambigüedad en RPCs
-- Fecha: 2026-02-10
-- ============================================================

-- Corregir get_reservas_admin para evitar ambigüedad con user_id
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
    -- Verificar si es admin con alias explícito para evitar colisión con el parámetro de salida user_id
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

-- Corregir get_clientes_admin por si acaso (aunque devuelve SETOF clientes, no TABLE con parametros nombrados, pero mejor prevenir)
-- En este caso devuelve SETOF clientes, por lo que no hay variables de salida con nombres conflictivos. 
-- Pero el check de seguridad es bueno estandarizarlo.

CREATE OR REPLACE FUNCTION get_clientes_admin(
    search_term TEXT DEFAULT NULL
)
RETURNS SETOF clientes
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar admin con alias
    IF NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.activo = true
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
