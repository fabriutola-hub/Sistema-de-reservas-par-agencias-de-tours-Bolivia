'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TOURS ============

export async function getTours() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function createTour(formData: FormData) {
    const supabase = await createClient()

    const nombre = formData.get('nombre') as string
    const description = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio_por_persona') as string)
    const duracion = parseInt(formData.get('duracion_horas') as string)
    const destino = formData.get('destino') as string
    const imagen_url = (formData.get('imagen_url') as string) || null
    const qr_pago_url = (formData.get('qr_pago_url') as string) || null
    const incluyeRaw = formData.get('incluye') as string
    const galeriaRaw = formData.get('galeria') as string
    const itinerarioRaw = formData.get('itinerario') as string

    if (!nombre || !precio || !duracion || !destino) {
        throw new Error('Faltan campos requeridos')
    }

    // Process textarea lines into array
    const incluyeArray = incluyeRaw
        ? incluyeRaw.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        : []

    const galeriaArray = galeriaRaw ? JSON.parse(galeriaRaw) : []
    const itinerarioArray = itinerarioRaw ? JSON.parse(itinerarioRaw) : []

    const { error } = await supabase.from('tours').insert({
        nombre,
        descripcion: description,
        precio_por_persona: precio,
        duracion_horas: duracion,
        destino,
        imagen_url,
        qr_pago_url,
        incluye: incluyeArray,
        galeria: galeriaArray,
        itinerario: itinerarioArray,
        activo: true
    })

    if (error) {
        console.error('Error creating tour:', error)
        throw new Error('Error al crear el tour')
    }

    revalidatePath('/admin/tours')
    revalidatePath('/tours')
}

export async function updateTour(id: string, formData: FormData) {
    const supabase = await createClient()

    const nombre = formData.get('nombre') as string
    const description = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio_por_persona') as string)
    const duracion = parseInt(formData.get('duracion_horas') as string)
    const destino = formData.get('destino') as string
    const imagen_url = (formData.get('imagen_url') as string) || null
    const qr_pago_url = (formData.get('qr_pago_url') as string) || null
    const incluyeRaw = formData.get('incluye') as string
    const galeriaRaw = formData.get('galeria') as string
    const itinerarioRaw = formData.get('itinerario') as string

    if (!nombre || !precio || !duracion || !destino) {
        throw new Error('Faltan campos requeridos')
    }

    // Process textarea lines into array
    const incluyeArray = incluyeRaw
        ? incluyeRaw.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        : []

    const galeriaArray = galeriaRaw ? JSON.parse(galeriaRaw) : []
    const itinerarioArray = itinerarioRaw ? JSON.parse(itinerarioRaw) : []

    const { error } = await supabase.from('tours').update({
        nombre,
        descripcion: description,
        precio_por_persona: precio,
        duracion_horas: duracion,
        destino,
        imagen_url,
        qr_pago_url,
        incluye: incluyeArray,
        galeria: galeriaArray,
        itinerario: itinerarioArray
    }).eq('id', id)

    if (error) {
        console.error('Error updating tour:', error)
        throw new Error('Error al actualizar el tour')
    }

    revalidatePath('/admin/tours')
    revalidatePath(`/tours/${id}`)
    revalidatePath('/tours')
}


export async function deleteTour(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tours').delete().eq('id', id)

    if (error) {
        if (error.code === '23503') {
            throw new Error('No se puede eliminar el tour porque tiene reservas asociadas. Intenta desactivarlo en su lugar.')
        }
        throw new Error(error.message)
    }

    revalidatePath('/admin/tours')
    return { success: true }
}

