-- ============================================================
-- MIGRACIÓN: Tabla de roles de usuario para administración
-- Fecha: 2026-02-07
-- ============================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: Roles de administrador
-- ============================================================
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLA: user_roles
-- Almacena los roles de administrador para usuarios de Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  role admin_role DEFAULT 'admin',
  nombre VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  invitado_por UUID, -- ID del usuario que envió la invitación
  fecha_invitacion TIMESTAMPTZ,
  fecha_aceptacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_activo ON user_roles(activo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Solo super_admins pueden ver todos los roles
DROP POLICY IF EXISTS "Super admins pueden ver todos los roles" ON user_roles;
CREATE POLICY "Super admins pueden ver todos los roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.activo = true
    )
    OR user_id = auth.uid()
  );

-- Solo super_admins pueden insertar roles, O cualquiera si la tabla está vacía (bootstrapping)
DROP POLICY IF EXISTS "Super admins pueden insertar roles" ON user_roles;
CREATE POLICY "Super admins pueden insertar roles o bootstrap"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COUNT(*) FROM user_roles) = 0
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.activo = true
    )
  );

-- Solo super_admins pueden actualizar roles
DROP POLICY IF EXISTS "Super admins pueden actualizar roles" ON user_roles;
CREATE POLICY "Super admins pueden actualizar roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.activo = true
    )
  );

-- Solo super_admins pueden eliminar roles  
DROP POLICY IF EXISTS "Super admins pueden eliminar roles" ON user_roles;
CREATE POLICY "Super admins pueden eliminar roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.activo = true
    )
    -- No pueden eliminarse a sí mismos
    AND user_id != auth.uid()
  );

-- ============================================================
-- FUNCIÓN: Contar admins (Security Definer para bypass RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM user_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: Verificar si un usuario tiene rol de admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: Verificar si un usuario es super_admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'super_admin'
    AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: Obtener el rol de un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role
  FROM user_roles 
  WHERE user_id = check_user_id 
  AND activo = true;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMENTARIOS
-- ============================================================
COMMENT ON TABLE user_roles IS 'Roles de administrador para usuarios de Supabase Auth';
COMMENT ON COLUMN user_roles.user_id IS 'ID del usuario en auth.users';
COMMENT ON COLUMN user_roles.role IS 'Rol del usuario: admin o super_admin';
COMMENT ON COLUMN user_roles.invitado_por IS 'ID del super_admin que envió la invitación';
