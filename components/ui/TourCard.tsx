'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Clock, MapPin, Users } from 'lucide-react'

interface TourCardProps {
    id: string
    title: string
    location: string
    duration: string
    price: number
    imageUrl?: string | null
    category: string
    difficulty?: 'Fácil' | 'Moderado' | 'Difícil'
}

export default function TourCard({
    id,
    title,
    location,
    duration,
    price,
    imageUrl,
    category,
    difficulty = 'Moderado'
}: TourCardProps) {
    return (
        <Link href={`/tours/${id}`} className="group block relative w-full h-full">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-navy-900/5 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-1">

                {/* Image Container with Organic Clip Path */}
                <div className="aspect-[3/2] relative overflow-hidden bg-navy-900/5 group-hover:bg-navy-900/10 transition-colors">
                    {imageUrl ? (
                        <>
                            <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {/* Gradient Overlay only if image exists */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy-900/20">
                            {/* Placeholder Icon or just empty pattern */}
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    )}

                    {/* Category Chip */}
                    <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-md rounded-full font-technical text-[10px] tracking-widest text-navy-900 uppercase shadow-sm">
                            {category}
                        </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-4 right-4">
                        <span className="inline-block px-3 py-1 bg-navy-900/90 backdrop-blur-md rounded-full font-serif text-xs text-white tracking-wide shadow-sm">
                            Bs {price}
                        </span>
                    </div>
                </div>

                {/* Content Card - Overlapping or Below? Design said "Tarjetas de tours con fotos recortadas con máscaras orgánicas" */}
                {/* Let's keep it clean below for editorial feel, or overlapping */}

                <div className="pt-5 pb-2 pr-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-teal mb-3">
                            <MapPin size={14} />
                            <span className="font-technical text-[10px] uppercase tracking-wider">{location}</span>
                        </div>
                    </div>

                    <h3 className="font-serif text-2xl mb-3 leading-tight group-hover:text-violet transition-colors duration-300 line-clamp-2">
                        {title}
                    </h3>

                    <div className="flex items-center gap-4 text-navy-900/60 border-t border-navy-900/5 pt-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} strokeWidth={1.5} />
                            <span className="font-sans text-xs">{duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users size={14} strokeWidth={1.5} />
                            <span className="font-sans text-xs">Max 12</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto text-coral">
                            <span className="font-technical text-[10px] uppercase">{difficulty}</span>
                        </div>
                    </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-violet">
                    <ArrowUpRight size={24} strokeWidth={1.5} />
                </div>
            </div>
        </Link>
    )
}
