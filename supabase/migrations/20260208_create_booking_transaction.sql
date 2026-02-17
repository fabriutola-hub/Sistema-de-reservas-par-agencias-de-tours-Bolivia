-- ============================================================
-- BOOKING TRANSACTION FUNCTION
-- Atomic, transactional booking with race condition prevention
-- ============================================================

-- Drop existing function if it exists (to allow recreation)
DROP FUNCTION IF EXISTS create_booking_atomic(uuid, date, text, text, text, text, integer, text);
DROP FUNCTION IF EXISTS create_booking_atomic(uuid, date, text, text, text, text, integer, text, uuid);

-- Create the atomic booking function
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
    -- (ignora cualquier precio del frontend)
    -- ==========================================
    v_precio_total := v_tour.precio_por_persona * p_num_personas;

    -- ==========================================
    -- 6. Crear la reserva
    -- Uses only columns that exist in the reservas table:
    -- tour_id, cliente_id, fecha_tour, num_personas, precio_total, estado, notas, user_id
    -- ==========================================
    INSERT INTO reservas (
        tour_id, 
        cliente_id, 
        fecha_tour,
        num_personas, 
        precio_total, 
        estado, 
        notas,
        user_id
    ) VALUES (
        p_tour_id, 
        v_cliente_id, 
        p_fecha,
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
    -- Loguear el error para depuración
    RAISE LOG 'Error en create_booking_atomic: % %', SQLERRM, SQLSTATE;

    -- Capturar cualquier error y retornar JSON estructurado
    RETURN json_build_object(
        'success', false, 
        'errorCode', 'TRANSACTION_FAILED',
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_booking_atomic(UUID, DATE, TEXT, TEXT, TEXT, TEXT, INT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic(UUID, DATE, TEXT, TEXT, TEXT, TEXT, INT, TEXT, UUID) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION create_booking_atomic IS 'Atomic booking function that handles tour reservations with race condition prevention using FOR UPDATE locks.';
