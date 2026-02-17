import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tourreservas.bo'

    // Rutas estáticas
    const routes = [
        '',
        '/tours',
        '/nosotros',
        '/contacto',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Rutas dinámicas de tours
    const supabase = await createClient()
    const { data: tours } = await supabase
        .from('tours')
        .select('id, updated_at') // Asumiendo que existe updated_at si no usar nueva fecha
        .eq('activo', true)

    const tourRoutes = tours?.map((tour) => ({
        url: `${baseUrl}/tours/${tour.id}`,
        lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    })) || []

    return [...routes, ...tourRoutes]
}
