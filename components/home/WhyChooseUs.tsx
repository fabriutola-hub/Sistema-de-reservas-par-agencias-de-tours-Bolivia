'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Award, Tag, Headphones } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'

const features = [
    {
        icon: ShieldCheck,
        title: 'Seguridad Total',
        description: 'Protocolos internacionales y pagos blindados para tu tranquilidad absoluta.',
        color: 'text-teal',
        delay: 0
    },
    {
        icon: Award,
        title: 'Excelencia',
        description: 'Guías locales premiados y acceso a rutas exclusivas fuera de lo común.',
        color: 'text-violet',
        delay: 0.1
    },
    {
        icon: Tag,
        title: 'Trato Directo',
        description: 'Sin intermediarios ocultos. Tarifas justas directamente de operadores locales.',
        color: 'text-coral',
        delay: 0.2
    },
    {
        icon: Headphones,
        title: 'Concierge 24/7',
        description: 'Asistencia personalizada desde el primer clic hasta tu regreso a casa.',
        color: 'text-navy-900',
        delay: 0.3
    },
]

export default function WhyChooseUs() {
    return (
        <section className="py-24 md:py-32 bg-white-lavender relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-navy-900/10 to-transparent" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">

                <div className="mb-20">
                    <SectionHeading
                        title="La Diferencia TourReservas"
                        subtitle="Por qué elegirnos"
                        center
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: feature.delay }}
                            className="group"
                        >
                            <div className="mb-6 relative">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-white border border-navy-900/5 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className={`w-5 h-5 ${feature.color}`} strokeWidth={1} />
                                </div>
                                {/* Connecting line for tablet/desktop - decorative */}
                                {index < features.length - 1 && (
                                    <div className="hidden lg:block absolute top-6 left-12 w-[calc(100%+2rem)] h-px bg-navy-900/5 -z-10" />
                                )}
                            </div>

                            <h3 className="font-serif text-xl mb-3 text-navy-900">
                                {feature.title}
                            </h3>
                            <p className="font-sans text-sm text-navy-900/60 leading-relaxed text-pretty">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
