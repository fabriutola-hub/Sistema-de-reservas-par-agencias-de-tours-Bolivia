-- ============================================================
-- MIGRACIÓN: Eliminar tabla legacy admin_users
-- Fecha: 2026-02-16
-- 
-- La tabla admin_users fue creada manualmente en el dashboard
-- pero NUNCA fue utilizada por el código del proyecto.
-- Todo el sistema de roles usa la tabla user_roles (con RLS
-- y policies correctamente configurados).
--
-- admin_users tenía RLS habilitado pero SIN policies,
-- lo que bloqueaba todo acceso y generaba advisories de seguridad.
--
-- Solución: eliminar la tabla y su enum asociado.
-- ============================================================

-- 1. Eliminar la tabla legacy (0 filas, sin dependencias)
DROP TABLE IF EXISTS public.admin_users;

-- 2. Eliminar el enum rol_admin que solo usaba admin_users
--    (user_roles usa el enum admin_role, no rol_admin)
DROP TYPE IF EXISTS public.rol_admin;
