'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export interface ConfigItem {
    id: string
    clave: string
    valor: string | null
    descripcion: string | null
    tipo: string
    categoria: string
}

// ============ GET CONFIGURATION ============

/**
 * Get all configuration items
 */
export async function getConfiguracion(): Promise<ConfigItem[]> {
    noStore()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .order('categoria', { ascending: true })
        .order('clave', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
}

/**
 * Get a single configuration value by key
 */
export async function getConfigValue(clave: string): Promise<string | null> {
    noStore()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', clave)
        .single()

    if (error) return null
    return data?.valor || null
}

/**
 * Get multiple configuration values by keys
 */
export async function getMultipleConfig(claves: string[]): Promise<Record<string, string | null>> {
    noStore()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', claves)

    if (error) throw new Error(error.message)

    const result: Record<string, string | null> = {}
    claves.forEach(clave => {
        result[clave] = null
    })

    data?.forEach(item => {
        result[item.clave] = item.valor
    })

    return result
}

/**
 * Get configuration items by category
 */
export async function getConfigByCategory(categoria: string): Promise<ConfigItem[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .eq('categoria', categoria)
        .order('clave', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
}

// ============ SAVE CONFIGURATION ============

/**
 * Save a single configuration value
 */

/**
 * Save a single configuration value
 */
export async function saveConfiguracion(clave: string, valor: string): Promise<{ success: boolean }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('configuracion')
        .upsert({
            clave,
            valor,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'clave'
        })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/configuracion')
    return { success: true }
}

/**
 * Save multiple configuration values at once
 */
export async function saveMultipleConfig(configs: Record<string, string>): Promise<{ success: boolean }> {
    const supabase = await createClient()

    const upsertData = Object.entries(configs).map(([clave, valor]) => ({
        clave,
        valor,
        updated_at: new Date().toISOString()
    }))

    if (upsertData.length > 0) {
        const { error } = await supabase
            .from('configuracion')
            .upsert(upsertData, { onConflict: 'clave' })

        if (error) throw new Error(error.message)
    }

    revalidatePath('/admin/configuracion')
    return { success: true }
}


/**
 * Delete a configuration item
 */
export async function deleteConfiguracion(clave: string): Promise<{ success: boolean }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('configuracion')
        .delete()
        .eq('clave', clave)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// ============ HELPER: Get Agency Config for Public Use ============

/**
 * Get public agency configuration (for emails, SMS, payment pages)
 * This is cached and can be used server-side
 */
export async function getAgencyConfig() {
    const config = await getMultipleConfig([
        'nombre_agencia',
        'telefono_contacto',
        'email_contacto',
        'whatsapp',
        'direccion',
        'moneda',
        'porcentaje_anticipo'
    ])

    return {
        nombre: config.nombre_agencia || 'TourReservas Bolivia',
        telefono: config.telefono_contacto || '+591 70000000',
        email: config.email_contacto || 'info@tourreservas.bo',
        whatsapp: config.whatsapp || '+591 70000000',
        direccion: config.direccion || 'La Paz, Bolivia',
        moneda: config.moneda || 'BOB',
        porcentajeAnticipo: parseInt(config.porcentaje_anticipo || '50')
    }
}

/**
 * Get payment configuration for QR and payment pages
 */
export async function getPaymentConfig() {
    const config = await getMultipleConfig([
        'pago_yape_numero',
        'pago_yape_titular',
        'pago_altoke_numero',
        'pago_altoke_titular',
        'pago_banco_nombre',
        'pago_banco_cuenta',
        'pago_banco_titular',
        'pago_qr_url'
    ])

    return {
        yape_numero: config.pago_yape_numero || '+591 70000000',
        yape_nombre: config.pago_yape_titular || 'TourReservas Bolivia',
        altoke_cuenta: config.pago_altoke_numero || '71234567',
        altoke_nombre: config.pago_altoke_titular || 'TourReservas Bolivia',
        banco_nombre: config.pago_banco_nombre || 'Banco de Bolivia',
        banco_cuenta: config.pago_banco_cuenta || '1234567890',
        banco_titular: config.pago_banco_titular || 'TourReservas S.R.L.',
        qr_url: config.pago_qr_url || ''
    }
}

/**
 * Get reminder settings
 */
export async function getReminderConfig() {
    const config = await getMultipleConfig([
        'recordatorio_email_activo',
        'recordatorio_sms_activo',
        'recordatorio_dias_antes',
        'recordatorio_texto_email',
        'recordatorio_texto_sms'
    ])

    return {
        activoEmail: config.recordatorio_email_activo === 'true',
        activoSms: config.recordatorio_sms_activo === 'true',
        diasAntes: parseInt(config.recordatorio_dias_antes || '1'),
        textoEmail: config.recordatorio_texto_email || '',
        textoSms: config.recordatorio_texto_sms || ''
    }
}
