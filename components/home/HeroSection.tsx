'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Globe, Map, Star, ShieldCheck, Sparkles } from 'lucide-react'

export default function HeroSection() {
    const reduce = useReducedMotion()

    const fadeUp = {
        hidden: { opacity: 0, y: reduce ? 0 : 18 },
        show: { opacity: 1, y: 0 },
    }

    const fadeIn = {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
    }

    return (
        <section className="relative w-full min-h-screen bg-background text-foreground overflow-hidden bg-grain">
            {/* Ambient mesh + glow */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-gradient-to-bl from-lavender/35 via-transparent to-transparent blur-3xl" />
                <div className="absolute -bottom-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-mint/18 via-transparent to-transparent blur-3xl" />
                <div className="absolute top-24 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-coral/18 via-violet/14 to-transparent blur-3xl" />

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(60% 60% at 50% 30%, black 0%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(60% 60% at 50% 30%, black 0%, transparent 70%)',
                    }}
                />
            </div>

            <div className="container mx-auto px-4 md:px-12 pt-28 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left: Editorial */}
                    <div className="lg:col-span-7 relative z-10">
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="show"
                            transition={{ duration: 0.9 }}
                            className="mb-7 flex flex-wrap items-center gap-3"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white-lavender/70 px-4 py-2 backdrop-blur-md">
                                <Sparkles size={14} className="text-violet" />
                                <span className="font-technical text-[10px] uppercase tracking-widest text-navy-900/70">
                                    Turismo receptivo · Bolivia
                                </span>
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white/40 px-4 py-2 backdrop-blur-md">
                                <ShieldCheck size={14} className="text-navy-900/70" />
                                <span className="font-technical text-[10px] uppercase tracking-widest text-navy-900/70">
                                    Soporte humano 24/7
                                </span>
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            transition={{ duration: 1.05, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="font-serif text-[clamp(3.4rem,8.8vw,7.2rem)] leading-[0.9] tracking-tight text-navy-900"
                        >
                            Bolivia <br />
                            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-violet via-coral to-violet">
                                Inexplorada
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            transition={{ duration: 0.95, delay: 0.22 }}
                            className="mt-7 font-sans text-lg text-navy-900/70 max-w-xl leading-relaxed text-pretty"
                        >
                            Diseñamos viajes que se sienten curados: silencio en el Salar, mística en el Titicaca y
                            Amazonía vibrante, con logística clara y experiencia local.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            transition={{ duration: 0.95, delay: 0.34 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center"
                        >
                            <Link
                                href="/tours"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-navy-900 text-white-lavender rounded-full hover:bg-violet transition-all duration-300 shadow-xl shadow-navy-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <span className="font-technical text-xs tracking-widest uppercase">
                                    Explorar catálogo
                                </span>
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                            </Link>

                            <Link
                                href="/galeria"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-navy-900/15 bg-white/30 backdrop-blur-md hover:border-violet/40 hover:bg-white/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <span className="font-technical text-xs tracking-widest uppercase text-navy-900 group-hover:text-violet transition-colors">
                                    Ver galería
                                </span>
                            </Link>
                        </motion.div>

                        {/* Proof row */}
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="show"
                            transition={{ duration: 0.9, delay: 0.5 }}
                            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl"
                        >
                            {[
                                { icon: <Star size={16} className="text-coral" />, title: "4.9 promedio", desc: "Reseñas verificadas" },
                                { icon: <Globe size={16} className="text-violet" />, title: "Rutas únicas", desc: "Cultura + naturaleza" },
                                { icon: <Map size={16} className="text-navy-900" />, title: "Operación clara", desc: "Antes, durante y después" },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-navy-900/10 bg-white/35 backdrop-blur-md p-4"
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-navy-900/60">{item.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right: Bento visual */}
                    <div className="lg:col-span-5 relative">
                        {/* Decorative glow */}
                        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-coral/20 rounded-full blur-2xl" />

                        <div className="grid grid-cols-12 gap-4">
                            {/* Main image card */}
                            <motion.div
                                initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="col-span-12 relative"
                            >
                                <div
                                    className={[
                                        "relative aspect-[4/5] rounded-[2.8rem] overflow-hidden shadow-2xl shadow-navy-900/20",
                                        "border border-white/40 bg-white/10 backdrop-blur-md",
                                        "transition-transform duration-700 ease-out",
                                        reduce ? "" : "hover:rotate-0 hover:scale-[1.01]",
                                    ].join(" ")}
                                    style={{ transform: reduce ? undefined : "rotate(1.5deg)" }}
                                >
                                    <Image
                                        src="/Imagen/home-hero-abstract.png"
                                        alt="Salar de Uyuni"
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 520px"
                                        className="object-cover scale-[1.08] transition-transform duration-[1400ms] ease-out hover:scale-100 motion-reduce:transform-none"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/45 via-navy-900/10 to-transparent mix-blend-multiply" />

                                    {/* Top-right mini tag */}
                                    <div className="absolute top-5 right-5 rounded-full bg-white/35 px-4 py-2 backdrop-blur-md border border-white/40">
                                        <span className="font-technical text-[10px] uppercase tracking-widest text-navy-900/70">
                                            Temporada recomendada · Mayo–Oct
                                        </span>
                                    </div>

                                </div>

                                {/* Floating "Card" Element (Moved outside to avoid clipping) */}
                                <motion.div
                                    className="absolute -bottom-6 -left-6 z-20 bg-white-lavender/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/50 max-w-[240px]"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="flex items-center gap-2 mb-2 text-violet">
                                        <Globe size={16} />
                                        <span className="font-technical text-[10px] uppercase tracking-wider">Destination</span>
                                    </div>
                                    <p className="font-serif text-xl leading-none mb-1 text-navy-900">Salar de Uyuni</p>
                                    <span className="text-xs text-navy-900/50 font-sans">Potosí, Bolivia</span>
                                </motion.div>
                            </motion.div>

                            {/* Bento mini-cards */}
                            <motion.div
                                variants={fadeIn}
                                initial="hidden"
                                animate="show"
                                transition={{ duration: 0.9, delay: 0.65 }}
                                className="col-span-7 rounded-3xl border border-navy-900/10 bg-white/35 backdrop-blur-md p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-navy-900/80">
                                    <Map size={16} />
                                    <p className="font-technical text-[10px] uppercase tracking-widest">
                                        Curado por expertos
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-navy-900/70 leading-relaxed">
                                    Itinerarios con tiempos realistas, puntos fotográficos y recomendaciones locales.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={fadeIn}
                                initial="hidden"
                                animate="show"
                                transition={{ duration: 0.9, delay: 0.72 }}
                                className="col-span-5 rounded-3xl border border-navy-900/10 bg-navy-900 text-white-lavender p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-technical text-[10px] uppercase tracking-widest text-white/70">
                                        Rating
                                    </p>
                                    <Star size={16} className="text-coral" />
                                </div>
                                <p className="mt-2 font-serif text-3xl leading-none">4.9</p>
                                <p className="mt-1 text-xs text-white/60">Promedio de clientes</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
