import { Resend } from 'resend'
import { getAgencyConfig } from '@/lib/actions/config'

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is missing from environment variables')
      throw new Error('La configuración de email (RESEND_API_KEY) no está configurada.')
    }

    // console.log('Initializing Resend with key:', apiKey.substring(0, 5) + '...')
    resend = new Resend(apiKey)
  }
  return resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev' // Default to Resend's test email if verified domain not set

// Agency info interface
interface AgencyInfo {
  name: string
  phone: string
  address: string
  whatsapp: string
}

// Get agency info from database config with fallback to env vars
async function getAgencyInfo(): Promise<AgencyInfo> {
  try {
    const config = await getAgencyConfig()
    return {
      name: config.nombre || process.env.AGENCY_NAME || 'TourReservas Bolivia',
      phone: config.telefono || process.env.AGENCY_PHONE || '+591 71234567',
      address: config.direccion || process.env.AGENCY_ADDRESS || 'La Paz, Bolivia',
      whatsapp: config.whatsapp || process.env.AGENCY_PHONE || '+591 71234567'
    }
  } catch {
    // Fallback to environment variables if database is not available
    return {
      name: process.env.AGENCY_NAME || 'TourReservas Bolivia',
      phone: process.env.AGENCY_PHONE || '+591 71234567',
      address: process.env.AGENCY_ADDRESS || 'La Paz, Bolivia',
      whatsapp: process.env.AGENCY_PHONE || '+591 71234567'
    }
  }
}

// Legacy constants for backward compatibility
const AGENCY_NAME = process.env.AGENCY_NAME || 'TourReservas Bolivia'
const AGENCY_PHONE = process.env.AGENCY_PHONE || '+591 71234567'
const AGENCY_ADDRESS = process.env.AGENCY_ADDRESS || 'La Paz, Bolivia'

interface ReservaEmailData {
  cliente: {
    nombre_completo: string
    email: string
  }
  tour: {
    nombre: string
    destino: string
    punto_encuentro?: string
  }
  fecha_tour: string
  hora_salida?: string
  num_personas: number
  precio_total: number
  id: string
}

// ============ EMAIL TEMPLATES ============

