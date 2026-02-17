'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminRole = 'admin' | 'super_admin'

export interface AdminUser {
    id: string
    user_id: string
    email: string
    role: AdminRole
    nombre: string | null
    activo: boolean
    fecha_invitacion: string | null
    fecha_aceptacion: string | null
    created_at: string
}

// ============ GET ADMIN USERS ============

/**
 * Get all admin users
 * Solo super_admins pueden ver la lista completa de usuarios
 * Usa la función RPC get_all_admin_users() con SECURITY DEFINER
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
    const supabase = await createClient()

    // Primero verificar si el usuario actual es super_admin usando RPC
    const { data: isSuperAdminResult, error: authCheckError } = await supabase.rpc('is_super_admin')

    if (authCheckError) {
        console.error('Error verificando permisos:', authCheckError)
        return []
    }

    if (!isSuperAdminResult) {
        // Si no es super_admin, obtenemos la información del usuario actual
        // Esto permite que un admin regular vea su propia fila en la tabla
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return []

        // Consultar solo el registro del usuario actual
        const { data: currentUserRecord, error: userError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (userError || !currentUserRecord) {
            return []
        }

        return [currentUserRecord]
    }

    // Usar la función RPC segura para obtener todos los usuarios
    const { data, error } = await supabase.rpc('get_all_admin_users')

    if (error) {
        // Manejar error de RLS o acceso denegado
        if (error.code === '42501' || error.message.includes('Acceso denegado')) {
            console.warn('Acceso denegado al listar usuarios admin')
            return []
        }
        console.error('Error fetching admin users:', error)
        // En caso de error, intentar fallback al usuario actual
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: currentUserRecord } = await supabase
                    .from('user_roles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()
                if (currentUserRecord) return [currentUserRecord]
            }
        } catch (e) {
            // Ignorar errores en fallback
        }
        return []
    }

    return data || []
}

/**
 * Get current user's role
 * Usa funciones RPC con SECURITY DEFINER para mayor seguridad
 */
export async function getCurrentUserRole(): Promise<{ role: AdminRole | null; isSuperAdmin: boolean }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { role: null, isSuperAdmin: false }
    }

    // Usar funciones RPC seguras en lugar de consultar directamente la tabla
    const [roleResult, superAdminResult] = await Promise.all([
        supabase.rpc('get_user_role'),
        supabase.rpc('is_super_admin')
    ])

    // Manejar errores de RPC silenciosamente
    if (roleResult.error) {
        console.error('Error obteniendo rol de usuario:', roleResult.error)
        return { role: null, isSuperAdmin: false }
    }

    const roleValue = roleResult.data as string
    const isSuperAdminValue = superAdminResult.data === true

    // Convertir 'none' a null
    const role: AdminRole | null = roleValue === 'none' ? null : (roleValue as AdminRole)

    return {
        role,
        isSuperAdmin: isSuperAdminValue
    }
}

/**
 * Check if current user is super admin
 * Usa la función RPC is_super_admin con SECURITY DEFINER
 */
export async function isSuperAdmin(): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('is_super_admin')

    if (error) {
        console.error('Error verificando super_admin:', error)
        return false
    }

    return data === true
}

// ============ INVITE ADMIN ============

/**
 * Invite a new admin user by email
 * Uses Supabase Auth invite to send magic link
 */
export async function inviteAdmin(
    email: string,
    role: AdminRole = 'admin',
    nombre?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Verify current user is super_admin
    const { isSuperAdmin: canInvite } = await getCurrentUserRole()
    if (!canInvite) {
        return { success: false, error: 'Solo los Super Admins pueden invitar usuarios' }
    }

    // Check if email already has a role
    const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

    if (existingRole) {
        return { success: false, error: 'Este email ya tiene permisos de administrador' }
    }

    // Get current user for invitado_por field
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Try to invite user via Supabase Auth
    // Note: This requires the service role key, which is handled server-side
    // For now, we'll create a pending invitation record

    // First check if user already exists in auth
    // We can't query auth.users directly, so we'll just create the role record

    const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Placeholder until user signs up
            email: email.toLowerCase(),
            role,
            nombre: nombre || null,
            activo: false, // Will be activated when user accepts invitation
            invitado_por: currentUser?.id,
            fecha_invitacion: new Date().toISOString()
        })

    if (insertError) {
        console.error('Error creating invitation:', insertError)
        return { success: false, error: 'Error al crear la invitación' }
    }

    // In a production app, you would also:
    // 1. Use Supabase Admin API to send invite email
    // 2. Or send a custom email with a signup link

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// ============ UPDATE ADMIN ============

