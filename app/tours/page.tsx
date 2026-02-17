'use client'

import { useEffect, useMemo, useRef, useState, Suspense, useId } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, ChevronDown, X, Sparkles } from 'lucide-react'
import TourGrid from '@/components/tours/TourGrid'
import { useTours } from '@/lib/hooks/useTours'

function ToursContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const { tours, loading } = useTours()

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  // Desktop collapsible (opcional)
  const [isSidebarOpenMobileInline, setIsSidebarOpenMobileInline] = useState(false)

  // 2025: bottom sheet modal filters on mobile
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const sheetId = useId()
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  const filteredTours = useMemo(() => {
    const result = tours
      .filter((tour) => {
        const nombre = (tour.nombre?.toLowerCase() || '')
        const destino = (tour.destino?.toLowerCase() || '')
        const q = searchTerm.toLowerCase()

        const matchesSearch = nombre.includes(q) || destino.includes(q)
        const price = tour.precio_por_persona || 0
        const duration = tour.duracion_horas || 0

        const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
        const matchesDuration =
          selectedDuration === 'all' ||
          (selectedDuration === 'short' && duration <= 5) ||
          (selectedDuration === 'medium' && duration > 5 && duration <= 24) ||
          (selectedDuration === 'long' && duration > 24)

        return matchesSearch && matchesPrice && matchesDuration
      })
      .sort((a, b) => {
        const ap = a.precio_por_persona || 0
        const bp = b.precio_por_persona || 0
        const ad = a.duracion_horas || 0
        const bd = b.duracion_horas || 0

        if (sortBy === 'price_asc') return ap - bp
        if (sortBy === 'price_desc') return bp - ap
        if (sortBy === 'duration_asc') return ad - bd
        if (sortBy === 'duration_desc') return bd - ad
        return 0
      })

    return result
  }, [tours, searchTerm, priceRange, selectedDuration, sortBy])

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    priceRange[1] < 5000 ||
    selectedDuration !== 'all' ||
    sortBy !== 'featured'

  const clearAll = () => {
    setSearchTerm('')
    setPriceRange([0, 5000])
    setSelectedDuration('all')
    setSortBy('featured')
  }

  // Bottom sheet a11y: lock scroll, focus management, ESC, focus trap (simple)
  useEffect(() => {
    if (!isSheetOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const root = sheetRef.current
    const focusables = () =>
      root
        ? Array.from(
            root.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
            )
          )
        : []

    // focus first
    const list = focusables()
    list[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSheetOpen(false)

      if (e.key === 'Tab') {
        const f = focusables()
        if (f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isSheetOpen])

  // return focus to opener
  useEffect(() => {
    if (isSheetOpen) return
    openerRef.current?.focus()
  }, [isSheetOpen])

  function FiltersPanel({ compact }: { compact?: boolean }) {
    return (
      <div className={compact ? 'space-y-5' : 'space-y-6'}>
        {/* Search */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar destino, tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-warm pl-10"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Precio máximo:{' '}
            <span className="text-primary font-bold">Bs {priceRange[1]}</span>
          </label>

          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            aria-label="Precio máximo"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Bs 0</span>
            <span>Bs 5000</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Duración</label>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="input-warm"
          >
            <option value="all">Todas</option>
            <option value="short">Cortas (&lt; 5 horas)</option>
            <option value="medium">Mediana (5–24 horas)</option>
            <option value="long">Larga (&gt; 24 horas)</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-warm"
          >
            <option value="featured">Destacados</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="duration_asc">Duración: Corta a Larga</option>
            <option value="duration_desc">Duración: Larga a Corta</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header editorial + bento */}
      <div className="relative overflow-hidden bg-gradient-to-b from-muted to-background pt-10 pb-12">
        <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-bl from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-gradient-to-tr from-secondary/15 via-transparent to-transparent blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <div className="section-divider mb-6"></div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Nuestros Tours
              </h1>

              <p className="mt-3 text-muted-foreground text-lg max-w-xl">
                Encuentra la experiencia perfecta para explorar Bolivia, con filtros rápidos y resultados claros.
              </p>

              {/* Search hero */}
              <div className="mt-7 max-w-xl">
                <label className="sr-only" htmlFor="tour-search">
                  Buscar tours
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="tour-search"
                    type="text"
                    placeholder="Buscar: Uyuni, Titicaca, Amazonía..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-white/70 backdrop-blur-md pl-12 pr-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-white/60 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
                    Curado
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Rutas con logística clara y recomendaciones locales.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-foreground p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Resultados
                </p>
                <p className="mt-2 font-serif text-3xl text-white leading-none">
                  {loading ? '—' : filteredTours.length}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {loading ? 'Cargando tours…' : `de ${tours.length} disponibles`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile actions row */}
          <div className="md:hidden flex gap-3">
            <button
              ref={openerRef}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/70 backdrop-blur-md border border-border rounded-2xl text-sm font-semibold text-foreground shadow-sm"
              onClick={() => setIsSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isSheetOpen}
              aria-controls={sheetId}
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filtros
            </button>

            <button
              className="px-4 py-3 bg-white/70 backdrop-blur-md border border-border rounded-2xl text-sm font-semibold text-foreground shadow-sm"
              onClick={() => setIsSidebarOpenMobileInline((s) => !s)}
            >
              <span className="inline-flex items-center gap-2">
                Más
                <ChevronDown className={`h-4 w-4 transition-transform ${isSidebarOpenMobileInline ? 'rotate-180' : ''}`} />
              </span>
            </button>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="md:sticky md:top-28 space-y-4">
              <div className="rounded-3xl border border-border bg-white/70 backdrop-blur-md p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-xl font-bold">Filtros</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <FiltersPanel />
                </div>
              </div>
            </div>
          </aside>

          {/* Right content */}
          <div className="flex-1">
            {/* Sticky toolbar (chips + sort) */}
            <div className="sticky top-24 z-10 mb-6 rounded-3xl border border-border bg-white/70 backdrop-blur-md p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {loading ? 'Cargando…' : `${filteredTours.length} tours`}
                  </span>

                  {searchTerm.trim() && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Buscar: {searchTerm}
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}

                  {priceRange[1] < 5000 && (
                    <button
                      onClick={() => setPriceRange([0, 5000])}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Hasta Bs {priceRange[1]}
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}

                  {selectedDuration !== 'all' && (
                    <button
                      onClick={() => setSelectedDuration('all')}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Duración: {selectedDuration}
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground hidden sm:block">
                    Orden:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 rounded-2xl border border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                    <option value="duration_asc">Duración: Corta a Larga</option>
                    <option value="duration_desc">Duración: Larga a Corta</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Optional inline filters (mobile “Más”) */}
            {isSidebarOpenMobileInline && (
              <div className="md:hidden mb-6 rounded-3xl border border-border bg-white/70 backdrop-blur-md p-6 shadow-sm">
                <FiltersPanel compact />
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[420px] rounded-3xl border border-border bg-muted/60 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <TourGrid tours={filteredTours} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet filters (mobile) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Cerrar filtros"
            onClick={() => setIsSheetOpen(false)}
          />

          <div
            id={sheetId}
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-background shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
          >
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-2xl font-bold">Filtros</p>
                  <p className="text-sm text-muted-foreground">
                    Ajusta y vuelve a la lista sin perder contexto.
                  </p>
                </div>

                <button
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-muted hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setIsSheetOpen(false)}
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-white/60 backdrop-blur-md p-5">
                <FiltersPanel compact />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={clearAll}
                  className="h-11 rounded-2xl border border-border bg-background text-sm font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="h-11 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ToursPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Cargando...
        </div>
      }
    >
      <ToursContent />
    </Suspense>
  )
}
