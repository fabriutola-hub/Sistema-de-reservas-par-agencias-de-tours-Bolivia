import Link from 'next/link'
import {
    MapPin,
    Mail,
    Clock,
    Instagram,
    Facebook,
    MessageCircle,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
    ArrowRight,
} from 'lucide-react'

export default function Footer() {
    const year = new Date().getFullYear()

    const social = [
        { icon: Facebook, label: 'Facebook', href: '#' },
        { icon: Instagram, label: 'Instagram', href: '#' },
        { icon: MessageCircle, label: 'WhatsApp', href: '#' },
    ]

    const explore = [
        { label: 'Inicio', href: '/' },
        { label: 'Tours', href: '/tours' },
        { label: 'Destinos', href: '/destinos' },
        { label: 'Nosotros', href: '/nosotros' },
    ]

    

    return (
        <footer className="relative bg-navy-900 text-white overflow-hidden">
            {/* Ambient gradients */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-bl from-primary/25 via-secondary/15 to-transparent blur-3xl opacity-80" />
                <div className="absolute -bottom-28 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-secondary/20 via-primary/10 to-transparent blur-3xl opacity-70" />
                <div className="absolute inset-0 opacity-[0.18] bg-grain" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top CTA (bento hero card) */}
                <div className="pt-14 lg:pt-16">
                    <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
                        <div className="p-8 md:p-10 lg:p-12">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                        <Sparkles className="h-4 w-4 text-primary-light" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/70 font-medium">
                                            Diseño de rutas · Soporte real
                                        </span>
                                    </div>

                                    <h2 className="mt-5 font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
                                        Viajes con confianza
                                    </h2>

                                    <p className="mt-3 text-white/60 leading-relaxed">
                                        Rutas ideales según tu tiempo, presupuesto y estilo de viaje.
                                    </p>

                                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
                                        <span className="inline-flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary-light" />
                                            Operación clara y segura
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-white/30" />
                                        <span>Guías expertos</span>
                                        <span className="h-1 w-1 rounded-full bg-white/30" />
                                        <span>Experiencias auténticas</span>
                                    </div>
                                </div>

                                <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/tours"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-navy-900 px-6 py-3 text-sm font-semibold
                               hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        Explorar tours
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        href="/contacto"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white
                               hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                    >
                                        Hablar con un asesor
                                        <ArrowUpRight className="h-4 w-4 opacity-80" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* subtle divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* quick links row */}
                        <div className="px-8 md:px-10 lg:px-12 py-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                            <p className="text-xs text-white/45">
                                Respuesta rápida por WhatsApp y correo. Horarios de oficina en La Paz.
                            </p>

                            <a
                                href="#top"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                            >
                                Volver arriba
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main footer grid */}
                <div className="py-14 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
                        {/* Brand */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300">
                                    <span className="text-white font-bold text-lg">TR</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">
                                    Tour<span className="text-primary-light">Reservas</span>
                                </span>
                            </Link>

                            <p className="text-white/55 text-sm leading-relaxed max-w-sm">
                                Descubre la magia de Bolivia con experiencias auténticas, guías expertos y aventuras que recordarás siempre.
                            </p>

                            <div className="flex gap-3">
                                {social.map(({ icon: Icon, label, href }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center
                               hover:bg-primary/20 hover:border-primary/30 transition-all duration-300
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        aria-label={label}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Icon className="w-4 h-4 text-white/65" />
                                    </a>
                                ))}
                            </div>

                            {/* Newsletter (glass card) */}
                            
                        </div>

                        {/* Explore */}
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold text-white/45 tracking-wider uppercase mb-6">
                                Explorar
                            </h3>
                            <ul className="space-y-3.5">
                                {explore.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-white/65 hover:text-primary-light text-sm font-medium transition-colors duration-300 flex items-center gap-1 group"
                                        >
                                            {item.label}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Destinos */}
                        <div className="lg:col-span-3">
                            <h3 className="text-sm font-semibold text-white/45 tracking-wider uppercase mb-6">
                                Destinos top
                            </h3>
                            <ul className="space-y-3.5">
                                
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="lg:col-span-3">
                            <h3 className="text-sm font-semibold text-white/45 tracking-wider uppercase mb-6">
                                Contacto
                            </h3>

                            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-black/20">
                                <ul className="space-y-4 text-sm text-white/65">
                                    <li className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                                        <span>
                                            Av. 16 de Julio #1440,<br />
                                            El Prado, La Paz
                                        </span>
                                    </li>

                                    <li className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-primary-light flex-shrink-0" />
                                        <a className="hover:text-primary-light transition-colors" href="mailto:info@tourreservas.bo">
                                            info@tourreservas.bo
                                        </a>
                                    </li>

                                    <li className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-primary-light flex-shrink-0" />
                                        <span>Lun - Vie: 9:00 - 18:00</span>
                                    </li>
                                </ul>

                                <div className="mt-5 flex gap-3">
                                    <Link
                                        href="/contacto"
                                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white text-navy-900 px-4 py-2.5 text-xs font-semibold
                               hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        Contactar
                                    </Link>
                                    <a
                                        href="#"
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white
                               hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10">
                    <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/35 text-xs font-medium">
                            © {year} TourReservas Bolivia. Todos los derechos reservados.
                        </p>

                        <div className="flex gap-6">
                            <Link href="/privacidad" className="text-white/35 hover:text-white/65 text-xs font-medium transition-colors duration-300">
                                Privacidad
                            </Link>
                            <Link href="/terminos" className="text-white/35 hover:text-white/65 text-xs font-medium transition-colors duration-300">
                                Términos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
