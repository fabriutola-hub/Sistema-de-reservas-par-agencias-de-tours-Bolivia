import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    enviarRecordatorio24h,
    enviarRecordatorio2h,
    enviarSolicitudFeedback,
    enviarSMS2h
} from '@/lib/email'

// Use service role for cron jobs
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret to prevent unauthorized access
function verifyCronAuth(request: Request): boolean {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
        console.warn('[CRON] No CRON_SECRET configured')
        return true // Allow in development
    }

    return authHeader === `Bearer ${cronSecret}`
}

interface ReservaWithRelations {
    id: string
    cliente_id: string
    tour_id: string
    fecha_tour: string
    num_personas: number
    precio_total: number
    estado: string
    created_at: string
    clientes: {
        nombre_completo: string
        email: string
        telefono: string
    }
    tours: {
        nombre: string
        destino: string
        punto_encuentro?: string
    }
    disponibilidad?: {
        hora_salida: string
    }[]
}

async function wasReminderSent(reservaId: string, tipo: string, canal: string = 'email'): Promise<boolean> {
    const { data } = await supabase
        .from('recordatorios_enviados')
        .select('id')
        .eq('reserva_id', reservaId)
        .eq('tipo', tipo)
        .eq('canal', canal)
        .single()

    return !!data
}

async function registrarRecordatorio(
    reservaId: string,
    tipo: string,
    destinatario: string,
    canal: string = 'email',
    estado: string = 'enviado',
    error?: string
) {
    await supabase.from('recordatorios_enviados').insert({
        reserva_id: reservaId,
        tipo,
        canal,
        destinatario,
        estado,
        error_mensaje: error
    })
}

// ============ REMINDER PROCESSORS ============

