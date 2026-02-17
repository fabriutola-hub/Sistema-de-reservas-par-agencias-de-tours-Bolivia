'use server'

import { z } from 'zod'

const contactSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export type ContactState = {
    success?: boolean
    error?: string
    fieldErrors?: {
        nombre?: string[]
        email?: string[]
        mensaje?: string[]
    }
}

export async function submitContactForm(prevState: ContactState, formData: FormData): Promise<ContactState> {
    const data = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        mensaje: formData.get('mensaje'),
    }

    const result = contactSchema.safeParse(data)

    if (!result.success) {
        return {
            error: 'Por favor corrige los errores en el formulario.',
            fieldErrors: result.error.flatten().fieldErrors,
        }
    }

    try {
        // Aquí iría la lógica real de envío de email (ej. Resend, Nodemailer)
        // Por ahora simulamos un delay y éxito
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log('Mensaje de contacto recibido:', result.data)

        return {
            success: true,
        }
    } catch (error) {
        console.error('Error enviando contacto:', error)
        return {
            error: 'Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.',
        }
    }
}
