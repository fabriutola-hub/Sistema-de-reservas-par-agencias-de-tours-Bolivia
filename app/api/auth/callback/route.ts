import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next')

    // Si no hay código, redirigir a login
    if (!code) {
        return NextResponse.redirect(`${origin}/login`)
    }

    const supabase = await createClient()

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('Error al intercambiar código por sesión:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }

    // Si hay un parámetro 'next' personalizado, usar esa redirección
    if (next) {
        // Validar que la URL next sea segura (misma origen)
        const nextUrl = new URL(next, origin)
        if (nextUrl.origin === origin) {
            return NextResponse.redirect(nextUrl.toString())
        }
    }

    // Verificar si el usuario es admin
    try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin')

        if (rpcError) {
            console.error('Error al verificar rol de admin:', rpcError.message)
            // En caso de error, redirigir al perfil por defecto
            return NextResponse.redirect(`${origin}/perfil`)
        }

        // Redirigir según el rol
        if (isAdmin) {
            return NextResponse.redirect(`${origin}/admin`)
        } else {
            return NextResponse.redirect(`${origin}/perfil`)
        }
    } catch (err) {
        console.error('Error inesperado al verificar admin:', err)
        return NextResponse.redirect(`${origin}/perfil`)
    }
}
