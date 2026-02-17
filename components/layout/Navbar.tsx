'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Menu, X, User, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type NavItem = { name: string; path: string }

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const menuId = 'navbar-menu'
  const overlayRef = useRef<HTMLDivElement | null>(null)

  const items: NavItem[] = useMemo(
    () => [
      { name: 'Inicio', path: '/' },
      { name: 'Catálogo', path: '/tours' },
      { name: 'Galería', path: '/galeria' },
      { name: 'Nosotros', path: '/nosotros' },
    ],
    []
  )

  // Hide Navbar on admin pages check moved to bottom to prevent hook error

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Auth (initial + subscription)
  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const run = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(data.user ?? null)

        if (data.user) {
          const { data: adminStatus } = await supabase.rpc('is_admin', { check_user_id: data.user.id })
          if (!mounted) return
          setIsAdmin(!!adminStatus)
        } else {
          setIsAdmin(false)
        }
      } catch (e) {
        console.error('Auth check failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // When user changes, refresh admin status
  useEffect(() => {
    const supabase = createClient()
    const run = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data: adminStatus } = await supabase.rpc('is_admin', { check_user_id: user.id })
      setIsAdmin(!!adminStatus)
    }
    run()
  }, [user])

  // Scroll effect (rAF throttle)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (!isMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMenuOpen])

  // ESC + simple focus trap
  useEffect(() => {
    if (!isMenuOpen) return

    const root = overlayRef.current
    const focusables = () =>
      root
        ? Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
          )
        )
        : []

    const firstFocus = () => {
      const list = focusables()
      list[0]?.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)

      if (e.key === 'Tab') {
        const list = focusables()
        if (list.length === 0) return

        const first = list[0]
        const last = list[list.length - 1]
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

    firstFocus()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const navShell = [
    'fixed z-50 left-1/2 -translate-x-1/2',
    'w-[min(1120px,calc(100%-1.5rem))] md:w-[min(1200px,calc(100%-3rem))]',
    'transition-all duration-500 ease-out',
    scrolled ? 'top-4' : 'top-5 md:top-7',
  ].join(' ')

  const navSurface = [
    'relative overflow-hidden rounded-2xl md:rounded-full',
    'border border-navy-900/10',
    'shadow-[0_14px_50px_-30px_rgba(15,23,42,0.45)]',
    scrolled
      ? 'bg-white/70 backdrop-blur-xl'
      : 'bg-white/35 backdrop-blur-lg',
  ].join(' ')

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname?.startsWith(path))

  // Hide Navbar on Admin pages
  if (pathname?.startsWith('/admin')) return null

  return (
    <nav className={navShell} aria-label="Navegación principal">
      <div className={navSurface}>
        {/* ambient highlight */}
        <div className="pointer-events-none absolute -top-16 right-10 h-32 w-32 rounded-full bg-gradient-to-tr from-violet/20 via-coral/15 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-mint/20 via-lavender/15 to-transparent blur-2xl" />

        <div className="relative flex items-center justify-between px-5 py-4 md:px-6 md:py-3">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-navy-900 group-hover:text-violet transition-colors duration-300">
              <path d="M4 16C4 16 8 8 16 8C24 8 28 16 28 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 22C4 22 10 16 16 16C22 16 28 22 28 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 12C12 12 14 10 16 10C18 10 20 12 20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
            </svg>
            <span className="font-serif text-xl tracking-tight font-medium text-navy-900 group-hover:text-violet transition-colors duration-300">
              TourReservas
            </span>
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-navy-900/10 bg-white/35 backdrop-blur-md px-2 py-1">
            {items.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'relative rounded-full px-4 py-2',
                    'font-technical text-[11px] uppercase tracking-widest',
                    'transition-colors duration-300',
                    active ? 'text-navy-900' : 'text-navy-900/70 hover:text-violet',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40',
                  ].join(' ')}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet/15 via-coral/10 to-violet/15 ring-1 ring-violet/20" />
                  )}
                  {item.name}
                </Link>
              )
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 font-technical text-[11px] uppercase tracking-widest text-coral hover:text-magenta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* CTA */}
            <Link
              href="/tours"
              className="hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-technical text-[10px] uppercase tracking-widest text-white-lavender
                         bg-navy-900 hover:bg-violet transition-colors shadow-lg shadow-navy-900/10
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
            >
              Reservar
              <ArrowRight size={14} className="opacity-90" />
            </Link>

            {/* Auth */}
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-navy-900/10 animate-pulse" aria-label="Cargando" />
            ) : user ? (
              <Link
                href="/perfil"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-900/10 bg-white/35 backdrop-blur-md
                           text-navy-900 hover:text-violet transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
                aria-label="Ir a perfil"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center rounded-full border border-navy-900/12 bg-white/25 px-5 py-2.5 backdrop-blur-md
                           font-technical text-[10px] uppercase tracking-widest text-navy-900/80 hover:text-violet hover:border-violet/30 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
              >
                Ingresar
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/10 bg-white/35 backdrop-blur-md
                         text-navy-900 hover:text-violet transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
            >
              <span className="sr-only">{isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
              {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay (dialog) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={overlayRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-navy-900/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: reduceMotion ? 0 : 18, opacity: 0, scale: reduceMotion ? 1 : 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: reduceMotion ? 0 : 10, opacity: 0, scale: reduceMotion ? 1 : 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-3 top-3 rounded-3xl border border-white/10 bg-navy-900 text-white-lavender shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="font-technical text-[10px] uppercase tracking-widest text-white/70">
                    Navegación
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5
                               hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <span className="sr-only">Cerrar</span>
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6 grid gap-2">
                  {items.map((item) => {
                    const active = isActive(item.path)
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'group rounded-2xl px-5 py-4',
                          'border border-white/10 bg-white/5 hover:bg-white/10 transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-3xl tracking-tight text-white/90 group-hover:text-white">
                            {item.name}
                          </span>
                          <ArrowRight className="opacity-70 group-hover:opacity-100 transition-opacity" size={18} />
                        </div>
                        {active && (
                          <div className="mt-2 h-px w-full bg-gradient-to-r from-violet/70 via-coral/60 to-transparent" />
                        )}
                      </Link>
                    )
                  })}

                  {user && (
                    <Link
                      href="/perfil"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-2xl px-5 py-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      <span className="font-serif text-3xl tracking-tight text-white/90">Mi perfil</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-2xl px-5 py-4 border border-coral/30 bg-coral/10 hover:bg-coral/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                    >
                      <span className="font-serif text-3xl tracking-tight text-coral">Admin Panel</span>
                    </Link>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    href="/tours"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl bg-white text-navy-900 px-4 py-3 font-technical text-[10px] uppercase tracking-widest
                               hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Reservar
                  </Link>
                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-technical text-[10px] uppercase tracking-widest
                                 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      Ingresar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-technical text-[10px] uppercase tracking-widest
                                 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      Cerrar menú
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
