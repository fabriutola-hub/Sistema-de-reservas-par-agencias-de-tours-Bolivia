'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================================
// TYPES
// ============================================================

export interface Profile {
    id: string
    email: string
    nombre_completo: string | null
    telefono: string | null
    ci: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface ProfileUpdateInput {
    nombre_completo?: string
    telefono?: string
    ci?: string
}

export interface UserReservation {
    id: string
    codigo_reserva: string | null
    fecha_tour: string
    hora_tour: string | null
    num_personas: number
    precio_total: number
    estado: string
    metodo_pago: string | null
    comprobante_url: string | null
    notas: string | null
    created_at: string
    tour: {
        id: string
        nombre: string
        imagen_url: string | null
        duracion_horas: number | null
        destino: string | null
    }
}

// ============================================================
// GET PROFILE
// ============================================================

export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { data: null, error: 'No autenticado' }
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('[Profile] Error fetching profile:', error)
            return { data: null, error: 'Error al obtener perfil' }
        }

        return { data, error: null }
    } catch (err) {
        console.error('[Profile] Unexpected error:', err)
        return { data: null, error: 'Error inesperado' }
    }
}

// ============================================================
// UPDATE PROFILE
// ============================================================

export async function updateProfile(input: ProfileUpdateInput): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'No autenticado' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                nombre_completo: input.nombre_completo?.trim() || null,
                telefono: input.telefono?.trim() || null,
                ci: input.ci?.trim() || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            console.error('[Profile] Error updating profile:', error)
            return { success: false, error: 'Error al actualizar perfil' }
        }

        return { success: true, error: null }
    } catch (err) {
        console.error('[Profile] Unexpected error:', err)
        return { success: false, error: 'Error inesperado' }
    }
}

// ============================================================
// GET MY RESERVATIONS
// ============================================================

export async function getMyReservations(): Promise<{
    upcoming: UserReservation[];
    past: UserReservation[];
    error: string | null
}> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.log('[Profile] No authenticated user found')
            return { upcoming: [], past: [], error: 'No autenticado' }
        }

        console.log('[Profile] Fetching reservations for User ID:', user.id, 'Email:', user.email)

        // Cleanup expired reservations first
        await supabase.rpc('cleanup_expired_reservations')

        // Fetch reservations directly with RLS
        const { data: reservations, error } = await supabase
            .from('reservas')
            .select(`
                *,
                tour:tours (
                    id,
                    nombre,
                    imagen_url,
                    duracion_horas,
                    destino
                )
            `)
            .eq('user_id', user.id) // Filter by authenticated user ID
            .order('fecha_tour', { ascending: false })

        console.log('[Profile] Query Result - Error:', error)
        console.log('[Profile] Query Result - Count:', reservations?.length)

        if (error) {
            console.error('[Profile] Error fetching reservations:', error)
            return { upcoming: [], past: [], error: 'Error al obtener reservas' }
        }

        // Map result to UserReservation type
        const mappedReservations: UserReservation[] = (reservations || []).map((r: any) => {
            // Handle tour relation (could be array or object depending on Supabase client version/config)
            const tourData = Array.isArray(r.tour) ? r.tour[0] : r.tour

            return {
                id: r.id,
                // Generate a display code from the ID since the column doesn't exist
                codigo_reserva: r.id.substring(0, 8).toUpperCase(),
                fecha_tour: r.fecha_tour,
                hora_tour: r.hora_tour,
                num_personas: r.num_personas,
                precio_total: r.precio_total,
                estado: r.estado,
                metodo_pago: r.metodo_pago,
                comprobante_url: r.comprobante_url,
                notas: r.notas,
                created_at: r.created_at,
                tour: tourData ? {
                    id: tourData.id,
                    nombre: tourData.nombre,
                    imagen_url: tourData.imagen_url,
                    duracion_horas: tourData.duracion_horas,
                    destino: tourData.destino
                } : {
                    id: '',
                    nombre: 'Tour no disponible',
                    imagen_url: null,
                    duracion_horas: null,
                    destino: null
                }
            }
        })

        return splitReservations(mappedReservations)
    } catch (err) {
        console.error('[Profile] Unexpected error:', err)
        return { upcoming: [], past: [], error: 'Error inesperado' }
    }
}

// Helper to split reservations by date
function splitReservations(reservations: any[]): {
    upcoming: UserReservation[];
    past: UserReservation[];
    error: null
} {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming: UserReservation[] = []
    const past: UserReservation[] = []

    for (const r of reservations) {
        const tourDate = new Date(r.fecha_tour)
        const reservation: UserReservation = {
            ...r,
            tour: r.tour || { id: '', nombre: 'Tour', imagen_url: null, duracion_horas: null, destino: null }
        }

        if (tourDate >= today) {
            upcoming.push(reservation)
        } else {
            past.push(reservation)
        }
    }

    // Sort upcoming by date ascending (soonest first)
    upcoming.sort((a, b) => new Date(a.fecha_tour).getTime() - new Date(b.fecha_tour).getTime())

    return { upcoming, past, error: null }
}

// ============================================================
// GET SINGLE RESERVATION
// ============================================================

export async function getReservationById(reservaId: string): Promise<{
    data: UserReservation | null;
    error: string | null
}> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { data: null, error: 'No autenticado' }
        }

        const { data, error } = await supabase
            .from('reservas')
            .select(`
                id,
                codigo_reserva,
                fecha_tour,
                hora_tour,
                num_personas,
                precio_total,
                estado,
                metodo_pago,
                comprobante_url,
                notas,
                created_at,
                tour:tours (
                    id,
                    nombre,
                    imagen_url,
                    duracion_horas,
                    destino
                )
            `)
            .eq('id', reservaId)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('[Profile] Error fetching reservation:', error)
            return { data: null, error: 'Reserva no encontrada' }
        }

        // Handle tour as array (Supabase returns arrays for relations)
        const tourData = Array.isArray(data.tour) ? data.tour[0] : data.tour
        const defaultTour = { id: '', nombre: 'Tour', imagen_url: null, duracion_horas: null, destino: null }

        return {
            data: {
                ...data,
                tour: tourData || defaultTour
            } as UserReservation,
            error: null
        }
    } catch (err) {
        console.error('[Profile] Unexpected error:', err)
        return { data: null, error: 'Error inesperado' }
    }
}