export async function toggleTourActive(id: string, activo: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('tours').update({ activo }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/tours')
    return { success: true }
}

// ============ DISPONIBILIDAD ============

export async function getDisponibilidad(tourId?: string) {
    const supabase = await createClient()
    let query = supabase
        .from('disponibilidad')
        .select('*, tours(nombre)')
        .order('fecha', { ascending: true })

    if (tourId) query = query.eq('tour_id', tourId)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function createDisponibilidad(formData: FormData) {
    const supabase = await createClient()

    const tour_id = formData.get('tour_id') as string
    const fecha = formData.get('fecha') as string
    const hora_salida = formData.get('hora_salida') as string
    const cupos = parseInt(formData.get('cupos_disponibles') as string)

    const { error } = await supabase.from('disponibilidad').insert({
        tour_id,
        fecha,
        hora_salida,
        cupos_disponibles: cupos
    })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/disponibilidad')
    return { success: true }
}

export async function createBulkDisponibilidad(tourId: string, fechas: string[], hora: string, cupos: number) {
    const supabase = await createClient()

    const records = fechas.map(fecha => ({
        tour_id: tourId,
        fecha,
        hora_salida: hora,
        cupos_disponibles: cupos
    }))

    const { error } = await supabase.from('disponibilidad').insert(records)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/disponibilidad')
    return { success: true }
}

export async function deleteDisponibilidad(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('disponibilidad').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/disponibilidad')
    return { success: true }
}

export async function createManualReserva(formData: FormData) {
    const supabase = await createClient()

    const tourId = formData.get('tour_id') as string
    const fecha = formData.get('fecha') as string
    const nombre = formData.get('nombre_completo') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const ci = formData.get('ci') as string
    const personas = parseInt(formData.get('num_personas') as string)
    const notas = formData.get('notas') as string
    const canal = formData.get('canal_reserva') as string || 'whatsapp' // Default whatsapp if not specified

    // Validation
    if (!tourId || !fecha || !nombre || !personas) {
        throw new Error('Faltan campos requeridos')
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Verify availability exists for this date
    const { data: disp, error: dispError } = await supabase
        .from('disponibilidad')
        .select('cupos_disponibles')
        .eq('tour_id', tourId)
        .eq('fecha', fecha)
        .single()

    if (dispError || !disp) {
        throw new Error('No hay disponibilidad configurada para la fecha seleccionada')
    }

    if (disp.cupos_disponibles < personas) {
        throw new Error(`No hay suficientes cupos disponibles. Cupos disponibles: ${disp.cupos_disponibles}, solicitados: ${personas}`)
    }

    // Call RPC with new parameter
    const { data, error } = await supabase.rpc('create_booking_atomic', {
        p_tour_id: tourId,
        p_fecha: fecha,
        p_cliente_nombre: nombre,
        p_cliente_email: email || `manual_${Date.now()}@example.com`,
        p_cliente_telefono: telefono || '00000000',
        p_cliente_ci: ci || '00000',
        p_num_personas: personas,
        p_notas: notas,
        p_user_id: user?.id,
        p_canal_reserva: canal
    } as any) // Cast to any to avoid TS error if types aren't fully updated yet in IDE

    if (error) {
        console.error('Error creating manual reservation:', error)
        throw new Error(error.message || 'Error al crear la reserva manual')
    }

    if (!data.success) {
        throw new Error(data.error || 'Error al crear la reserva')
    }

    revalidatePath('/admin/reservas')
    revalidatePath('/admin/disponibilidad')
    return { success: true, reservaId: data.reservaId }
}

// ============ RESERVAS ============

export async function getReservas(filters?: { estado?: string; tourId?: string }) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_reservas_admin', {
        estado_filter: filters?.estado || null,
        tour_id_filter: filters?.tourId || null
    })

    if (error) throw new Error(error.message)

    // Transform flat RPC result to nested structure if needed by UI, 
    // or just return as is if UI can adapt. 
    // The RPC returns flat structure for joined fields.
    // Let's adapt it to match original shape partially to minimize UI breakage,
    // or better yet, returned data is flat, so we might need to adjust UI or map here.
    // Original: *, tours(nombre, destino), clientes(nombre_completo, email, telefono)
    // RPC: tour_nombre, tour_destino, cliente_nombre, ...

    // Mapping to match expected UI structure roughly:
    const mappedData = (data as any[]).map(r => ({
        ...r,
        canal_reserva: r.canal_reserva || 'web', // Map from flat RPC result
        tours: { nombre: r.tour_nombre, destino: r.tour_destino },
        clientes: { nombre_completo: r.cliente_nombre, email: r.cliente_email, telefono: r.cliente_telefono }
    }))

    return mappedData
}

