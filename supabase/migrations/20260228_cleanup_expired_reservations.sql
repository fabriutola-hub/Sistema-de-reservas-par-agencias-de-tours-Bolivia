-- ============================================================
-- MIGRACIÓN: Función para limpiar reservas expiradas
-- Fecha: 2026-02-28
-- Desc: Auto-cancela reservas 'pendiente' sin comprobante
--       después de 10 minutos de creadas.
--       Restaura los cupos de disponibilidad.
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER := 0;
    v_reserva RECORD;
BEGIN
    -- Encontrar reservas pendientes sin comprobante con más de 10 minutos
    FOR v_reserva IN
        SELECT r.id, r.disponibilidad_id, r.num_personas
        FROM reservas r
        WHERE r.estado = 'pendiente'
          AND r.comprobante_url IS NULL
          AND r.created_at < NOW() - INTERVAL '10 minutes'
    LOOP
        -- Cancelar la reserva
        UPDATE reservas
        SET estado = 'cancelada',
            notas = COALESCE(notas, '') || 
                    CASE WHEN notas IS NOT NULL AND notas != '' THEN E'\n' ELSE '' END ||
                    '[Auto-cancelada: No se subió comprobante en 10 minutos]',
            updated_at = NOW()
        WHERE id = v_reserva.id;

        -- Restaurar cupos de disponibilidad
        IF v_reserva.disponibilidad_id IS NOT NULL THEN
            UPDATE disponibilidad
            SET cupos_disponibles = cupos_disponibles + v_reserva.num_personas
            WHERE id = v_reserva.disponibilidad_id;
        END IF;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Permisos: tanto anon como authenticated pueden llamar esta función
GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO anon, authenticated, service_role;

COMMENT ON FUNCTION cleanup_expired_reservations IS 'Auto-cancela reservas pendientes sin comprobante después de 10 minutos y restaura cupos de disponibilidad.';
