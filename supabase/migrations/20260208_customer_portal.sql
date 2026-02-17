-- ============================================================
-- MIGRACIÓN: Portal de Clientes
-- Fecha: 2026-02-08
-- Descripción: Tabla profiles, user_id en reservas, RLS policies
-- ============================================================

-- ============================================================
-- 1. TABLA: profiles
-- Vinculada a auth.users para datos del cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre_completo TEXT,
    telefono TEXT,
    ci TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario
COMMENT ON TABLE profiles IS 'Perfiles de clientes vinculados a auth.users';

-- ============================================================
-- 2. MODIFICAR: reservas
-- Añadir user_id opcional para usuarios registrados
-- ============================================================
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para búsqueda por user_id
CREATE INDEX IF NOT EXISTS idx_reservas_user ON reservas(user_id) WHERE user_id IS NOT NULL;

-- Comentario
COMMENT ON COLUMN reservas.user_id IS 'Usuario registrado que hizo la reserva (opcional, null para invitados)';

-- ============================================================
-- 3. TRIGGER: Crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe para recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. RLS: Políticas para profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND activo = true
        )
    );

-- ============================================================
-- 5. RLS: Políticas adicionales para reservas (acceso de usuarios)
-- ============================================================

-- Los usuarios pueden ver sus propias reservas (por user_id)
CREATE POLICY "Users can view own reservations by user_id"
    ON reservas FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Los usuarios pueden ver sus reservas por email del cliente vinculado
-- (para reservas hechas antes de registrarse)
CREATE POLICY "Users can view reservations by email"
    ON reservas FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM clientes c
            JOIN profiles p ON p.email = c.email
            WHERE c.id = reservas.cliente_id
            AND p.id = auth.uid()
        )
    );

-- ============================================================
-- 6. FUNCIÓN: Vincular reservas existentes al registrarse
-- Cuando un usuario se registra, vincular sus reservas por email
-- ============================================================
CREATE OR REPLACE FUNCTION link_existing_reservations()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar reservas existentes que coincidan por email del cliente
    UPDATE reservas r
    SET user_id = NEW.id
    WHERE r.user_id IS NULL
    AND EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = r.cliente_id
        AND c.email = NEW.email
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_link_reservations ON profiles;

CREATE TRIGGER on_profile_created_link_reservations
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION link_existing_reservations();

-- ============================================================
-- 7. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================
COMMENT ON FUNCTION handle_new_user IS 'Crea automáticamente un perfil cuando un usuario se registra';
COMMENT ON FUNCTION link_existing_reservations IS 'Vincula reservas existentes al nuevo usuario basándose en email';
