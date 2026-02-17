'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getReservas, getTours, updateReservaEstado, updateReservaNotas, sendReservaNotification, createManualReserva } from '@/lib/actions/admin'
import { Search, Filter, X, Eye, Check, XCircle, Edit, Mail, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { es } from 'date-fns/locale'

interface Reserva {
    id: string
    cliente_id: string
    tour_id: string
    fecha_tour: string
    hora_tour?: string
    num_personas: number
    precio_total: number
    estado: string
    notas: string | null
    metodo_pago: string | null
    canal_reserva?: string
    comprobante_url: string | null
    created_at: string
    tours: { nombre: string; destino: string }
    clientes: { nombre_completo: string; email: string; telefono: string; ci: string }
}

interface Tour {
    id: string
    nombre: string
    precio_por_persona?: number
}

const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    pagada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    completada: 'bg-gray-100 text-gray-800'
}

const estadoLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
    completada: 'Completada'
}

export default function ReservasPage() {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [tours, setTours] = useState<Tour[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
    const [filterEstado, setFilterEstado] = useState('')
    const [filterTour, setFilterTour] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [editingNotas, setEditingNotas] = useState(false)
    const [notasValue, setNotasValue] = useState('')
    const [sendingNotification, setSendingNotification] = useState(false)

    // Manual Reservation State
    const [showManualModal, setShowManualModal] = useState(false)
    const [manualForm, setManualForm] = useState({
        tour_id: '',
        fecha: '',
        nombre_completo: '',
        email: '',
        telefono: '',
        ci: '',
        num_personas: 1,
        notas: '',
        canal_reserva: 'whatsapp'
    })
    const [creatingManual, setCreatingManual] = useState(false)
    const [availableDates, setAvailableDates] = useState<Array<{ fecha: string; cupos_disponibles: number; hora_salida: string }>>([])
    const [loadingAvailability, setLoadingAvailability] = useState(false)

    useEffect(() => {
        loadData()
    }, [filterEstado, filterTour])

    useEffect(() => {
        if (manualForm.tour_id) {
            loadAvailability(manualForm.tour_id)
        } else {
            setAvailableDates([])
            setManualForm(prev => ({ ...prev, fecha: '' }))
        }
    }, [manualForm.tour_id])

    async function loadData() {
        setLoading(true)
        try {
            const [reservasData, toursData] = await Promise.all([
                getReservas({ estado: filterEstado || undefined, tourId: filterTour || undefined }),
                getTours()
            ])
            setReservas(reservasData as Reserva[])
            setTours(toursData as Tour[])
        } catch (err) {
            console.error('Error loading reservas:', err)
        } finally {
            setLoading(false)
        }
    }

    async function loadAvailability(tourId: string) {
        setLoadingAvailability(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('disponibilidad')
                .select('fecha, cupos_disponibles, hora_salida')
                .eq('tour_id', tourId)
                .gt('cupos_disponibles', 0)
                .gte('fecha', new Date().toISOString().split('T')[0])
                .order('fecha', { ascending: true })

            if (error) throw error
            setAvailableDates(data || [])
        } catch (err) {
            console.error('Error loading availability:', err)
            setAvailableDates([])
        } finally {
            setLoadingAvailability(false)
        }
    }

    function openDetail(reserva: Reserva) {
        setSelectedReserva(reserva)
        setNotasValue(reserva.notas || '')
        setEditingNotas(false)
    }

    async function handleEstadoChange(id: string, estado: string) {
        try {
            await updateReservaEstado(id, estado)
            loadData()
            if (selectedReserva?.id === id) {
                setSelectedReserva({ ...selectedReserva, estado })
            }
        } catch (err) {
            console.error('Error updating estado:', err)
            alert('Error al actualizar estado')
        }
    }

    async function handleSaveNotas() {
        if (!selectedReserva) return
        try {
            await updateReservaNotas(selectedReserva.id, notasValue)
            setEditingNotas(false)
            setSelectedReserva({ ...selectedReserva, notas: notasValue })
        } catch (err) {
            console.error('Error saving notas:', err)
            alert('Error al guardar notas')
        }
    }

    async function handleSendNotification() {
        if (!selectedReserva) return

        const type = 'reminder_24h'
        const confirmMsg = `¿Deseas enviar el RECORDATORIO DE 24H a ${selectedReserva.clientes?.nombre_completo}?`

        if (!confirm(confirmMsg)) return

        setSendingNotification(true)
        try {
            await sendReservaNotification(selectedReserva.id, type)
            alert('Notificación enviada con éxito')
            loadData()
            // Update local state if needed
            // For reminder, we don't change reservation status
        } catch (err) {
            console.error('Error sending notification:', err)
            alert('Error al enviar notificación')
        } finally {
            setSendingNotification(false)
        }
    }

    async function handleCreateManual(e: React.FormEvent) {
        e.preventDefault()
        setCreatingManual(true)

        const formData = new FormData()
        Object.entries(manualForm).forEach(([key, value]) => {
            formData.append(key, value.toString())
        })

        try {
            await createManualReserva(formData)
            alert('Reserva manual creada con éxito')
            setShowManualModal(false)
            setManualForm({
                tour_id: '',
                fecha: '',
                nombre_completo: '',
                email: '',
                telefono: '',
                ci: '',
                num_personas: 1,
                notas: '',
                canal_reserva: 'whatsapp'
            })
            loadData()
        } catch (err: any) {
            console.error('Error creating manual reservation:', err)
            alert(err.message || 'Error al crear reserva')
        } finally {
            setCreatingManual(false)
        }
    }

    const filteredReservas = reservas.filter(r => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            r.clientes?.nombre_completo?.toLowerCase().includes(search) ||
            r.clientes?.email?.toLowerCase().includes(search) ||
            r.tours?.nombre?.toLowerCase().includes(search) ||
            r.id.toLowerCase().includes(search)
        )
    })

    if (loading && reservas.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>
                    <p className="text-gray-500">Gestiona todas las reservas</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Reserva
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        >
                            <option value="">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="pagada">Pagada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                        <select
                            value={filterTour}
                            onChange={(e) => setFilterTour(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        >
                            <option value="">Todos</option>
                            {tours.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => { setFilterEstado(''); setFilterTour(''); }}
                        className="self-end px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Limpiar
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Canal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReservas.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-mono text-gray-600">{r.id.slice(0, 8)}</div>
                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                            {r.canal_reserva || 'web'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{r.clientes?.nombre_completo}</p>
                                            <p className="text-xs text-gray-500">{r.clientes?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.tours?.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.fecha_tour}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.num_personas}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">Bs {r.precio_total?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${estadoColors[r.estado]}`}>
                                            {estadoLabels[r.estado] || r.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => openDetail(r)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReservas.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron reservas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Reservation Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">Nueva Reserva Manual</h2>
                            <button onClick={() => setShowManualModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateManual} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                                    <select
                                        required
                                        value={manualForm.tour_id}
                                        onChange={(e) => setManualForm({ ...manualForm, tour_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="">Selecciona un tour</option>
                                        {tours.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha disponible
                                    </label>
                                    {!manualForm.tour_id ? (
                                        <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                                            Primero selecciona un tour
                                        </div>
                                    ) : loadingAvailability ? (
                                        <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                                            Cargando fechas disponibles...
                                        </div>
                                    ) : availableDates.length === 0 ? (
                                        <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                                            No hay fechas con disponibilidad para este tour
                                        </div>
                                    ) : (
                                        <select
                                            required
                                            value={manualForm.fecha}
                                            onChange={(e) => setManualForm({ ...manualForm, fecha: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="">Selecciona una fecha</option>
                                            {availableDates.map((avail) => (
                                                <option key={avail.fecha} value={avail.fecha}>
                                                    {format(new Date(avail.fecha + 'T00:00:00'), "d 'de' MMMM, yyyy", { locale: es })} - {avail.hora_salida} ({avail.cupos_disponibles} cupos)
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Canal de Reserva</label>
                                    <select
                                        value={manualForm.canal_reserva}
                                        onChange={(e) => setManualForm({ ...manualForm, canal_reserva: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-gray-50"
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="telefono">Teléfono</option>
                                        <option value="presencial">Presencial</option>
                                        <option value="facebook">Facebook / Instagram</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualForm.nombre_completo}
                                        onChange={(e) => setManualForm({ ...manualForm, nombre_completo: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CI / Documento</label>
                                    <input
                                        type="text"
                                        value={manualForm.ci}
                                        onChange={(e) => setManualForm({ ...manualForm, ci: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={manualForm.telefono}
                                        onChange={(e) => setManualForm({ ...manualForm, telefono: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={manualForm.email}
                                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Personas</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="50"
                                        value={manualForm.num_personas}
                                        onChange={(e) => setManualForm({ ...manualForm, num_personas: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
                                    <textarea
                                        rows={3}
                                        value={manualForm.notas}
                                        onChange={(e) => setManualForm({ ...manualForm, notas: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        placeholder="Detalles adicionales..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowManualModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingManual}
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creatingManual ? 'Creando...' : 'Crear Reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Detail Modal */}
            {selectedReserva && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Detalle de Reserva</h2>
                            <button onClick={() => setSelectedReserva(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${estadoColors[selectedReserva.estado]}`}>
                                    {estadoLabels[selectedReserva.estado]}
                                </span>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 block">
                                        Creada: {format(new Date(selectedReserva.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                                    </span>
                                    {selectedReserva.canal_reserva && (
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                            Vía: {selectedReserva.canal_reserva.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Datos del Cliente</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Nombre:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.clientes?.nombre_completo}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">CI:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.clientes?.ci || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.clientes?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Teléfono:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.clientes?.telefono || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tour Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Detalles del Tour</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Tour:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.tours?.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Fecha:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.fecha_tour}</p>
                                        <p className="text-xs text-gray-500">{selectedReserva.hora_tour}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Personas:</span>
                                        <p className="font-medium text-gray-800">{selectedReserva.num_personas}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Total:</span>
                                        <p className="font-medium text-rose-600 text-lg">Bs {selectedReserva.precio_total?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {selectedReserva.comprobante_url && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Comprobante de Pago</h3>
                                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                        <Image
                                            src={selectedReserva.comprobante_url}
                                            alt="Comprobante"
                                            fill
                                            className="object-contain bg-white"
                                        />
                                    </div>
                                    <a
                                        href={selectedReserva.comprobante_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Eye className="h-4 w-4" /> Ver imagen completa
                                    </a>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Notas</h3>
                                    {!editingNotas && (
                                        <button
                                            onClick={() => setEditingNotas(true)}
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <Edit className="h-4 w-4" /> Editar
                                        </button>
                                    )}
                                </div>
                                {editingNotas ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={notasValue}
                                            onChange={(e) => setNotasValue(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingNotas(false)} className="px-3 py-1 text-gray-600">Cancelar</button>
                                            <button onClick={handleSaveNotas} className="px-4 py-1 bg-rose-600 text-white rounded-lg">Guardar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">{selectedReserva.notas || 'Sin notas'}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                {selectedReserva.estado === 'pendiente' && (
                                    <>
                                        <button
                                            onClick={() => handleEstadoChange(selectedReserva.id, 'confirmada')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Check className="h-4 w-4" /> Confirmar Reserva
                                        </button>
                                    </>
                                )}
                                {(selectedReserva.estado === 'pendiente' || selectedReserva.estado === 'confirmada' || selectedReserva.estado === 'cancelada') && (
                                    <button
                                        onClick={() => handleEstadoChange(selectedReserva.id, 'pagada')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4" /> {selectedReserva.estado === 'cancelada' ? 'Reactivar / Confirmar Pago' : 'Confirmar Pago'}
                                    </button>
                                )}
                                {selectedReserva.estado !== 'cancelada' && selectedReserva.estado !== 'completada' && (
                                    <button
                                        onClick={() => handleEstadoChange(selectedReserva.id, 'cancelada')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    >
                                        <XCircle className="h-4 w-4" /> Cancelar
                                    </button>
                                )}
                                <button
                                    onClick={handleSendNotification}
                                    disabled={sendingNotification}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Mail className="h-4 w-4" /> {sendingNotification ? 'Enviando...' : 'Enviar Recordatorio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