async function procesarRecordatorios24h() {
    const results = { processed: 0, sent: 0, errors: 0 }

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Find paid reservations for tomorrow
    const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
      *,
      clientes(nombre_completo, email, telefono),
      tours(nombre, destino, punto_encuentro)
    `)
        .eq('fecha_tour', tomorrowStr)
        .in('estado', ['pagada', 'confirmada'])

    if (error) {
        console.error('[24h] Query error:', error)
        return results
    }

    for (const reserva of (reservas || []) as ReservaWithRelations[]) {
        results.processed++

        // Check if already sent
        if (await wasReminderSent(reserva.id, 'recordatorio_24h')) {
            continue
        }

        try {
            // Get hora_salida from disponibilidad
            const { data: disponibilidad } = await supabase
                .from('disponibilidad')
                .select('hora_salida')
                .eq('tour_id', reserva.tour_id)
                .eq('fecha', reserva.fecha_tour)
                .single()

            await enviarRecordatorio24h({
                id: reserva.id,
                cliente: reserva.clientes,
                tour: reserva.tours,
                fecha_tour: reserva.fecha_tour,
                hora_salida: disponibilidad?.hora_salida,
                num_personas: reserva.num_personas,
                precio_total: reserva.precio_total
            })

            await registrarRecordatorio(reserva.id, 'recordatorio_24h', reserva.clientes.email)
            results.sent++
            console.log(`[24h] Sent to ${reserva.clientes.email}`)
        } catch (err) {
            results.errors++
            const errorMsg = err instanceof Error ? err.message : 'Unknown error'
            await registrarRecordatorio(reserva.id, 'recordatorio_24h', reserva.clientes.email, 'email', 'fallido', errorMsg)
            console.error(`[24h] Error for ${reserva.id}:`, errorMsg)
        }
    }

    return results
}

async function procesarRecordatorios2h() {
    const results = { processed: 0, sent: 0, errors: 0 }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Calculate time window: now + 2 hours (with 15 min buffer)
    const targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const targetHour = targetTime.getHours().toString().padStart(2, '0')
    const targetMinute = targetTime.getMinutes()

    // Get disponibilidad for today with tours starting in ~2 hours
    const { data: disponibilidades } = await supabase
        .from('disponibilidad')
        .select('id, tour_id, hora_salida')
        .eq('fecha', todayStr)

    if (!disponibilidades) return results

    // Filter by hora_salida within 2h window
    const matchingDisponibilidades = disponibilidades.filter(d => {
        if (!d.hora_salida) return false
        const [hour, minute] = d.hora_salida.split(':').map(Number)
        const diffMinutes = (hour * 60 + minute) - (targetTime.getHours() * 60 + targetMinute)
        return Math.abs(diffMinutes) <= 15 // 15 minute buffer
    })

    for (const disp of matchingDisponibilidades) {
        // Get reservations for this availability
        const { data: reservas } = await supabase
            .from('reservas')
            .select(`
        *,
        clientes(nombre_completo, email, telefono),
        tours(nombre, destino, punto_encuentro)
      `)
            .eq('tour_id', disp.tour_id)
            .eq('fecha_tour', todayStr)
            .in('estado', ['pagada', 'confirmada'])

        for (const reserva of (reservas || []) as ReservaWithRelations[]) {
            results.processed++

            if (await wasReminderSent(reserva.id, 'recordatorio_2h')) {
                continue
            }

            try {
                // Send email
                await enviarRecordatorio2h({
                    id: reserva.id,
                    cliente: reserva.clientes,
                    tour: reserva.tours,
                    fecha_tour: reserva.fecha_tour,
                    hora_salida: disp.hora_salida,
                    num_personas: reserva.num_personas,
                    precio_total: reserva.precio_total
                })

                await registrarRecordatorio(reserva.id, 'recordatorio_2h', reserva.clientes.email)

                // Also send SMS if phone available
                if (reserva.clientes.telefono) {
                    await enviarSMS2h(
                        reserva.clientes.telefono,
                        reserva.tours.nombre,
                        reserva.tours.punto_encuentro || 'Punto de encuentro por confirmar'
                    )
                    await registrarRecordatorio(reserva.id, 'recordatorio_2h', reserva.clientes.telefono, 'sms')
                }

                results.sent++
                console.log(`[2h] Sent to ${reserva.clientes.email}`)
            } catch (err) {
                results.errors++
                const errorMsg = err instanceof Error ? err.message : 'Unknown error'
                await registrarRecordatorio(reserva.id, 'recordatorio_2h', reserva.clientes.email, 'email', 'fallido', errorMsg)
                console.error(`[2h] Error for ${reserva.id}:`, errorMsg)
            }
        }
    }

    return results
}

async function procesarSolicitudesFeedback() {
    const results = { processed: 0, sent: 0, errors: 0 }

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Find completed reservations from yesterday
    const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
      *,
      clientes(nombre_completo, email, telefono),
      tours(nombre, destino)
    `)
        .eq('fecha_tour', yesterdayStr)
        .eq('estado', 'completada')

    if (error) {
        console.error('[Feedback] Query error:', error)
        return results
    }

    for (const reserva of (reservas || []) as ReservaWithRelations[]) {
        results.processed++

        if (await wasReminderSent(reserva.id, 'feedback')) {
            continue
        }

        try {
            await enviarSolicitudFeedback({
                id: reserva.id,
                cliente: reserva.clientes,
                tour: reserva.tours,
                fecha_tour: reserva.fecha_tour,
                num_personas: reserva.num_personas,
                precio_total: reserva.precio_total
            })

            await registrarRecordatorio(reserva.id, 'feedback', reserva.clientes.email)
            results.sent++
            console.log(`[Feedback] Sent to ${reserva.clientes.email}`)
        } catch (err) {
            results.errors++
            const errorMsg = err instanceof Error ? err.message : 'Unknown error'
            await registrarRecordatorio(reserva.id, 'feedback', reserva.clientes.email, 'email', 'fallido', errorMsg)
            console.error(`[Feedback] Error for ${reserva.id}:`, errorMsg)
        }
    }

    return results
}

