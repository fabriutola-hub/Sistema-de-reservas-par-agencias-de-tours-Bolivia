'use server'

import { createClient } from '@/lib/supabase/server'

export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    // Verify there's an authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return {
            success: false,
            error: 'No hay una sesión activa. Solicita un nuevo enlace de recuperación.'
        }
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (updateError) {
        if (updateError.message.includes('same as') || updateError.message.includes('same_password')) {
            return { success: false, error: 'La nueva contraseña debe ser diferente a la anterior.' }
        }
        if (updateError.message.includes('weak')) {
            return { success: false, error: 'La contraseña es muy débil.' }
        }
        return { success: false, error: `Error al actualizar: ${updateError.message}` }
    }

    // Sign out after successful update
    await supabase.auth.signOut()

    return { success: true, error: null }
}
