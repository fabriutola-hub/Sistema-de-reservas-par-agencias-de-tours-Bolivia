import twilio from 'twilio'
import { getAgencyConfig } from '@/lib/actions/config'

// Lazy initialization to avoid build-time errors
let twilioClient: twilio.Twilio | null = null

function getTwilioClient(): twilio.Twilio | null {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
        console.warn('[SMS] Twilio credentials not configured')
        return null
    }

    if (!twilioClient) {
        twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
    }
    return twilioClient
}

const TWILIO_PHONE = process.env.TWILIO_PHONE || '+15551234567'

// Get agency name from database config with fallback
async function getAgencyName(): Promise<string> {
    try {
        const config = await getAgencyConfig()
        return config.nombre || process.env.AGENCY_NAME || 'TourReservas Bolivia'
    } catch {
        return process.env.AGENCY_NAME || 'TourReservas Bolivia'
    }
}

// Legacy constant for backward compatibility
const AGENCY_NAME = process.env.AGENCY_NAME || 'TourReservas Bolivia'

interface SMSResult {
    success: boolean
    sid?: string
    error?: string
}

export async function enviarSMS(telefono: string, mensaje: string): Promise<SMSResult> {
    const client = getTwilioClient()

    if (!client) {
        console.log('[SMS] Twilio not configured, logging message:')
        console.log(`[SMS] To: ${telefono}`)
        console.log(`[SMS] Message: ${mensaje}`)
        return { success: true, sid: 'mock-sid' } // Return success for development
    }

    // Normalize phone number for Bolivia
    let normalizedPhone = telefono.replace(/\D/g, '')
    if (!normalizedPhone.startsWith('591')) {
        normalizedPhone = `591${normalizedPhone}`
    }
    if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = `+${normalizedPhone}`
    }

    try {
        const message = await client.messages.create({
            body: mensaje,
            from: TWILIO_PHONE,
            to: normalizedPhone
        })

        console.log(`[SMS] Sent to ${normalizedPhone}, SID: ${message.sid}`)
        return { success: true, sid: message.sid }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[SMS] Error sending to ${normalizedPhone}:`, errorMsg)
        return { success: false, error: errorMsg }
    }
}

export async function enviarSMSRecordatorio2h(
    telefono: string,
    tourNombre: string,
    puntoEncuentro: string,
    horaSalida: string
): Promise<SMSResult> {
    const agencyName = await getAgencyName()
    const mensaje = `🌄 ${agencyName}: ¡Tu tour "${tourNombre}" comienza en 2 horas! ⏰ ${horaSalida}. 📍 Punto de encuentro: ${puntoEncuentro}. ¡Nos vemos pronto!`

    return enviarSMS(telefono, mensaje)
}

export async function enviarSMSConfirmacion(
    telefono: string,
    tourNombre: string,
    fecha: string
): Promise<SMSResult> {
    const agencyName = await getAgencyName()
    const mensaje = `✅ ${agencyName}: ¡Reserva recibida! Tour: ${tourNombre}, Fecha: ${fecha}. Te enviaremos más detalles por email. ¡Gracias!`

    return enviarSMS(telefono, mensaje)
}
