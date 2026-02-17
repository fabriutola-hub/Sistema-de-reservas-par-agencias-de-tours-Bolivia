-- ============================================================
-- MIGRACIÓN: Corregir lógica de hora de salida en reservas
-- Fecha: 2026-02-13
-- Desc: 
-- 1. Agregar columna hora_tour a la tabla reservas
-- 2. Actualizar create_booking_atomic para guardar hora_tour y disponibilidad_id
-- 3. Actualizar get_reservas_admin para devolver la hora_tour correcta
-- 4. Parchado de datos existentes
-- ============================================================

-- 0. Agregar columna faltante
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        AND column_name = 'hora_tour'
    ) THEN
        ALTER TABLE reservas ADD COLUMN hora_tour TIME;
    END IF;
END $$;

-- 1. Actualizar create_booking_atomic
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_tour_id UUID,
    p_fecha DATE,
    p_cliente_nombre TEXT,
    p_cliente_email TEXT,
    p_cliente_telefono TEXT,
    p_cliente_ci TEXT,
    p_num_personas INT,
    p_notas TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tour tours%ROWTYPE;
    v_disp disponibilidad%ROWTYPE;
    v_cliente_id UUID;
    v_reserva_id UUID;
    v_precio_total DECIMAL(10,2);
BEGIN
    -- ==========================================
    -- 1. Validar que el tour existe y está activo
    -- ==========================================
    SELECT * INTO v_tour 
    FROM tours 
    WHERE id = p_tour_id AND activo = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false, 
            'errorCode', 'TOUR_NOT_FOUND',
            'error', 'El tour no existe o no está disponible'
        );
    END IF;

    -- ==========================================
    -- 2. Bloquear y verificar disponibilidad
    -- FOR UPDATE previene race conditions
    -- ==========================================
    SELECT * INTO v_disp 
    FROM disponibilidad 
    WHERE tour_id = p_tour_id 
      AND fecha = p_fecha
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false, 
            'errorCode', 'NO_AVAILABILITY',
            'error', 'No hay disponibilidad para esta fecha'
        );
    END IF;

    -- ==========================================
    -- 3. Verificar cupos suficientes
    -- ==========================================
    IF v_disp.cupos_disponibles < p_num_personas THEN
        RETURN json_build_object(
            'success', false, 
            'errorCode', 'OVERBOOKING',
            'error', 'No hay suficientes cupos disponibles',
            'cuposDisponibles', v_disp.cupos_disponibles,
            'cuposSolicitados', p_num_personas
        );
    END IF;

    -- ==========================================
    -- 4. Upsert cliente (crear o actualizar por email)
    -- ==========================================
    INSERT INTO clientes (nombre_completo, email, telefono, ci)
    VALUES (p_cliente_nombre, p_cliente_email, p_cliente_telefono, p_cliente_ci)
    ON CONFLICT (email) WHERE email IS NOT NULL
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        telefono = EXCLUDED.telefono,
        ci = EXCLUDED.ci
    RETURNING id INTO v_cliente_id;

    -- ==========================================
    -- 5. Calcular precio en el servidor
    -- ==========================================
    v_precio_total := v_tour.precio_por_persona * p_num_personas;

    -- ==========================================
    -- 6. Crear la reserva (CON HORA Y DISPONIBILIDAD_ID)
    -- ==========================================
    INSERT INTO reservas (
        tour_id, 
        cliente_id, 
        disponibilidad_id, -- Nuevo campo
        fecha_tour,
        hora_tour,         -- Nuevo campo
        num_personas, 
        precio_total, 
        estado, 
        notas,
        user_id
    ) VALUES (
        p_tour_id, 
        v_cliente_id, 
        v_disp.id,         -- ID de disponibilidad
        p_fecha,
        v_disp.hora_salida,-- Hora de salida
        p_num_personas, 
        v_precio_total, 
        'pendiente', 
        p_notas,
        p_user_id
    ) RETURNING id INTO v_reserva_id;

    -- ==========================================
    -- 7. Decrementar cupos disponibles
    -- ==========================================
    UPDATE disponibilidad 
    SET cupos_disponibles = cupos_disponibles - p_num_personas
    WHERE id = v_disp.id;

    -- ==========================================
    -- 8. Retornar éxito con datos de la reserva
    -- ==========================================
    RETURN json_build_object(
        'success', true, 
        'reservaId', v_reserva_id,
        'clienteId', v_cliente_id,
        'precioTotal', v_precio_total,
        'cuposRestantes', v_disp.cupos_disponibles - p_num_personas
    );

EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error en create_booking_atomic: % %', SQLERRM, SQLSTATE;
    RETURN json_build_object(
        'success', false, 
        'errorCode', 'TRANSACTION_FAILED',
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- 2. Actualizar get_reservas_admin
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
    -- Verificar si es admin
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
        r.hora_tour::TIME, -- Usar el valor real de la tabla
        r.num_personas::INTEGER,
        r.precio_total::DECIMAL,
        r.estado::estado_reserva,
        r.metodo_pago::metodo_pago,
        r.notas::TEXT,
        r.codigo_reserva::VARCHAR,
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

-- 3. Parchado de datos existentes
-- Actualizar reservas que tinen hora_tour NULL basándose en la disponibilidad
UPDATE reservas r
SET 
    hora_tour = d.hora_salida,
    disponibilidad_id = d.id
FROM disponibilidad d
WHERE r.tour_id = d.tour_id 
  AND r.fecha_tour = d.fecha
  AND r.hora_tour IS NULL;
