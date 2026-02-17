'use client'

import Link from 'next/link'
import { Clock, Users, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface Tour {
    id: string
    nombre: string
    imagen_url: string | null
    precio_por_persona: number | null
    duracion_horas: number | null
    destino: string | null
    descripcion: string | null
    incluye: string[] | null
    galeria: string[] | null
    itinerario: any | null
    qr_pago_url: string | null
}

interface TourCardProps {
    tour: Tour
    className?: string
}

export default function TourCard({ tour, className }: TourCardProps) {

    return (
        <div className={cn("group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2", className)}>

            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary/5">
                {tour.imagen_url ? (
                    <>
                        <img
                            src={tour.imagen_url}
                            alt={tour.nombre}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                        {/* Placeholder Icon */}
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}


                {/* Floating Badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                        <MapPin className="w-3 h-3 text-primary" />
                        {tour.destino}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-serif font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                        {tour.nombre}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {tour.descripcion}
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary-dark">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{tour.duracion_horas} horas</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary-dark">
                        <Users className="h-3.5 w-3.5" />
                        <span>Grupal</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between pt-4 border-t border-dashed border-border/60">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Desde</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary font-serif">Bs {tour.precio_por_persona}</span>
                            <span className="text-xs text-muted-foreground">/pers</span>
                        </div>
                    </div>

                    <Link href={`/tours/${tour.id}`}>
                        <Button
                            variant="primary"
                            size="icon"
                            className="bg-foreground text-white rounded-full h-10 w-10 hover:bg-primary hover:scale-110 transition-all shadow-lg"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
