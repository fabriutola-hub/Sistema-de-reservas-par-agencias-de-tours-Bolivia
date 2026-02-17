'use server'

import { createClient } from '@/lib/supabase/server'
import { enviarConfirmacionReserva } from '@/lib/actions/reserva'

// ============================================================
// TYPES
// ============================================================

export interface BookingInput {
    tourId: string
    fecha: string // yyyy-MM-dd format
    cliente: {
        nombre_completo: string
        email: string
        telefono: string
        ci: string
    }
    num_personas: number
    notas?: string
}

export interface BookingResult {
    success: boolean
    reservaId?: string
    clienteId?: string
    precioTotal?: number
    cuposRestantes?: number
    error?: string
    errorCode?: 'NO_AVAILABILITY' | 'OVERBOOKING' | 'TOUR_NOT_FOUND' | 'TRANSACTION_FAILED' | 'VALIDATION_ERROR'
    cuposDisponibles?: number
    cuposSolicitados?: number
}

// ============================================================
// VALIDATION
// ============================================================

function validateBookingInput(input: BookingInput): { valid: boolean; error?: string } {
    // Validate tourId
    if (!input.tourId || typeof input.tourId !== 'string') {
        return { valid: false, error: 'ID de tour inválido' }
    }

    // Validate fecha (yyyy-MM-dd format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!input.fecha || !dateRegex.test(input.fecha)) {
        return { valid: false, error: 'Fecha inválida' }
    }

    // Validate fecha is not in the past
    const selectedDate = new Date(input.fecha + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
        return { valid: false, error: 'No se puede reservar en fechas pasadas' }
    }

    // Validate cliente
    if (!input.cliente.nombre_completo || input.cliente.nombre_completo.trim().length < 2) {
        return { valid: false, error: 'Nombre completo es requerido' }
    }

    if (!input.cliente.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.cliente.email)) {
        return { valid: false, error: 'Email inválido' }
    }

    if (!input.cliente.telefono || input.cliente.telefono.trim().length < 6) {
        return { valid: false, error: 'Teléfono es requerido' }
    }

    if (!input.cliente.ci || input.cliente.ci.trim().length < 4) {
        return { valid: false, error: 'CI/Pasaporte es requerido' }
    }

    // Validate num_personas
    if (!input.num_personas || input.num_personas < 1 || input.num_personas > 50) {
        return { valid: false, error: 'Número de personas inválido (1-50)' }
    }

    return { valid: true }
}

// ============================================================
// MAIN BOOKING FUNCTION
// ============================================================

/**
 * Creates a booking transaction atomically.
 * 
 * This function:
 * 1. Validates all input on the server
 * 2. Uses a PostgreSQL function with FOR UPDATE lock to prevent race conditions
 * 3. Calculates price server-side (ignores any price from frontend)
 * 4. Creates/updates client, creates reservation, updates availability in one transaction
 * 5. Sends confirmation email asynchronously
 * 
 * @param input - Booking input data
 * @returns BookingResult with success status and reservation details or error
 */
export async function createBookingTransaction(input: BookingInput): Promise<BookingResult> {
    // ==========================================
    // 1. Validate input
    // ==========================================
    const validation = validateBookingInput(input)
    if (!validation.valid) {
        return {
            success: false,
            errorCode: 'VALIDATION_ERROR',
            error: validation.error
        }
    }

    try {
        const supabase = await createClient()

        // Cleanup any expired reservations to free up slots
        await supabase.rpc('cleanup_expired_reservations')

        // ==========================================
        // 2. Get current user (if logged in)
        // ==========================================
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || null

        // ==========================================
        // 3. Call atomic PostgreSQL function
        // ==========================================
        const { data, error } = await supabase.rpc('create_booking_atomic', {
            p_tour_id: input.tourId,
            p_fecha: input.fecha,
            p_cliente_nombre: input.cliente.nombre_completo.trim(),
            p_cliente_email: input.cliente.email.trim().toLowerCase(),
            p_cliente_telefono: input.cliente.telefono.trim(),
            p_cliente_ci: input.cliente.ci.trim(),
            p_num_personas: input.num_personas,
            p_notas: input.notas?.trim() || null,
            p_user_id: userId,
            p_canal_reserva: 'web' // Default to web for public bookings
        })

        // Handle RPC error
        if (error) {
            console.error('[Booking] RPC error:', error)
            return {
                success: false,
                errorCode: 'TRANSACTION_FAILED',
                error: 'Error al procesar la reserva. Por favor, intente nuevamente.'
            }
        }

        // Parse result from PostgreSQL function
        const result = data as BookingResult

        // ==========================================
        // 3. Handle success - send confirmation email
        // ==========================================
        if (result.success && result.reservaId) {
            // Send confirmation email asynchronously (non-blocking)
            enviarConfirmacionReserva(result.reservaId).catch((emailError) => {
                console.error('[Booking] Error sending confirmation email:', emailError)
                // Don't fail the booking if email fails
            })

            return {
                success: true,
                reservaId: result.reservaId,
                clienteId: result.clienteId,
                precioTotal: result.precioTotal,
                cuposRestantes: result.cuposRestantes
            }
        }

        // ==========================================
        // 4. Handle failure from PostgreSQL function
        // ==========================================
        return {
            success: false,
            errorCode: result.errorCode,
            error: result.error,
            cuposDisponibles: result.cuposDisponibles,
            cuposSolicitados: result.cuposSolicitados
        }

    } catch (err) {
        console.error('[Booking] Unexpected error:', err)
        return {
            success: false,
            errorCode: 'TRANSACTION_FAILED',
            error: 'Error inesperado. Por favor, intente nuevamente.'
        }
    }
}

export async function getTourPublic(id: string) {
    const supabase = await createClient()
    const { data: tour, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching tour:', error)
        return null
    }
    return tour
}
