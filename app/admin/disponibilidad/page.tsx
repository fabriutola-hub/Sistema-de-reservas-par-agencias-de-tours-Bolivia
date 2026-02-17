'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getDisponibilidad,
  getTours,
  createDisponibilidad,
  createBulkDisponibilidad,
  deleteDisponibilidad,
} from '@/lib/actions/admin'
import { Plus, Trash2, X, Calendar as CalendarIcon, Clock, Users, Sparkles, Wand2 } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

interface Tour {
  id: string
  nombre: string
  activo?: boolean
}

interface Disponibilidad {
  id: string
  tour_id: string
  fecha: string
  hora_salida: string
  cupos_disponibles: number
  tours: { nombre: string }
}

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(' ')
}

function dayKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export default function DisponibilidadPage() {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [submitting, setSubmitting] = useState(false)

  const createDialogRef = useRef<HTMLDialogElement | null>(null)
  const bulkDialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [dispData, toursData] = await Promise.all([getDisponibilidad(), getTours()])
      setDisponibilidades(dispData as Disponibilidad[])
      setTours((toursData as Tour[]).filter((t: any) => t.activo))
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const dispoByDate = useMemo(() => {
    const map = new Map<string, Disponibilidad[]>()
    for (const d of disponibilidades) {
      const arr = map.get(d.fecha) ?? []
      arr.push(d)
      map.set(d.fecha, arr)
    }
    // ordena por hora (UX)
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.hora_salida || '').localeCompare(b.hora_salida || ''))
      map.set(k, arr)
    }
    return map
  }, [disponibilidades])

  const selectedKey = useMemo(() => dayKey(selectedDate), [selectedDate])
  const selectedDispos = dispoByDate.get(selectedKey) ?? []

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = monthStart.getDay()

  const upcoming = useMemo(() => {
    const now = new Date()
    return [...disponibilidades]
      .filter((d) => new Date(d.fecha) >= new Date(format(now, 'yyyy-MM-dd')))
      .sort((a, b) => (a.fecha + a.hora_salida).localeCompare(b.fecha + b.hora_salida))
      .slice(0, 10)
  }, [disponibilidades])

  function openCreateDialog(date: Date) {
    setSelectedDate(date)
    createDialogRef.current?.showModal()
  }

  function openBulkDialog() {
    bulkDialogRef.current?.showModal()
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createDisponibilidad(formData)
      createDialogRef.current?.close()
      await loadData()
    } catch (err) {
      console.error('Error creating disponibilidad:', err)
      alert('Error al crear disponibilidad')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const tourId = formData.get('tour_id') as string
      const startDate = formData.get('start_date') as string
      const endDate = formData.get('end_date') as string
      const hora = formData.get('hora_salida') as string
      const cupos = parseInt(formData.get('cupos_disponibles') as string)
      const daysOfWeek = formData.getAll('days') as string[]

      const start = new Date(startDate)
      const end = new Date(endDate)

      const allDates = eachDayOfInterval({ start, end })
      const filteredDates = allDates.filter((d) => daysOfWeek.includes(d.getDay().toString()))
      const fechas = filteredDates.map((d) => format(d, 'yyyy-MM-dd'))

      if (fechas.length === 0) {
        alert('No hay fechas que coincidan con los días seleccionados')
        return
      }

      await createBulkDisponibilidad(tourId, fechas, hora, cupos)
      bulkDialogRef.current?.close()
      await loadData()
    } catch (err) {
      console.error('Error creating bulk disponibilidad:', err)
      alert('Error al crear disponibilidad masiva')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta disponibilidad?')) return
    try {
      await deleteDisponibilidad(id)
      await loadData()
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Operación</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Disponibilidad</h1>
          <p className="mt-2 text-slate-500">Gestiona fechas, horarios y cupos por tour.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={openBulkDialog}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:opacity-95 transition-opacity
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
          >
            <Wand2 className="h-4 w-4" />
            Generar masivo
          </button>

          <button
            onClick={() => openCreateDialog(new Date())}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-slate-900
                       hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
          >
            <Plus className="h-4 w-4 text-rose-600" />
            Agregar hoy
          </button>
        </div>
      </div>

      {/* Bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar card */}
        <section className="lg:col-span-8 rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_50px_-38px_rgba(15,23,42,0.45)] overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-rose-50 ring-1 ring-rose-200 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Calendario</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-11 w-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                aria-label="Mes anterior"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-11 w-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-[11px] font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`empty-${i}`} className="h-[104px]" />
              ))}

              {daysInMonth.map((date) => {
                const key = dayKey(date)
                const dayDispos = dispoByDate.get(key) ?? []
                const count = dayDispos.length

                const active = isSameDay(date, selectedDate)
                const today = isToday(date)
                const has = count > 0

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    onDoubleClick={() => openCreateDialog(date)}
                    className={cn(
                      'h-[104px] text-left rounded-2xl border p-3 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50',
                      active
                        ? 'border-rose-200 bg-rose-50/60'
                        : 'border-slate-200/70 bg-white hover:bg-slate-50/70'
                    )}
                    aria-label={`Día ${format(date, 'd MMMM', { locale: es })}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn('text-sm font-semibold', today ? 'text-rose-600' : 'text-slate-900')}>
                        {format(date, 'd')}
                      </div>

                      {has && (
                        <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-semibold">
                          {count}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 overflow-hidden">
                      {dayDispos.slice(0, 2).map((d) => (
                        <div
                          key={d.id}
                          className="rounded-lg bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-2 py-1 text-[11px] font-semibold truncate"
                          title={d.tours?.nombre}
                        >
                          {d.tours?.nombre}
                        </div>
                      ))}
                      {count > 2 && (
                        <div className="text-[11px] text-slate-500">+{count - 2} más</div>
                      )}
                      {!has && (
                        <div className="text-[11px] text-slate-400">—</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Hoy
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Días con disponibilidad
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5">
                Tip: doble click en un día para agregar rápido.
              </span>
            </div>
          </div>
        </section>

        {/* Right column: Day details + Upcoming */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Day detail */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_50px_-38px_rgba(15,23,42,0.45)] overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Detalle del día</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedDispos.length === 0 ? 'Sin salidas programadas.' : `${selectedDispos.length} salida(s) programada(s).`}
                </p>
              </div>

              <button
                onClick={() => openCreateDialog(selectedDate)}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-rose-700 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            <div className="px-6 pb-6">
              {selectedDispos.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 text-sm text-slate-500">
                  Puedes crear disponibilidad para este día o generar masivo para un rango.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDispos.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-slate-200 bg-white/60 p-4 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{d.tours?.nombre}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {d.hora_salida}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {d.cupos_disponibles} cupos
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(d.id)}
                        className="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 transition-colors
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                        aria-label="Eliminar disponibilidad"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Upcoming */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_50px_-38px_rgba(15,23,42,0.45)] overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-violet-50 ring-1 ring-violet-200 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Próximas</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Disponibilidades</h2>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {upcoming.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 text-sm text-slate-500">
                  No hay disponibilidades futuras.
                </div>
              ) : (
                upcoming.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDate(new Date(d.fecha))}
                    className="w-full text-left rounded-2xl border border-slate-200 bg-white/60 p-4 hover:bg-white transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{d.tours?.nombre}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {format(new Date(d.fecha), "d MMM yyyy", { locale: es })}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {d.hora_salida}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {d.cupos_disponibles}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-1 text-[10px] font-semibold">
                        {format(new Date(d.fecha), 'EEE', { locale: es })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Create dialog */}
      <dialog
        ref={createDialogRef}
        className="backdrop:bg-black/50 rounded-3xl p-0 w-[min(520px,calc(100%-1.5rem))] border border-slate-200"
      >
        <div className="bg-white">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Agregar disponibilidad</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
              </h2>
            </div>
            <button
              onClick={() => createDialogRef.current?.close()}
              className="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <input type="hidden" name="fecha" value={format(selectedDate, 'yyyy-MM-dd')} />

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Tour</label>
              <select
                name="tour_id"
                required
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              >
                <option value="">Seleccionar tour</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Hora de salida</label>
                <input
                  name="hora_salida"
                  type="time"
                  required
                  defaultValue="08:00"
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Cupos</label>
                <input
                  name="cupos_disponibles"
                  type="number"
                  required
                  min={1}
                  defaultValue={10}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => createDialogRef.current?.close()}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-2xl bg-rose-600 px-6 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Guardando…' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Bulk dialog */}
      <dialog
        ref={bulkDialogRef}
        className="backdrop:bg-black/50 rounded-3xl p-0 w-[min(600px,calc(100%-1.5rem))] border border-slate-200"
      >
        <div className="bg-white">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Automatización</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Generar disponibilidad masiva</h2>
              <p className="mt-2 text-sm text-slate-500">
                Define rango, días, hora y cupos.
              </p>
            </div>
            <button
              onClick={() => bulkDialogRef.current?.close()}
              className="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleBulkCreate} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Tour</label>
              <select
                name="tour_id"
                required
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              >
                <option value="">Seleccionar tour</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Desde</label>
                <input
                  name="start_date"
                  type="date"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Hasta</label>
                <input
                  name="end_date"
                  type="date"
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Días de la semana</label>
              <div className="flex flex-wrap gap-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                  <label
                    key={i}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input type="checkbox" name="days" value={i.toString()} defaultChecked className="accent-rose-600" />
                    <span className="text-sm font-semibold text-slate-800">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Hora</label>
                <input
                  name="hora_salida"
                  type="time"
                  required
                  defaultValue="08:00"
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Cupos</label>
                <input
                  name="cupos_disponibles"
                  type="number"
                  required
                  min={1}
                  defaultValue={10}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => bulkDialogRef.current?.close()}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 transition-opacity"
              >
                {submitting ? 'Generando…' : 'Generar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}
