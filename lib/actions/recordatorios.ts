'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enviarEmailConfirmacion, enviarRecordatorio24h, enviarRecordatorio2h, enviarSolicitudFeedback } from '@/lib/email'
import { enviarSMSRecordatorio2h } from '@/lib/sms'

interface Recordatorio {
    id: string
    reserva_id: string
    tipo: string
    canal: string
    destinatario: string
    enviado_at: string
    estado: string
    error_mensaje: string | null
    intentos: number
    reservas?: {
        id: string
        fecha_tour: string
        num_personas: number
        precio_total: number
        tours?: { nombre: string; destino: string; punto_encuentro?: string }
        clientes?: { nombre_completo: string; email: string; telefono: string }
    }
}

export async function getRecordatorios(filters?: { tipo?: string; estado?: string; limit?: number }) {
    const supabase = await createClient()

    let query = supabase
        .from('recordatorios_enviados')
        .select(`
      *,
      reservas(
        id, fecha_tour, num_personas, precio_total,
        tours(nombre, destino, punto_encuentro),
        clientes(nombre_completo, email, telefono)
      )
    `)
        .order('enviado_at', { ascending: false })

    if (filters?.tipo) query = query.eq('tipo', filters.tipo)
    if (filters?.estado) query = query.eq('estado', filters.estado)
    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data as Recordatorio[]
}

export async function getRecordatorioStats() {
    const supabase = await createClient()

    // Get counts by type and status
    const { data: allRecords } = await supabase
        .from('recordatorios_enviados')
        .select('tipo, estado')

    const stats = {
        total: allRecords?.length || 0,
        enviados: 0,
        fallidos: 0,
        porTipo: {} as Record<string, number>
    }

    allRecords?.forEach(r => {
        if (r.estado === 'enviado') stats.enviados++
        if (r.estado === 'fallido') stats.fallidos++
        stats.porTipo[r.tipo] = (stats.porTipo[r.tipo] || 0) + 1
    })

    return stats
}

export async function reenviarRecordatorio(recordatorioId: string) {
    const supabase = await createClient()

    // Get the original recordatorio with reservation data
    const { data: recordatorio, error: recError } = await supabase
        .from('recordatorios_enviados')
        .select(`
      *,
      reservas(
        id, fecha_tour, num_personas, precio_total,
        disponibilidad:disponibilidad(hora_salida),
        tours(nombre, destino, punto_encuentro),
        clientes(nombre_completo, email, telefono)
      )
    `)
        .eq('id', recordatorioId)
        .single()

    if (recError || !recordatorio) {
        console.error('Error fetching recordatorio:', recError)
        throw new Error(`Recordatorio no encontrado: ${recError?.message || 'No existe'}`)
    }

    const reserva = recordatorio.reservas
    if (!reserva || !reserva.clientes || !reserva.tours) {
        throw new Error('Datos de reserva incompletos')
    }

    try {
        const emailData = {
            id: reserva.id,
            cliente: reserva.clientes,
            tour: reserva.tours,
            fecha_tour: reserva.fecha_tour,
            hora_salida: reserva.disponibilidad?.[0]?.hora_salida,
            num_personas: reserva.num_personas,
            precio_total: reserva.precio_total
        }

        // Resend based on type
        switch (recordatorio.tipo) {
            case 'confirmacion':
                await enviarEmailConfirmacion(emailData)
                break
            case 'recordatorio_24h':
                await enviarRecordatorio24h(emailData)
                break
            case 'recordatorio_2h':
                if (recordatorio.canal === 'sms') {
                    await enviarSMSRecordatorio2h(
                        reserva.clientes.telefono,
                        reserva.tours.nombre,
                        reserva.tours.punto_encuentro || 'Por confirmar',
                        reserva.disponibilidad?.[0]?.hora_salida || ''
                    )
                } else {
                    await enviarRecordatorio2h(emailData)
                }
                break
            case 'feedback':
                await enviarSolicitudFeedback(emailData)
                break
            default:
                throw new Error(`Tipo de recordatorio desconocido: ${recordatorio.tipo}`)
        }

        // Update the record to mark as resent
        await supabase
            .from('recordatorios_enviados')
            .update({
                estado: 'enviado',
                error_mensaje: null,
                enviado_at: new Date().toISOString(),
                intentos: (recordatorio.intentos || 0) + 1
            })
            .eq('id', recordatorioId)

        revalidatePath('/admin/recordatorios')
        return { success: true }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido'

        await supabase
            .from('recordatorios_enviados')
            .update({
                estado: 'fallido',
                error_mensaje: errorMsg,
                intentos: (recordatorio.intentos || 0) + 1
            })
            .eq('id', recordatorioId)

        revalidatePath('/admin/recordatorios')
        throw new Error(errorMsg)
    }
}

export async function retryFailedRecordatorios() {
    const supabase = await createClient()

    // Get failed recordatorios with less than 3 attempts
    const { data: fallidos } = await supabase
        .from('recordatorios_enviados')
        .select('id')
        .eq('estado', 'fallido')
        .lt('intentos', 3)

    let retried = 0
    let succeeded = 0

    for (const rec of fallidos || []) {
        retried++
        try {
            await reenviarRecordatorio(rec.id)
            succeeded++
        } catch {
            // Error already logged in reenviarRecordatorio
        }
    }

    return { retried, succeeded }
}