async function completarToursFinalizados() {
    const results = { processed: 0, completed: 0, errors: 0 }

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Find confirmed/paid reservations from yesterday
    // We select yesterday's tours to be sure they finished.
    // Ideally we could check today's tours that already finished, but yesterday is safer for now.
    const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
            id,
            fecha_tour,
            hora_tour,
            estado,
            tours (
                duracion_horas
            ),
            disponibilidad (
                hora_salida
            )
        `)
        .eq('fecha_tour', yesterdayStr)
        .in('estado', ['pagada', 'confirmada'])

    if (error) {
        console.error('[AutoComp] Query error:', error)
        return results
    }

    const now = new Date()

    for (const reserva of (reservas || [])) {
        results.processed++

        try {
            // Determine start time
            // order of preference: reserva.hora_tour -> disponibilidad.hora_salida -> default 08:00
            let horaInicioStr = reserva.hora_tour

            if (!horaInicioStr && reserva.disponibilidad && Array.isArray(reserva.disponibilidad) && reserva.disponibilidad.length > 0) {
                // @ts-ignore - Supabase type inference might be tricky here with arrays, assuming object
                horaInicioStr = reserva.disponibilidad[0].hora_salida
            } else if (!horaInicioStr && reserva.disponibilidad && !Array.isArray(reserva.disponibilidad)) {
                // @ts-ignore
                horaInicioStr = reserva.disponibilidad.hora_salida
            }

            if (!horaInicioStr) horaInicioStr = '08:00:00'

            // Parse start datetime
            const fechaTour = new Date(`${reserva.fecha_tour}T${horaInicioStr}`)

            // Add duration
            // @ts-ignore
            const duracionHoras = reserva.tours?.duracion_horas || 4 // default 4h if missing
            const fechaFin = new Date(fechaTour.getTime() + duracionHoras * 60 * 60 * 1000)

            // Buffer: wait 2 hours after theoretical end time to be safe
            const fechaFinItems = new Date(fechaFin.getTime() + 2 * 60 * 60 * 1000)

            if (now > fechaFinItems) {
                // Update status
                const { error: updateError } = await supabase
                    .from('reservas')
                    .update({ estado: 'completada' })
                    .eq('id', reserva.id)

                if (updateError) throw updateError

                results.completed++
                console.log(`[AutoComp] Completed reservation ${reserva.id}`)
            }
        } catch (err) {
            results.errors++
            const errorMsg = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[AutoComp] Error for ${reserva.id}:`, errorMsg)
        }
    }

    return results
}

// ============ API HANDLER ============

export async function GET(request: Request) {
    // SECURITY: Verify that CRON_SECRET is configured
    // This prevents the endpoint from being completely open if the secret is not set
    // For local development/testing, you can temporarily comment out this check
    if (!process.env.CRON_SECRET) {
        console.error('[CRON] CRITICAL: CRON_SECRET no configurado - endpoint bloqueado por seguridad')
        return NextResponse.json(
            { error: 'Server misconfiguration: CRON_SECRET not set' },
            { status: 500 }
        )
    }

    // Verify authorization
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting reminder processing...')
    const startTime = Date.now()

    try {
        // Process all tasks
        const [results24h, results2h, resultsFeedback, resultsAutoComp] = await Promise.all([
            procesarRecordatorios24h(),
            procesarRecordatorios2h(),
            procesarSolicitudesFeedback(),
            completarToursFinalizados()
        ])

        const summary = {
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
            recordatorios_24h: results24h,
            recordatorios_2h: results2h,
            solicitudes_feedback: resultsFeedback,
            auto_completado: resultsAutoComp,
            total: {
                processed: results24h.processed + results2h.processed + resultsFeedback.processed + resultsAutoComp.processed,
                sent: results24h.sent + results2h.sent + resultsFeedback.sent, // 'sent' doesn't apply to autocomp but we keep structure
                actions: results24h.sent + results2h.sent + resultsFeedback.sent + resultsAutoComp.completed,
                errors: results24h.errors + results2h.errors + resultsFeedback.errors + resultsAutoComp.errors
            }
        }

        console.log('[CRON] Completed:', JSON.stringify(summary))

        return NextResponse.json(summary)
    } catch (error) {
        console.error('[CRON] Fatal error:', error)
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}
