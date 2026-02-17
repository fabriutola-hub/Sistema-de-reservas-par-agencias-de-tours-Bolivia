-- ============================================================
-- MIGRACIÓN: Agregar canal de reserva y soporte para reservas manuales
-- Fecha: 2026-02-14
-- Desc: 
-- 1. Agregar columna canal_reserva a la tabla reservas
-- 2. Actualizar create_booking_atomic para aceptar canal (web, whatsapp, etc.)
-- 3. Actualizar get_reservas_admin para devolver canal_reserva
-- ============================================================

-- 0. Agregar columna canal_reserva
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        AND column_name = 'canal_reserva'
    ) THEN
        ALTER TABLE reservas ADD COLUMN canal_reserva TEXT DEFAULT 'web';
    END IF;
END $$;

-- 1. Agregar 'qr' al enum metodo_pago si no existe
-- Nota: Alterar enums en PostgreSQL dentro de una transacción/bloque DO puede ser complejo si se usa en otras tablas.
-- Intentaremos agregarlo de forma segura.
DO $$
BEGIN
    -- Revisar si el valor 'qr' ya existe en el enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname = 'metodo_pago' AND e.enumlabel = 'qr'
    ) THEN
        ALTER TYPE metodo_pago ADD VALUE 'qr';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo agregar qr al enum metodo_pago: %', SQLERRM;
END $$;

-- 2. Actualizar create_booking_atomic
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_tour_id UUID,
    p_fecha DATE,
    p_cliente_nombre TEXT,
    p_cliente_email TEXT,
    p_cliente_telefono TEXT,
    p_cliente_ci TEXT,
    p_num_personas INT,
    p_notas TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_canal_reserva TEXT DEFAULT 'web' -- Nuevo parámetro
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
    -- 6. Crear la reserva
    -- ==========================================
    INSERT INTO reservas (
        tour_id, 
        cliente_id, 
        disponibilidad_id,
        fecha_tour,
        hora_tour,
        num_personas, 
        precio_total, 
        estado, 
        notas,
        user_id,
        canal_reserva  -- Nuevo campo
    ) VALUES (
        p_tour_id, 
        v_cliente_id, 
        v_disp.id,
        p_fecha,
        v_disp.hora_salida,
        p_num_personas, 
        v_precio_total, 
        'pendiente', 
        p_notas,
        p_user_id,
        p_canal_reserva
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

-- 3. Actualizar get_reservas_admin
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
    canal_reserva TEXT, -- Nuevo campo de retorno
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
    -- Vefiricar rol admin (asumimos lógica existente o simplificada)
    -- Omitimos chequeo estricto de user_roles si ya estaba validado en capa superior o RLS,
    -- pero mantenemos consistencia con versión anterior si existía.
    -- (Nota: En la versión anterior se hacía chequeo explícito, lo mantendremos si es posible,
    --  pero para evitar errores de dependencia circular o falta de contexto auth.uid(),
    --  confiaremos en que quien llama esto tiene permisos o se maneja por RLS.
    --  Sin embargo, la versión previa tenía un IF NOT EXISTS... RAISE EXCEPTION 'Acceso denegado'.
    --  Lo mantendremos para seguridad.)

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
        r.hora_tour::TIME,
        r.num_personas::INTEGER,
        r.precio_total::DECIMAL,
        r.estado::estado_reserva,
        r.metodo_pago::metodo_pago,
        r.notas::TEXT,
        r.codigo_reserva::VARCHAR,
        r.canal_reserva::TEXT, -- Retornar canal
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
