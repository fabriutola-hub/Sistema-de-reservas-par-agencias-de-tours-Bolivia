'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const galleryImages = [
    {
        src: "/Imagen/home-hero-abstract.png",
        alt: "Salar de Uyuni Textures",
        caption: "FIG 01. SALAR INFINITO",
        aspect: "aspect-[4/3]"
    },
    {
        src: "/Imagen/about-adventure.png",
        alt: "Colonial Architecture",
        caption: "FIG 02. LEGADO",
        aspect: "aspect-[3/4]"
    },
    {
        src: "/Imagen/about-hero.png",
        alt: "Andean Woman",
        caption: "FIG 03. CULTURA VIVA",
        aspect: "aspect-[3/4]"
    },
    {
        src: "/Imagen/destination-titicaca.png",
        alt: "Lake Titicaca",
        caption: "FIG 04. AGUAS SAGRADAS",
        aspect: "aspect-[16/9]"
    },
    {
        src: "/Imagen/destination-uyuni.png", // Bolivian landscape style
        alt: "Altiplano Light",
        caption: "FIG 05. LUZ DE ALTURA",
        aspect: "aspect-square"
    },
    {
        src: "/Imagen/destination-lapaz.png",
        alt: "Dry Earth Texture",
        caption: "FIG 06. TIERRA",
        aspect: "aspect-[3/4]"
    }
]

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 md:px-12 py-32">

            {/* Header */}
            <header className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tighter mb-6 relative z-10">
                        Archivo <span className="italic text-[var(--primary)]">Visual</span>
                    </h1>
                </div>
                <div className="lg:col-span-4 flex flex-col justify-end pb-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
                        [ Colección 2026 ]
                    </p>
                    <p className="font-serif text-lg leading-relaxed max-w-sm">
                        Una selección curada de momentos, texturas y silencios del paisaje boliviano.
                    </p>
                </div>
            </header>

            {/* Gallery Grid - Asymmetric Masonry feel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-8">
                {galleryImages.map((img, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={`group flex flex-col ${index % 2 === 0 ? 'mt-0' : 'md:mt-32'} ${index === 3 ? 'lg:col-span-2' : ''}`}
                    >
                        <div className={`relative w-full ${img.aspect} overflow-hidden bg-gray-100 mb-6`}>
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes={index === 3 ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 67vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                            />
                        </div>

                        <div className="flex justify-between items-end border-t border-[var(--foreground)] pt-3">
                            <span className="font-mono text-[10px] tracking-widest uppercase">
                                {img.caption}
                            </span>
                            <span className="font-sans text-[10px] opacity-50">
                                +591
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-48 text-center">
                <p className="font-serif italic text-2xl text-[var(--neutral-400)]">
                    "La belleza reside en lo inexplorado."
                </p>
            </div>
        </div>
    )
}
