import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TourDetailClient from './TourDetailClient'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ id: string }>
}

async function getTour(id: string) {
    const supabase = await createClient()
    const { data: tour } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single()
    return tour
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const tour = await getTour(id)

    if (!tour) {
        return {
            title: 'Tour no encontrado',
        }
    }

    return {
        title: tour.nombre,
        description: tour.descripcion?.slice(0, 160) + '...',
        openGraph: {
            title: tour.nombre,
            description: tour.descripcion?.slice(0, 160) + '...',
            images: tour.imagen_url ? [tour.imagen_url] : [],
        },
    }
}

export default async function TourPage({ params }: Props) {
    const { id } = await params
    const tour = await getTour(id)

    if (!tour) {
        return notFound()
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: tour.nombre,
        description: tour.descripcion,
        image: tour.imagen_url,
        offers: {
            '@type': 'Offer',
            price: tour.precio_por_persona,
            priceCurrency: 'BOB',
            availability: 'https://schema.org/InStock',
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TourDetailClient id={id} initialTour={tour} />
        </>
    )
}