export async function updateReservaEstado(id: string, estado: string) {
    const supabase = await createClient()

    // If canceling, we should restore availability
    if (estado === 'cancelada') {
        const { data: reserva } = await supabase
            .from('reservas')
            .select('tour_id, fecha_tour, num_personas')
            .eq('id', id)
            .single()

        if (reserva) {
            try {
                await supabase.rpc('restore_availability', {
                    p_tour_id: reserva.tour_id,
                    p_fecha: reserva.fecha_tour,
                    p_cantidad: reserva.num_personas
                })
            } catch {
                // RPC might not exist, fallback to manual update
                const { data } = await supabase
                    .from('disponibilidad')
                    .select('cupos_disponibles')
                    .eq('tour_id', reserva.tour_id)
                    .eq('fecha', reserva.fecha_tour)
                    .single()

                if (data) {
                    await supabase
                        .from('disponibilidad')
                        .update({ cupos_disponibles: data.cupos_disponibles + reserva.num_personas })
                        .eq('tour_id', reserva.tour_id)
                        .eq('fecha', reserva.fecha_tour)
                }
            }
        }
    }

    const { error } = await supabase
        .from('reservas')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)

    // Send payment confirmation email when marking as paid
    if (estado === 'pagada') {
        const { data: reservaData } = await supabase
            .from('reservas')
            .select(`
                id, fecha_tour, num_personas, precio_total,
                tours(nombre, destino, punto_encuentro),
                clientes(nombre_completo, email)
            `)
            .eq('id', id)
            .single()

        if (reservaData) {
            // Non-blocking email send
            import('@/lib/email').then(({ enviarEmailPagoConfirmado }) => {
                enviarEmailPagoConfirmado({
                    id: reservaData.id,
                    cliente: (reservaData as any).clientes,
                    tour: (reservaData as any).tours,
                    fecha_tour: reservaData.fecha_tour,
                    num_personas: reservaData.num_personas,
                    precio_total: reservaData.precio_total
                }).catch(console.error)
            })
        }
    }

    revalidatePath('/admin/reservas')
    return { success: true }
}

