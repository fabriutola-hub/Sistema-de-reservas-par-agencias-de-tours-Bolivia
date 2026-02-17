'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================================
// PDF GENERATION
// Simple HTML-to-PDF using server-side rendering
// ============================================================

interface ReservationPDFData {
    codigo_reserva: string
    tour_nombre: string
    fecha_tour: string
    hora_tour: string | null
    num_personas: number
    precio_total: number
    estado: string
    cliente_nombre: string
    cliente_email: string
    destino: string | null
    duracion_horas: string | null
    created_at: string
}

export async function getReservationPDFData(reservaId: string): Promise<{
    data: ReservationPDFData | null
    error: string | null
}> {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { data: null, error: 'No autenticado' }
        }

        // Get reservation with tour and client details
        const { data: reservation, error } = await supabase
            .from('reservas')
            .select(`
                id,
                codigo_reserva,
                fecha_tour,
                hora_tour,
                num_personas,
                precio_total,
                estado,
                created_at,
                tour:tours (
                    nombre,
                    destino,
                    duracion_horas
                ),
                cliente:clientes (
                    nombre_completo,
                    email
                )
            `)
            .eq('id', reservaId)
            .single()

        if (error || !reservation) {
            console.error('[PDF] Error fetching reservation:', error)
            return { data: null, error: 'Reserva no encontrada' }
        }

        // Verify ownership - either by user_id or by matching email
        const { data: checkOwnership } = await supabase
            .from('reservas')
            .select('id')
            .eq('id', reservaId)
            .eq('user_id', user.id)
            .single()

        // If not found by user_id, check by email
        if (!checkOwnership) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', user.id)
                .single()

            const clientEmail = (reservation.cliente as any)?.email
            if (!profile || profile.email !== clientEmail) {
                return { data: null, error: 'No tienes acceso a esta reserva' }
            }
        }

        const tour = reservation.tour as any
        const cliente = reservation.cliente as any

        return {
            data: {
                codigo_reserva: reservation.codigo_reserva || reservaId.slice(0, 8).toUpperCase(),
                tour_nombre: tour?.nombre || 'Tour',
                fecha_tour: reservation.fecha_tour,
                hora_tour: reservation.hora_tour,
                num_personas: reservation.num_personas,
                precio_total: reservation.precio_total,
                estado: reservation.estado,
                cliente_nombre: cliente?.nombre_completo || 'Cliente',
                cliente_email: cliente?.email || '',
                destino: tour?.destino,
                duracion_horas: tour?.duracion_horas,
                created_at: reservation.created_at
            },
            error: null
        }
    } catch (err) {
        console.error('[PDF] Unexpected error:', err)
        return { data: null, error: 'Error inesperado' }
    }
}

// Generate printable HTML for reservation (client will use window.print())
export async function generateReservationHTML(reservaId: string): Promise<{
    html: string | null
    error: string | null
}> {
    const { data, error } = await getReservationPDFData(reservaId)

    if (error || !data) {
        return { html: null, error: error || 'Error al generar PDF' }
    }

    const estadoColors: Record<string, string> = {
        pendiente: '#f59e0b',
        confirmada: '#3b82f6',
        pagada: '#10b981',
        completada: '#6b7280',
        cancelada: '#ef4444'
    }

    const estadoLabels: Record<string, string> = {
        pendiente: 'Pendiente',
        confirmada: 'Confirmada',
        pagada: 'Pagada',
        completada: 'Completada',
        cancelada: 'Cancelada'
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-BO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return ''
        return timeStr.slice(0, 5) // HH:MM
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva ${data.codigo_reserva} - TourReservas Bolivia</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #b45309;
        }
        .subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
        }
        .reservation-code {
            background: #fef3c7;
            border: 2px dashed #f59e0b;
            padding: 15px 30px;
            display: inline-block;
            margin: 20px 0;
            border-radius: 8px;
        }
        .reservation-code span {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #92400e;
        }
        .status {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            color: white;
            background: ${estadoColors[data.estado] || '#6b7280'};
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 500;
            color: #1f2937;
            margin-top: 4px;
        }
        .tour-name {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .total {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🌍 TourReservas Bolivia</div>
        <div class="subtitle">Comprobante de Reserva</div>
        
        <div class="reservation-code">
            <span>${data.codigo_reserva}</span>
        </div>
        
        <div>
            <span class="status">${estadoLabels[data.estado] || data.estado}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Detalles del Tour</div>
        <div class="tour-name">${data.tour_nombre}</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Fecha</span>
                <span class="info-value">${formatDate(data.fecha_tour)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Hora</span>
                <span class="info-value">${data.hora_tour ? formatTime(data.hora_tour) : 'Por confirmar'}</span>
            </div>
            ${data.destino ? `
            <div class="info-item">
                <span class="info-label">Destino</span>
                <span class="info-value">${data.destino}</span>
            </div>
            ` : ''}
            ${data.duracion_horas ? `
            <div class="info-item">
                <span class="info-label">Duración</span>
                <span class="info-value">${data.duracion_horas}</span>
            </div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Información del Cliente</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nombre</span>
                <span class="info-value">${data.cliente_nombre}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${data.cliente_email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Personas</span>
                <span class="info-value">${data.num_personas} persona${data.num_personas > 1 ? 's' : ''}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de Reserva</span>
                <span class="info-value">${formatDate(data.created_at)}</span>
            </div>
        </div>
    </div>

    <div class="section" style="text-align: center;">
        <div class="section-title">Total a Pagar</div>
        <div class="total">Bs. ${data.precio_total.toFixed(2)}</div>
    </div>

    <div class="footer">
        <p>Presenta este comprobante al momento del tour.</p>
        <p>Para consultas: contacto@tourreservas.bo</p>
        <p style="margin-top: 10px;">Generado el ${new Date().toLocaleDateString('es-BO')} a las ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
</body>
</html>
    `.trim()

    return { html, error: null }
}
