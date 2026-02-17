'use client'

import HeroSection from '@/components/home/HeroSection'
import TourCard from '@/components/ui/TourCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTours } from '@/lib/hooks/useTours'

export default function Home() {
  const { tours, loading } = useTours(true)

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      <HeroSection />

      {/* Featured Tours Section (Curated) */}
      <section className="py-32 px-6 md:px-12 bg-white-lavender relative">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <SectionHeading
              title="Destinos Selectos"
              subtitle="Curated Collection"
            />
            <Link href="/tours">
              <Button variant="outline" className="rounded-full px-8 py-6 border-navy-900/10 text-navy-900 hover:bg-navy-900 hover:text-white-lavender transition-all duration-300 font-technical tracking-widest uppercase text-xs">
                Ver Todo el Catálogo
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/2] bg-navy-900/5 rounded-[1.5rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {tours.map((tour) => (
                <div key={tour.id}>
                  <TourCard
                    id={tour.id}
                    title={tour.nombre}
                    location={tour.destino || 'Bolivia'}
                    duration={tour.duracion_horas ? `${tour.duracion_horas} horas` : 'Consultar'}
                    price={tour.precio_por_persona || 0}
                    imageUrl={tour.imagen_url}
                    category="Aventura" // Default category as it's not in the simple type
                    difficulty="Moderado" // Default difficulty
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-violet to-navy-900 text-white-lavender text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral/30 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-serif text-5xl md:text-7xl mb-8">Empieza tu viaje</h2>
          <p className="font-sans text-lg mb-12 text-white-lavender/80">
            Personaliza tu experiencia o elige uno de nuestros itinerarios curados.
          </p>
          <Link href="/contacto">
            <Button className="rounded-full px-12 py-8 bg-white-lavender text-navy-900 hover:bg-coral hover:text-navy-900 transition-colors duration-300 font-technical tracking-widest uppercase text-sm shadow-2xl">
              Contactar Especialista
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
