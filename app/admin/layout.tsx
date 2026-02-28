'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tours', label: 'Tours', icon: MapPin },
  { href: '/admin/disponibilidad', label: 'Disponibilidad', icon: Calendar },
  { href: '/admin/reservas', label: 'Reservas', icon: FileText },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/recordatorios', label: 'Recordatorios', icon: Bell },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(' ')
}

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || '/admin'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState('Cargando...')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || 'admin')
    })
  }, [])

  const initials = useMemo(() => (userEmail?.[0] || 'A').toUpperCase(), [userEmail])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-gradient-to-bl from-rose-300/20 via-violet-300/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-sky-300/20 via-emerald-300/10 to-transparent blur-3xl" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed z-50 lg:z-30 left-0 top-0 h-full',
          'border-r border-slate-200/70 bg-slate-950 text-white',
          'transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Sidebar administración"
      >
        {/* Brand */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <span className="text-sm font-bold">TR</span>
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white/95">TourReservas</p>
                  <p className="text-xs text-white/55">Admin Panel</p>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={() => setCollapsed((s) => !s)}
                aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 pb-3" aria-label="Navegación admin">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      'h-10 w-10 rounded-2xl flex items-center justify-center border',
                      active ? 'bg-white/10 border-white/15' : 'bg-transparent border-white/10'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.label}</p>
                      <p className={cn('text-xs truncate', active ? 'text-white/60' : 'text-white/40')}>
                        {item.href.replace('/admin', '') || '/'}
                      </p>
                    </div>
                  )}

                  {active && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-rose-400 to-violet-400" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User card */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center font-bold">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-white/90">{userEmail}</p>
                  <p className="text-xs text-white/50">Administrador</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="text-xs font-semibold text-white/65 hover:text-white transition-colors"
                >
                  Ver sitio →
                </Link>

                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white/65 hover:text-rose-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 rounded-xl px-2 py-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={cn('min-h-screen', collapsed ? 'lg:pl-20' : 'lg:pl-72')}>
        {/* Topbar (glass) */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_50px_-38px_rgba(15,23,42,0.45)]">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Administración
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {pathname === '/admin' ? 'Dashboard' : pathname.replace('/admin/', '')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/recordatorios"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                  aria-label="Recordatorios"
                >
                  <Bell className="h-5 w-5 text-slate-700" />
                </Link>

                <Link
                  href="/admin/configuracion"
                  className="hidden sm:inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                >
                  Configuración
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