function baseTemplate(content: string, agencyInfo?: AgencyInfo): string {
  const name = agencyInfo?.name || AGENCY_NAME
  const phone = agencyInfo?.phone || AGENCY_PHONE
  const address = agencyInfo?.address || AGENCY_ADDRESS
  const whatsapp = agencyInfo?.whatsapp || AGENCY_PHONE

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; }
    .info-value { color: #1f2937; font-weight: 600; }
    .total { font-size: 20px; color: #f43f5e; }
    .button { display: inline-block; background: #f43f5e; color: white !important; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    .footer a { color: #f43f5e; }
    .alert { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .alert-title { color: #b45309; font-weight: 600; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌄 ${name}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${name}</strong></p>
      <p>📍 ${address} | 📞 ${phone}</p>
      <p>¿Preguntas? Contáctanos por <a href="https://wa.me/${whatsapp.replace(/\D/g, '')}">WhatsApp</a></p>
    </div>
  </div>
</body>
</html>
  `
}

// ============ EMAIL FUNCTIONS ============

export async function enviarEmailConfirmacion(reserva: ReservaEmailData) {
  const agencyInfo = await getAgencyInfo()
  const content = `
    <h2>¡Reserva Recibida! 🎉</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>Hemos recibido tu reserva exitosamente. A continuación te compartimos los detalles:</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tour</span>
        <span class="info-value">${reserva.tour.nombre}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Destino</span>
        <span class="info-value">${reserva.tour.destino}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha</span>
        <span class="info-value">${reserva.fecha_tour}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Personas</span>
        <span class="info-value">${reserva.num_personas}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total a pagar</span>
        <span class="info-value total">Bs ${reserva.precio_total.toLocaleString()}</span>
      </div>
    </div>
    
    <div class="alert">
      <div class="alert-title">⏳ Siguiente paso: Realizar el pago</div>
      <p style="margin:0">Para confirmar tu reserva, realiza el pago antes de 24 horas. Puedes pagar por Yape, Altoke o transferencia bancaria.</p>
    </div>
    
    <p>Tu código de reserva es: <strong>${reserva.id.slice(0, 8).toUpperCase()}</strong></p>
    <p>Te enviaremos una confirmación cuando verifiquemos tu pago.</p>
  `

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: reserva.cliente.email,
    subject: `¡Reserva Recibida! ${reserva.tour.nombre} - ${reserva.fecha_tour}`,
    html: baseTemplate(content, agencyInfo)
  })
}

export async function enviarRecordatorio24h(reserva: ReservaEmailData) {
  const agencyInfo = await getAgencyInfo()
  const content = `
    <h2>¡Mañana es tu tour! 🌟</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>Te recordamos que mañana tienes reservado tu tour. ¡Estamos emocionados de recibirte!</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tour</span>
        <span class="info-value">${reserva.tour.nombre}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha</span>
        <span class="info-value">${reserva.fecha_tour}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hora de salida</span>
        <span class="info-value">${reserva.hora_salida || 'Por confirmar'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Punto de encuentro</span>
        <span class="info-value">${reserva.tour.punto_encuentro || agencyInfo.address}</span>
      </div>
    </div>
    
    <div class="alert">
      <div class="alert-title">📋 No olvides llevar:</div>
      <ul style="margin:10px 0 0 0; padding-left: 20px;">
        <li>Documento de identidad</li>
        <li>Ropa cómoda y abrigada</li>
        <li>Protector solar y gorra</li>
        <li>Agua y snacks</li>
        <li>Cámara fotográfica</li>
      </ul>
    </div>
    
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    <p>¡Nos vemos mañana!</p>
  `

  // Ensure email is trimmed
  const toEmail = reserva.cliente.email.trim()

  console.log(`[Email] FROM: ${FROM_EMAIL}`)
  console.log(`[Email] TO: '${toEmail}'`)

  if (toEmail !== 'fabriutola@gmail.com' && FROM_EMAIL.includes('onboarding@resend.dev')) {
    console.warn(`[Email] ADVERTENCIA: Intentando enviar a '${toEmail}' en modo prueba. Resend probablemente lo bloqueará.`)
  }

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `¡Mañana es tu tour! Recordatorio importante - ${reserva.tour.nombre}`,
    html: baseTemplate(content, agencyInfo)
  })

  if (error) {
    console.error('[Email] Error Resend:', error)
    if (error.message?.includes('only send testing emails')) {
      throw new Error(`MODO PRUEBA: Solo puedes enviar correos a tu propio email registrado (fabriutola@gmail.com). El sistema intentó enviar a: '${toEmail}'. Edita el cliente de la reserva.`)
    }
    throw new Error(error.message)
  }
  console.log('[Email] Enviado con éxito. ID:', data?.id)
}

export async function enviarRecordatorio2h(reserva: ReservaEmailData) {
  // This would typically be sent via SMS/WhatsApp
  // For now, we'll send a short email as fallback
  const agencyInfo = await getAgencyInfo()
  const content = `
    <h2>¡Tu tour comienza en 2 horas! ⏰</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>Tu tour <strong>${reserva.tour.nombre}</strong> comienza pronto.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Hora de salida</span>
        <span class="info-value">${reserva.hora_salida || 'Ver confirmación'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Punto de encuentro</span>
        <span class="info-value">${reserva.tour.punto_encuentro || agencyInfo.address}</span>
      </div>
    </div>
    
    <p style="font-size: 18px; text-align: center;">📍 <strong>¡Te esperamos!</strong></p>
  `

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: reserva.cliente.email,
    subject: `⏰ ¡Tu tour comienza en 2 horas! - ${reserva.tour.nombre}`,
    html: baseTemplate(content, agencyInfo)
  })
}

export async function enviarSolicitudFeedback(reserva: ReservaEmailData, feedbackUrl?: string) {
  const agencyInfo = await getAgencyInfo()
  const reviewUrl = feedbackUrl || `https://forms.gle/TUFORMULARIO`

  const content = `
    <h2>¿Cómo fue tu experiencia? 💬</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>Esperamos que hayas disfrutado tu tour a <strong>${reserva.tour.destino}</strong>. Tu opinión es muy importante para nosotros.</p>
    
    <p style="text-align: center;">
      <a href="${reviewUrl}" class="button">Dejar mi opinión</a>
    </p>
    
    <p>Toma solo 2 minutos y nos ayudará a mejorar nuestros servicios.</p>
    
    <div class="info-box" style="text-align: center;">
      <p style="margin: 0; font-size: 16px;">¿Te gustaría explorar más destinos?</p>
      <p style="margin: 10px 0 0 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://tourreservas.bo'}/tours" style="color: #f43f5e; font-weight: 600;">Ver todos los tours →</a>
      </p>
    </div>
    
    <p>¡Gracias por elegir ${agencyInfo.name}!</p>
  `

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: reserva.cliente.email,
    subject: `¿Cómo fue tu experiencia? Cuéntanos - ${reserva.tour.nombre}`,
    html: baseTemplate(content, agencyInfo)
  })
}

export async function enviarEmailPagoConfirmado(reserva: ReservaEmailData) {
  const agencyInfo = await getAgencyInfo()
  const content = `
    <h2>¡Pago Confirmado! ✅</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>¡Excelentes noticias! Hemos verificado tu pago y tu reserva está confirmada.</p>
    
    <div class="info-box" style="background: #d1fae5; border: 1px solid #10b981;">
      <div style="text-align: center; padding: 10px 0;">
        <span style="font-size: 48px;">🎉</span>
        <h3 style="color: #059669; margin: 10px 0 0 0;">Reserva Confirmada</h3>
      </div>
    </div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tour</span>
        <span class="info-value">${reserva.tour.nombre}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Destino</span>
        <span class="info-value">${reserva.tour.destino}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha</span>
        <span class="info-value">${reserva.fecha_tour}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hora de salida</span>
        <span class="info-value">${reserva.hora_salida || 'Te confirmaremos pronto'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Punto de encuentro</span>
        <span class="info-value">${reserva.tour.punto_encuentro || agencyInfo.address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Personas</span>
        <span class="info-value">${reserva.num_personas}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total pagado</span>
        <span class="info-value" style="color: #059669;">Bs ${reserva.precio_total.toLocaleString()} ✓</span>
      </div>
    </div>
    
    <p>Tu código de reserva es: <strong>${reserva.id.slice(0, 8).toUpperCase()}</strong></p>
    <p>Te enviaremos un recordatorio 24 horas antes del tour con los detalles finales.</p>
    <p>¡Gracias por tu confianza! Estamos emocionados de recibirte.</p>
  `

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: reserva.cliente.email,
    subject: `✅ ¡Pago Confirmado! ${reserva.tour.nombre} - ${reserva.fecha_tour}`,
    html: baseTemplate(content, agencyInfo)
  })
}

export async function enviarEmailCancelacion(reserva: ReservaEmailData) {
  const agencyInfo = await getAgencyInfo()
  const content = `
    <h2>Reserva Cancelada ❌</h2>
    <p>Hola <strong>${reserva.cliente.nombre_completo}</strong>,</p>
    <p>Lamentamos informarte que tu reserva para el tour <strong>${reserva.tour.nombre}</strong> ha sido cancelada debido a que no recibimos tu comprobante de pago en el tiempo establecido.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tour</span>
        <span class="info-value">${reserva.tour.nombre}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha</span>
        <span class="info-value">${reserva.fecha_tour}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estado</span>
        <span class="info-value" style="color: #ef4444;">Cancelada</span>
      </div>
    </div>
    
    <div class="alert" style="background: #fff1f2; border: 1px solid #fecdd3;">
      <div class="alert-title" style="color: #be123c;">¿Realizaste el pago?</div>
      <p style="margin:0">Si ya realizaste el pago y crees que esto es un error, por favor contáctanos INMEDIATAMENTE para reactivar tu reserva.</p>
      <p style="margin: 10px 0 0 0;">
        <strong>📞 Teléfono / WhatsApp:</strong> ${agencyInfo.whatsapp}
      </p>
    </div>
    
    <p>Si deseas realizar una nueva reserva, puedes hacerlo en nuestro sitio web.</p>
  `

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: reserva.cliente.email,
    subject: `❌ Reserva Cancelada - ${reserva.tour.nombre}`,
    html: baseTemplate(content, agencyInfo)
  })
}

// ============ SMS/WHATSAPP (placeholder) ============

export async function enviarSMS2h(telefono: string, tourNombre: string, puntoEncuentro: string) {
  // This would integrate with Twilio or similar service
  // For now, log the message that would be sent
  const agencyInfo = await getAgencyInfo()
  const mensaje = `¡Tu tour ${tourNombre} comienza en 2 horas! Punto de encuentro: ${puntoEncuentro}. ¡Nos vemos pronto! - ${agencyInfo.name}`

  console.log(`[SMS] To: ${telefono}`)
  console.log(`[SMS] Message: ${mensaje}`)

  // TODO: Integrate with Twilio
  // await twilioClient.messages.create({
  //   body: mensaje,
  //   from: process.env.TWILIO_PHONE,
  //   to: telefono
  // })

  return { success: true, message: mensaje }
}
