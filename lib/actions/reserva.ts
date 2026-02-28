'use server'

import { createClient } from '@/lib/supabase/server'
import { enviarEmailConfirmacion } from '@/lib/email'

interface ReservaConRelaciones {
    id: string
    fecha_tour: string
    num_personas: number
    precio_total: number
    tours: { nombre: string; destino: string } | null
    clientes: { nombre_completo: string; email: string } | null
}

export async function enviarConfirmacionReserva(reservaId: string) {
    const supabase = await createClient()

    // Get reservation with related data
    const { data, error: resError } = await supabase
        .from('reservas')
        .select(`
      id, 
      fecha_tour, 
      num_personas, 
      precio_total,
      tours(nombre, destino),
      clientes(nombre_completo, email)
    `)
        .eq('id', reservaId)
        .single()

    if (resError || !data) {
        console.error('[Confirmación] Error fetching reserva:', resError)
        return { success: false, error: resError?.message }
    }

    const reserva = data as unknown as ReservaConRelaciones

    // Check if we already sent confirmation
    const { data: existingReminder } = await supabase
        .from('recordatorios_enviados')
        .select('id')
        .eq('reserva_id', reservaId)
        .eq('tipo', 'confirmacion')
        .single()

    if (existingReminder) {
        console.log('[Confirmación] Already sent for', reservaId)
        return { success: true, alreadySent: true }
    }

    try {
        // Send email
        await enviarEmailConfirmacion({
            id: reserva.id,
            cliente: reserva.clientes!,
            tour: reserva.tours!,
            fecha_tour: reserva.fecha_tour,
            num_personas: reserva.num_personas,
            precio_total: reserva.precio_total
        })

        // Record the sent reminder
        await supabase.from('recordatorios_enviados').insert({
            reserva_id: reservaId,
            tipo: 'confirmacion',
            canal: 'email',
            destinatario: reserva.clientes!.email
        })

        console.log('[Confirmación] Sent to', reserva.clientes!.email)
        return { success: true }
    } catch (err) {
        console.error('[Confirmación] Error sending:', err)

        // Record failed attempt
        await supabase.from('recordatorios_enviados').insert({
            reserva_id: reservaId,
            tipo: 'confirmacion',
            canal: 'email',
            destinatario: reserva.clientes?.email || 'unknown',
            estado: 'fallido',
            error_mensaje: err instanceof Error ? err.message : 'Unknown error'
        })

        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}
