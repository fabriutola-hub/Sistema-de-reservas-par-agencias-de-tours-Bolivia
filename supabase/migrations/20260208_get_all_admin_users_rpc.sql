-- ============================================================
-- MIGRACIÓN: Función RPC para obtener todos los admins
-- Fecha: 2026-02-08
-- Solo super_admins pueden ejecutar esta función
-- ============================================================

-- ============================================================
-- FUNCIÓN: get_all_admin_users
-- Retorna todos los usuarios admin con SECURITY DEFINER
-- Solo ejecutable por super_admins
-- ============================================================
CREATE OR REPLACE FUNCTION get_all_admin_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email VARCHAR(255),
  role TEXT,
  nombre VARCHAR(255),
  activo BOOLEAN,
  fecha_invitacion TIMESTAMPTZ,
  fecha_aceptacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verificar que el usuario actual sea super_admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado: Solo super_admins pueden ver todos los usuarios';
  END IF;

  -- Retornar todos los usuarios admin
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.email,
    ur.role::TEXT,
    ur.nombre,
    ur.activo,
    ur.fecha_invitacion,
    ur.fecha_aceptacion,
    ur.created_at
  FROM user_roles ur
  ORDER BY ur.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_all_admin_users() IS 'Obtiene todos los usuarios admin. Solo ejecutable por super_admins.';
