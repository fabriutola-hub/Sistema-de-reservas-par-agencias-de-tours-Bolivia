export default function NosotrosPage() {
    const stats = [
        { value: "10+", label: "Años de experiencia" },
        { value: "5k+", label: "Tours realizados" },
        { value: "15k+", label: "Clientes felices" },
        { value: "4.9", label: "Calificación promedio" },
    ]

    const timeline = [
        { year: "2015", title: "Nace TourReservas Bolivia", desc: "Empezamos en La Paz con un equipo pequeño y una idea grande: mostrar la Bolivia real." },
        { year: "2018", title: "Expansión de rutas", desc: "Consolidamos experiencias en altiplano, amazonía y valles con operación estandarizada." },
        { year: "2021", title: "Calidad + procesos", desc: "Mejoramos logística, seguridad y atención con enfoque en satisfacción y consistencia." },
        { year: "2025", title: "Equipo nacional", desc: "Más de 50 profesionales y alianzas locales para turismo responsable y auténtico." },
    ]

    const values = [
        {
            title: "Autenticidad",
            desc: "Experiencias reales, con historias y cultura viva; sin “turismo de catálogo”.",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-7-4.35-7-10a4 4 0 017-2 4 4 0 017 2c0 5.65-7 10-7 10z" />
                </svg>
            ),
        },
        {
            title: "Seguridad",
            desc: "Operación clara, guías preparados y comunicación transparente en cada etapa.",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                </svg>
            ),
        },
        {
            title: "Sostenibilidad",
            desc: "Priorizamos comunidades locales y prácticas responsables con el entorno.",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C7 6 5 10 5 13a7 7 0 0014 0c0-3-2-7-7-10z" />
                </svg>
            ),
        },
        {
            title: "Excelencia",
            desc: "Detalles que importan: puntualidad, información clara y soporte real.",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17l-5 3 2-6-5-4h6l2-6 2 6h6l-5 4 2 6-5-3z" />
                </svg>
            ),
        },
    ]

    const team = [
        { name: "Carlos Mamani", role: "Director General" },
        { name: "María Flores", role: "Guía Especialista" },
        { name: "Diego Quispe", role: "Coordinador de Tours" },
    ]

    return (
        <div className="bg-background text-foreground">
            <main>
                {/* HERO (más editorial + profundidad) */}
                <header className="relative isolate overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/Imagen/about-hero.png"
                            alt="Paisaje Bolivia"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
                    </div>

                    {/* blobs/gradientes suaves */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/30 via-secondary/25 to-primary/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 right-[-10rem] h-96 w-96 rounded-full bg-gradient-to-tr from-secondary/25 via-primary/20 to-transparent blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex min-h-[520px] items-end pb-14 pt-24 md:min-h-[620px] md:pb-20">
                            <div className="max-w-3xl">
                                <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
                                    <ol className="flex flex-wrap items-center gap-2">
                                        <li><a className="hover:text-white transition-colors" href="/">Inicio</a></li>
                                        <li className="text-white/40">/</li>
                                        <li className="text-white">Nosotros</li>
                                    </ol>
                                </nav>

                                <h1 className="font-serif text-4xl font-bold tracking-tight text-white !text-white md:text-6xl" style={{ color: '#ffffff' }}>
                                    Nuestra Historia
                                </h1>

                                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white !text-white md:text-lg" style={{ color: '#ffffff' }}>
                                    Más de 10 años creando viajes auténticos en Bolivia: cultura viva, naturaleza indómita y
                                    servicio impecable.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href="/tours"
                                        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transform-none"
                                    >
                                        Ver tours
                                    </a>
                                    <a
                                        href="/contacto"
                                        className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                                    >
                                        Hablar con un asesor
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENIDO */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    {/* Bento grid principal */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* Card: Historia (grande) */}
                        <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:col-span-7">
                            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />
                            <div className="relative">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <p className="text-sm font-medium text-muted-foreground">Desde 2015</p>
                                </div>

                                <h2 className="mt-5 font-serif text-3xl font-bold tracking-tight md:text-4xl">
                                    Diseñamos experiencias inolvidables en todo el país
                                </h2>

                                <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
                                    <p>
                                        TourReservas Bolivia nació con una idea simple: mostrar al mundo que Bolivia es mucho más
                                        que paisajes bonitos; es cultura viva, tradiciones ancestrales y rutas que se sienten.
                                    </p>
                                    <p>
                                        Comenzamos con una pequeña oficina en La Paz y dos guías apasionados. Hoy, somos una
                                        familia de más de 50 profesionales dedicados a elevar el estándar del turismo en Bolivia.
                                    </p>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href="/nosotros#timeline"
                                        className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground motion-reduce:transform-none"
                                    >
                                        Ver hitos
                                    </a>
                                    <a
                                        href="/nosotros#equipo"
                                        className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                                    >
                                        Conocer al equipo
                                    </a>
                                </div>
                            </div>
                        </article>

                        {/* Imagen 1 */}
                        <figure className="group relative overflow-hidden rounded-3xl border border-border bg-muted shadow-sm lg:col-span-5">
                            <img
                                src="/Imagen/about-adventure.png"
                                alt="Aventura en Bolivia"
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
                            />
                            <figcaption className="absolute inset-x-0 bottom-0 p-6">
                                <div className="rounded-2xl bg-black/30 p-4 text-white backdrop-blur-md ring-1 ring-white/15">
                                    <p className="text-sm font-semibold">Aventura y paisajes</p>
                                    <p className="mt-1 text-sm text-white/75">Rutas seleccionadas, logística clara y soporte real.</p>
                                </div>
                            </figcaption>
                        </figure>

                        {/* Misión (glass) */}
                        <article className="relative overflow-hidden rounded-3xl border border-border bg-white/5 p-8 shadow-sm backdrop-blur-xl ring-1 ring-white/10 lg:col-span-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-secondary/25 text-foreground ring-1 ring-border">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                                <h3 className="font-serif text-2xl font-bold">Nuestra Misión</h3>
                            </div>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                Brindar experiencias auténticas, seguras y de alta calidad, promoviendo el desarrollo sostenible
                                de comunidades locales y la conservación del patrimonio natural y cultural.
                            </p>
                        </article>

                        {/* Visión (glass) */}
                        <article className="relative overflow-hidden rounded-3xl border border-border bg-white/5 p-8 shadow-sm backdrop-blur-xl ring-1 ring-white/10 lg:col-span-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/25 to-primary/25 text-foreground ring-1 ring-border">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </span>
                                <h3 className="font-serif text-2xl font-bold">Nuestra Visión</h3>
                            </div>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                Ser la agencia referente en turismo receptivo en Bolivia, reconocida por excelencia operativa,
                                innovación en rutas y compromiso con la satisfacción del cliente.
                            </p>
                        </article>
                    </div>

                    {/* Stats (más “premium”) */}
                    <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-foreground">
                        <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
                            {stats.map((s) => (
                                <div key={s.label} className="bg-foreground p-8 text-center">
                                    <div className="font-serif text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 md:text-5xl">
                                        {s.value}
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-white/60 md:text-sm">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div id="timeline" className="mt-16">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nuestro camino</p>
                                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
                                    Hitos que nos trajeron hasta aquí
                                </h2>
                            </div>
                            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            {timeline.map((t) => (
                                <article key={t.year} className="rounded-3xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                                    <div className="flex items-baseline justify-between gap-6">
                                        <p className="text-sm font-semibold text-primary">{t.year}</p>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold">{t.title}</h3>
                                    <p className="mt-3 text-muted-foreground leading-relaxed">{t.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="mt-16">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lo que defendemos</p>
                                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
                                    Valores que se sienten en cada tour
                                </h2>
                            </div>
                            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                        </div>

                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((v) => (
                                <article key={v.title} className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground ring-1 ring-border transition group-hover:bg-primary/10 group-hover:text-primary">
                                        {v.icon}
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                                    <p className="mt-2 text-muted-foreground leading-relaxed">{v.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Equipo */}
                    <div id="equipo" className="mt-16">
                        <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground">Personas reales</p>
                            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
                                Conoce a nuestro equipo
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {team.map((m) => (
                                <article key={m.name} className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                                    <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square">
                                        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_0%,hsl(var(--primary)/0.12),transparent_60%)]" />
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                                            <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold">{m.name}</h3>
                                    <p className="mt-1 text-sm font-medium text-primary">{m.role}</p>

                                    <div className="mt-5 flex gap-2">
                                        <a
                                            href="/contacto"
                                            className="inline-flex flex-1 items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                                        >
                                            Contactar
                                        </a>
                                        <a
                                            href="/tours"
                                            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                                            aria-label={`Ver tours con ${m.name}`}
                                        >
                                            Ver tours
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* CTA final */}
                    <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 p-10 md:p-12">
                        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                            <div className="max-w-2xl">
                                <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                                    ¿Listo para vivir Bolivia de verdad?
                                </h2>
                                <p className="mt-3 text-muted-foreground leading-relaxed">
                                    Te ayudamos a elegir la ruta ideal según tu tiempo, presupuesto y nivel de aventura.
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <a
                                    href="/contacto"
                                    className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground motion-reduce:transform-none"
                                >
                                    Cotizar ahora
                                </a>
                                <a
                                    href="/tours"
                                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                                >
                                    Explorar tours
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
