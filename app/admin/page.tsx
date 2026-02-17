'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { getDashboardMetrics, getReservasPorDia, getReservas } from '@/lib/actions/admin'
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  RefreshCcw,
  Sparkles,
  BadgeCheck,
} from 'lucide-react'

interface Metrics {
  totalReservas: number
  ingresosMes: number
  pendientes: number
  toursPopulares: { nombre: string; count: number }[]
}

interface ChartData {
  fecha: string
  reservas: number
  ingresos: number
}

interface Reserva {
  id: string
  fecha_tour: string
  num_personas: number
  precio_total: number
  estado: string
  tours: { nombre: string; destino: string }
  clientes: { nombre_completo: string; email: string }
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ')
}

function formatCurrencyBOB(value: number) {
  try {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)
  } catch {
    return `Bs ${Number(value || 0).toLocaleString()}`
  }
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: '2-digit' })
}

function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_50px_-38px_rgba(15,23,42,0.45)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {subtitle}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {right}
    </div>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    confirmada: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    pagada: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    cancelada: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    completada: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        map[estado] ?? 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
      )}
    >
      {estado}
    </span>
  )
}

function KpiCard({
  title,
  value,
  hint,
  icon,
  accent,
}: {
  title: string
  value: string
  hint?: string
  icon: React.ReactNode
  accent: 'sky' | 'emerald' | 'amber' | 'violet'
}) {
  const accentMap = {
    sky: 'from-sky-500/15 via-transparent to-transparent',
    emerald: 'from-emerald-500/15 via-transparent to-transparent',
    amber: 'from-amber-500/15 via-transparent to-transparent',
    violet: 'from-violet-500/15 via-transparent to-transparent',
  }[accent]

  const iconMap = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  }[accent]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl p-6">
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', accentMap)} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
        </div>
        <div className={cn('h-11 w-11 rounded-2xl ring-1 flex items-center justify-center', iconMap)}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [recentReservations, setRecentReservations] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const tourPopular = metrics?.toursPopulares?.[0]?.nombre || 'N/A'

  const kpis = useMemo(() => {
    return [
      {
        title: 'Reservas del mes',
        value: String(metrics?.totalReservas || 0),
        hint: 'Actividad del periodo',
        icon: <Calendar className="h-5 w-5" />,
        accent: 'sky' as const,
      },
      {
        title: 'Ingresos del mes',
        value: formatCurrencyBOB(metrics?.ingresosMes || 0),
        hint: 'Total facturado',
        icon: <DollarSign className="h-5 w-5" />,
        accent: 'emerald' as const,
      },
      {
        title: 'Pendientes',
        value: String(metrics?.pendientes || 0),
        hint: 'Requieren atención',
        icon: <Clock className="h-5 w-5" />,
        accent: 'amber' as const,
      },
      {
        title: 'Tour popular',
        value: tourPopular,
        hint: 'Top del mes',
        icon: <TrendingUp className="h-5 w-5" />,
        accent: 'violet' as const,
      },
    ]
  }, [metrics, tourPopular])

  async function loadData({ soft = false } = {}) {
    if (!soft) setLoading(true)
    setRefreshing(true)
    try {
      const [metricsData, chartDataRes, reservasData] = await Promise.all([
        getDashboardMetrics(),
        getReservasPorDia(30),
        getReservas(),
      ])
      setMetrics(metricsData)
      setChartData(chartDataRes)
      setRecentReservations((reservasData as Reserva[]).slice(0, 5))
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="relative">
        <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="mt-6 h-96 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* Subtle background */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-bl from-rose-300/25 via-violet-300/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-gradient-to-tr from-sky-300/20 via-emerald-300/10 to-transparent blur-3xl" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Panel administrativo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-500">Resumen del mes actual y actividad reciente.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData({ soft: true })}
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl px-4 py-2.5 text-sm font-semibold text-slate-800',
              'hover:bg-white transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50'
            )}
          >
            <RefreshCcw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Actualizar
          </button>

          <Link
            href="/admin/reportes"
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white',
              'hover:opacity-95 transition-opacity',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40'
            )}
          >
            Ver reportes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPIs (bento row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={k.value}
            hint={k.hint}
            icon={k.icon}
            accent={k.accent}
          />
        ))}
      </div>

      {/* Bento area: chart + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-8">
          <CardHeader
            title="Reservas (últimos 30 días)"
            subtitle="Analítica"
            right={
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-semibold text-slate-600">
                  Tip: picos = campañas / feriados
                </span>
              </div>
            }
          />

          <div className="px-6 pb-6">
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap={10}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#eaeef5" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(v) => String(v).slice(5)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                      contentStyle={{
                        borderRadius: '14px',
                        border: '1px solid rgba(148,163,184,0.35)',
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(10px)',
                      }}
                      formatter={(value: any, name: any, props: any) => {
                        if (name === 'reservas') return [value, 'Reservas']
                        return [value, name]
                      }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Bar
                      dataKey="reservas"
                      fill="#fb7185"
                      radius={[10, 10, 10, 10]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No hay datos para mostrar
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Reservas por día
              </span>
              <span>Incluye datos de los últimos 30 días.</span>
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <div className="lg:col-span-4 grid gap-6">
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Acciones rápidas
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Gestiona más rápido</h3>
            <p className="mt-2 text-sm text-slate-500">
              Atajos para tareas frecuentes del día a día.
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href="/admin/tours"
                className={cn(
                  'group rounded-2xl border border-slate-200 bg-white/60 p-4 hover:bg-white transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Gestionar tours</p>
                    <p className="mt-1 text-xs text-slate-500">Crear, editar y administrar</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-rose-50 ring-1 ring-rose-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/reservas"
                className={cn(
                  'group rounded-2xl border border-slate-200 bg-white/60 p-4 hover:bg-white transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ver reservas</p>
                    <p className="mt-1 text-xs text-slate-500">Pagos y estados</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-sky-50 ring-1 ring-sky-200 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-sky-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/reportes"
                className={cn(
                  'group rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white hover:opacity-95 transition-opacity',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Reportes</p>
                    <p className="mt-1 text-xs text-white/70">Ventas y performance</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* Popular tour mini-card */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Insight
                </p>
                <p className="mt-2 text-sm text-slate-500">Tour más popular</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {tourPopular}
                </p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-violet-50 ring-1 ring-violet-200 flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent reservations table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Operación
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Reservas recientes</h2>
          </div>

          <Link
            href="/admin/reservas"
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800',
              'hover:bg-white transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50'
            )}
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70">
              {recentReservations.map((r, idx) => (
                <tr key={r.id} className={cn('hover:bg-slate-50/70', idx % 2 === 1 && 'bg-white/30')}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="min-w-[220px]">
                      <p className="text-sm font-semibold text-slate-900">
                        {r.clientes?.nombre_completo || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">{r.clientes?.email || ''}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-900">{r.tours?.nombre || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{r.tours?.destino || ''}</p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(r.fecha_tour)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {formatCurrencyBOB(r.precio_total || 0)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge estado={r.estado} />
                  </td>
                </tr>
              ))}

              {recentReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                    No hay reservas recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