/**
 * Update an admin user's role
 */
export async function updateAdminRole(
    userId: string,
    role: AdminRole
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Verify current user is super_admin
    const { isSuperAdmin: canUpdate } = await getCurrentUserRole()
    if (!canUpdate) {
        return { success: false, error: 'Solo los Super Admins pueden cambiar roles' }
    }

    // Get current user to prevent self-demotion
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Get the target user's record
    const { data: targetUser } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('id', userId)
        .single()

    // Prevent super_admin from demoting themselves
    if (targetUser?.user_id === currentUser?.id && role !== 'super_admin') {
        return { success: false, error: 'No puedes cambiar tu propio rol' }
    }

    const { error } = await supabase
        .from('user_roles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

    if (error) {
        console.error('Error updating role:', error)
        return { success: false, error: 'Error al actualizar el rol' }
    }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

/**
 * Activate an admin user (when they accept invitation)
 */
export async function activateAdmin(
    email: string,
    authUserId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('user_roles')
        .update({
            user_id: authUserId,
            activo: true,
            fecha_aceptacion: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .eq('activo', false)

    if (error) {
        console.error('Error activating admin:', error)
        return { success: false, error: 'Error al activar el usuario' }
    }

    return { success: true }
}

// ============ REMOVE ADMIN ============

/**
 * Remove an admin user's access
 */
export async function removeAdmin(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Verify current user is super_admin
    const { isSuperAdmin: canRemove } = await getCurrentUserRole()
    if (!canRemove) {
        return { success: false, error: 'Solo los Super Admins pueden eliminar administradores' }
    }

    // Get current user to prevent self-deletion
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Get the target user's record
    const { data: targetUser } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('id', userId)
        .single()

    // Prevent deleting yourself
    if (targetUser?.user_id === currentUser?.id) {
        return { success: false, error: 'No puedes eliminarte a ti mismo' }
    }

    // Delete the role record (or deactivate)
    const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userId)

    if (error) {
        console.error('Error removing admin:', error)
        return { success: false, error: 'Error al eliminar el administrador' }
    }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// ============ BOOTSTRAP FIRST ADMIN ============

/**
 * Create the first super_admin if none exists
 * This should be called when the first user signs in
 */
export async function bootstrapFirstAdmin(): Promise<{ success: boolean; isFirstAdmin: boolean }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, isFirstAdmin: false }
    }

    // Check if any admins exist
    const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
        // Check if current user already has a role
        const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existingRole) {
            return { success: true, isFirstAdmin: false }
        }

        // Check for pending invitation
        const { data: pendingInvite } = await supabase
            .from('user_roles')
            .select('id')
            .eq('email', user.email?.toLowerCase())
            .eq('activo', false)
            .single()

        if (pendingInvite) {
            // Activate the pending invitation
            await activateAdmin(user.email!, user.id)
            return { success: true, isFirstAdmin: false }
        }

        return { success: false, isFirstAdmin: false }
    }

    // No admins exist, make current user super_admin
    const { error } = await supabase
        .from('user_roles')
        .insert({
            user_id: user.id,
            email: user.email?.toLowerCase() || '',
            role: 'super_admin',
            nombre: user.user_metadata?.full_name || user.email?.split('@')[0],
            activo: true,
            fecha_aceptacion: new Date().toISOString()
        })

    if (error) {
        console.error('Error bootstrapping admin:', error)
        return { success: false, isFirstAdmin: true }
    }

    revalidatePath('/admin/configuracion')
    return { success: true, isFirstAdmin: true }
}