export async function updateReservaNotas(id: string, notas: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('reservas')
        .update({ notas, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/reservas')
    return { success: true }
}

export async function sendReservaNotification(id: string, type: 'payment_confirmed' | 'cancellation' | 'reminder_24h') {
    const supabase = await createClient()

    const { data: reservaData, error } = await supabase
        .from('reservas')
        .select(`
            id, fecha_tour, num_personas, precio_total, estado, tour_id,
            tours(nombre, destino, punto_encuentro),
            clientes(nombre_completo, email, telefono)
        `)
        .eq('id', id)
        .single()

    if (error || !reservaData) {
        throw new Error('Reserva no encontrada')
    }

    const emailData = {
        id: reservaData.id,
        cliente: (reservaData as any).clientes,
        tour: (reservaData as any).tours,
        fecha_tour: reservaData.fecha_tour,
        num_personas: reservaData.num_personas,
        precio_total: reservaData.precio_total
    }

    try {
        const { enviarEmailPagoConfirmado, enviarEmailCancelacion, enviarRecordatorio24h } = await import('@/lib/email')

        console.log('Sending notification of type:', type)

        if (type === 'payment_confirmed') {
            await enviarEmailPagoConfirmado(emailData)
            // Auto-update status to 'pagada' if not already
            if (reservaData.estado !== 'pagada') {
                await updateReservaEstado(id, 'pagada')
            }
        } else if (type === 'cancellation') {
            await enviarEmailCancelacion(emailData)
            // Auto-update status to 'cancelada' if not already
            if (reservaData.estado !== 'cancelada') {
                await updateReservaEstado(id, 'cancelada')
            }
        } else if (type === 'reminder_24h') {
            // Need to fetch specific data for reminder: hora_salida
            const { data: disponibilidad } = await supabase
                .from('disponibilidad')
                .select('hora_salida')
                .eq('tour_id', reservaData.tour_id)
                .eq('fecha', reservaData.fecha_tour)
                .single()

            await enviarRecordatorio24h({
                ...emailData,
                hora_salida: disponibilidad?.hora_salida
            })
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error sending notification:', err)
        throw new Error(err.message || 'Error al enviar notificación')
    }
}

// ============ CLIENTES ============

export async function getClientes(search?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_clientes_admin', {
        search_term: search || null
    })

    if (error) throw new Error(error.message)
    return data
}

export async function getClienteReservas(clienteId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('reservas')
        .select('*, tours(nombre)')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

// ============ DASHBOARD METRICS ============

export async function getDashboardMetrics() {
    const supabase = await createClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Total reservations this month
    const { count: totalReservas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)

    // Monthly revenue
    const { data: revenueData } = await supabase
        .from('reservas')
        .select('precio_total')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .in('estado', ['pagada', 'confirmada', 'completada'])

    const ingresosMes = revenueData?.reduce((sum, r) => sum + (r.precio_total || 0), 0) || 0

    // Pending reservations
    const { count: pendientes } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')

    // Popular tours
    const { data: popularTours } = await supabase
        .from('reservas')
        .select('tour_id, tours(nombre)')
        .gte('created_at', startOfMonth)

    const tourCounts: Record<string, { nombre: string; count: number }> = {}
    popularTours?.forEach((r: any) => {
        if (r.tour_id && r.tours?.nombre) {
            if (!tourCounts[r.tour_id]) {
                tourCounts[r.tour_id] = { nombre: r.tours.nombre, count: 0 }
            }
            tourCounts[r.tour_id].count++
        }
    })

    const toursPopulares = Object.values(tourCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

    return {
        totalReservas: totalReservas || 0,
        ingresosMes,
        pendientes: pendientes || 0,
        toursPopulares
    }
}

export async function getReservasPorDia(dias: number = 30) {
    const supabase = await createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dias)

    const { data } = await supabase
        .from('reservas')
        .select('created_at, precio_total, estado')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    // Group by day — only count income from paid/confirmed/completed
    const byDay: Record<string, { reservas: number; ingresos: number }> = {}
    data?.forEach((r: any) => {
        const day = r.created_at.split('T')[0]
        if (!byDay[day]) byDay[day] = { reservas: 0, ingresos: 0 }
        byDay[day].reservas++
        if (['pagada', 'confirmada', 'completada'].includes(r.estado)) {
            byDay[day].ingresos += r.precio_total || 0
        }
    })

    return Object.entries(byDay).map(([fecha, vals]) => ({
        fecha,
        ...vals
    }))
}

// ============ REPORTS ============

export async function getReportData(startDate: string, endDate: string, tourId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('reservas')
        .select('*, tours(nombre)')
        .gte('fecha_tour', startDate)
        .lte('fecha_tour', endDate)

    if (tourId) query = query.eq('tour_id', tourId)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // Only count income from paid/confirmed/completed reservations
    const estadosValidos = ['pagada', 'confirmada', 'completada']
    const reservasConIngreso = data?.filter((r: any) => estadosValidos.includes(r.estado)) || []

    // Aggregate — only count valid reservations
    const totalReservas = reservasConIngreso.length
    const totalIngresos = reservasConIngreso.reduce((sum: number, r: any) => sum + (r.precio_total || 0), 0)

    // By tour — only count valid states
    const byTour: Record<string, { nombre: string; reservas: number; ingresos: number }> = {}
    data?.forEach((r: any) => {
        if (!estadosValidos.includes(r.estado)) return
        const tid = r.tour_id
        if (!byTour[tid]) byTour[tid] = { nombre: r.tours?.nombre || 'N/A', reservas: 0, ingresos: 0 }
        byTour[tid].reservas++
        byTour[tid].ingresos += r.precio_total || 0
    })

    // By payment method — only valid states
    const byPago: Record<string, number> = {}
    reservasConIngreso.forEach((r: any) => {
        const method = r.metodo_pago || 'otro'
        byPago[method] = (byPago[method] || 0) + (r.precio_total || 0)
    })

    // By channel (canal_reserva) — all reservations
    const byCanal: Record<string, number> = {}
    data?.forEach((r: any) => {
        const canal = r.canal_reserva || 'web'
        byCanal[canal] = (byCanal[canal] || 0) + 1
    })

    return {
        totalReservas,
        totalIngresos,
        porTour: Object.values(byTour),
        porMetodoPago: Object.entries(byPago).map(([metodo, total]) => ({ metodo, total })),
        porCanal: Object.entries(byCanal).map(([canal, total]) => ({ canal, total }))
    }
}
