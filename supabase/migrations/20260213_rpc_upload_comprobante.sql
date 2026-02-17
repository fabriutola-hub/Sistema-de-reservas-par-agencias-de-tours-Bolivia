-- ============================================================
-- MIGRACIÓN: RPC para subir comprobante de pago de forma segura
-- Fecha: 2026-02-13
-- Desc: Permite a usuarios anónimos actualizar la URL del comprobante
-- ============================================================

CREATE OR REPLACE FUNCTION subir_comprobante(
    p_reserva_id UUID,
    p_url TEXT
)
RETURNS JSONB
SECURITY DEFINER -- Bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_reserva_exists BOOLEAN;
BEGIN
    -- Validar que la reserva existe
    SELECT EXISTS (SELECT 1 FROM reservas WHERE id = p_reserva_id) INTO v_reserva_exists;
    
    IF NOT v_reserva_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Reserva no encontrada');
    END IF;

    -- Actualizar la reserva
    UPDATE reservas
    SET 
        comprobante_url = p_url,
        updated_at = NOW()
        -- Podríamos cambiar el estado a 'pendiente' si estaba en otro estado, 
        -- o dejarlo como está para revisión del admin.
        -- estado = 'pendiente' 
    WHERE id = p_reserva_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
