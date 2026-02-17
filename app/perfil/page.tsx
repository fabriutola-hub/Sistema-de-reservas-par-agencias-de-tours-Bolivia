'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, CreditCard, CheckCircle, AlertCircle, XCircle, Loader2, ChevronRight, Info, FileText, Phone, DollarSign } from 'lucide-react'
import { getProfile, getMyReservations, updateProfile, Profile, UserReservation } from '@/lib/actions/profile'
import Link from 'next/link'

export default function PerfilPage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [upcoming, setUpcoming] = useState<UserReservation[]>([])
    const [past, setPast] = useState<UserReservation[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        nombre_completo: '',
        telefono: '',
        ci: ''
    })

    // Modal state
    const [selectedReservation, setSelectedReservation] = useState<UserReservation | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        const [profileResult, reservationsResult] = await Promise.all([
            getProfile(),
            getMyReservations()
        ])

        if (profileResult.data) {
            setProfile(profileResult.data)
            setFormData({
                nombre_completo: profileResult.data.nombre_completo || '',
                telefono: profileResult.data.telefono || '',
                ci: profileResult.data.ci || ''
            })
        }

        setUpcoming(reservationsResult.upcoming)
        setPast(reservationsResult.past)
        setLoading(false)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const result = await updateProfile(formData)

        if (result.success) {
            await loadData()
            setEditMode(false)
        }

        setSaving(false)
    }

    const openReservationDetails = (reservation: UserReservation) => {
        setSelectedReservation(reservation)
        setIsModalOpen(true)
    }

    const closeReservationDetails = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedReservation(null), 300) // Clear after animation
    }

    const getStatusBadge = (estado: string, size: 'sm' | 'md' = 'sm') => {
        const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <AlertCircle className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} /> },
            confirmada: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} /> },
            pagada: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CreditCard className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} /> },
            completada: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <CheckCircle className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} /> },
            cancelada: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} /> }
        }

        const style = styles[estado] || styles.pendiente
        const labels: Record<string, string> = {
            pendiente: 'Pendiente',
            confirmada: 'Confirmada',
            pagada: 'Confirmada (Pagada)',
            completada: 'Completada',
            cancelada: 'Cancelada'
        }

        const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
        const padding = size === 'sm' ? 'px-2.5 py-0.5' : 'px-4 py-1.5'

        return (
            <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full ${textSize} font-medium ${style.bg} ${style.text}`}>
                {style.icon}
                {labels[estado] || estado}
            </span>
        )
    }

    // Status Timeline Component
    const StatusTimeline = ({ currentStatus }: { currentStatus: string }) => {
        const steps = [
            { id: 'pendiente', label: 'Pendiente' },
            { id: 'confirmada', label: 'Confirmada' },
            { id: 'completada', label: 'Completada' }
        ]

        /* 
           Simpler logic: 
           - If status is 'cancelada', show a cancelled state.
           - Otherwise show progress.
           - 'pagada' is treated as a specialized 'confirmada' for the timeline or equal rank.
        */

        if (currentStatus === 'cancelada') {
            return (
                <div className="w-full bg-red-50 p-4 rounded-lg border border-red-100 flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                        <p className="font-semibold text-red-800">Reserva Cancelada</p>
                        <p className="text-sm text-red-600">Esta reserva ha sido cancelada.</p>
                    </div>
                </div>
            )
        }

        // Determine current step index
        // Treat 'pagada' as 'confirmada' level for this simple linear view, or add it. 
        // Let's keep it simple: Pendiente -> Confirmada (or Pagada) -> Completada
        let currentIndex = 0
        if (currentStatus === 'confirmada' || currentStatus === 'pagada') currentIndex = 1
        if (currentStatus === 'completada') currentIndex = 2

        return (
            <div className="relative flex justify-between w-full max-w-sm mx-auto mb-8 mt-4">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-terracotta-500 -translate-y-1/2 -z-10 transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex
                    const isCurrent = index === currentIndex

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                                ? 'bg-terracotta-500 border-terracotta-500 text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                            </div>
                            <span className={`text-xs font-medium ${isCurrent ? 'text-terracotta-600' : isCompleted ? 'text-mountain-800' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }

    // Function specifically for YYYY-MM-DD strings (Tour Date)
    // We want to display exactly the date provided, ignoring timezones
    const formatTourDate = (dateStr: string) => {
        if (!dateStr) return 'Fecha no válida'

        // Parse "YYYY-MM-DD" manually to avoid timezone issues
        // This ensures "2025-02-14" is treated as Feb 14th regardless of where the user is
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day)

        return date.toLocaleDateString('es-BO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    // Standard date formatting for TimeStamps (Booking Date / created_at)
    // This should respect the user's local timezone
    const formatBookingDate = (dateStr: string) => {
        if (!dateStr) return 'Fecha no válida'
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-BO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return 'Por confirmar'
        return timeStr.slice(0, 5)
    }

    const getPaymentMethodLabel = (method: string | null) => {
        const labels: Record<string, string> = {
            yape: 'Yape / QR',
            altoke: 'AlToque / QR',
            efectivo: 'Efectivo',
            otro: 'Otro'
        }
        return method ? (labels[method] || method) : 'No especificado'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-mountain-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Cargando...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 mb-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-mountain-800">Mi Perfil</h1>
                        <p className="text-mountain-500 mt-1">Gestiona tu información personal</p>
                    </div>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="btn btn-secondary"
                        >
                            Editar Perfil
                        </button>
                    )}
                </div>

                {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-mountain-700 mb-1">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                value={formData.nombre_completo}
                                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                                className="w-full px-4 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-mountain-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full px-4 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-mountain-700 mb-1">
                                    CI / Pasaporte
                                </label>
                                <input
                                    type="text"
                                    value={formData.ci}
                                    onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                                    className="w-full px-4 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-mountain-500">Nombre</p>
                            <p className="font-medium text-mountain-800">{profile?.nombre_completo || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-mountain-500">Email</p>
                            <p className="font-medium text-mountain-800">{profile?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-mountain-500">Teléfono</p>
                            <p className="font-medium text-mountain-800">{profile?.telefono || 'No especificado'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reservations Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200">
                <div className="p-6 border-b border-sand-200">
                    <h2 className="text-xl font-bold text-mountain-800">Mis Reservas</h2>
                    <p className="text-mountain-500 mt-1">Historial detallado de tus aventuras</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-sand-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'upcoming'
                                ? 'text-terracotta-600'
                                : 'text-mountain-500 hover:text-mountain-700'
                                }`}
                        >
                            Próximas ({upcoming.length})
                            {activeTab === 'upcoming' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'past'
                                ? 'text-terracotta-600'
                                : 'text-mountain-500 hover:text-mountain-700'
                                }`}
                        >
                            Pasadas ({past.length})
                            {activeTab === 'past' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-500" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Reservation List */}
                <div className="p-6">
                    {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-mountain-300 mx-auto mb-4" />
                            <p className="text-mountain-500">
                                {activeTab === 'upcoming'
                                    ? 'No tienes reservas próximas'
                                    : 'No tienes reservas pasadas'}
                            </p>
                            {activeTab === 'upcoming' && (
                                <Link
                                    href="/tours"
                                    className="inline-block mt-4 btn btn-primary"
                                >
                                    Explorar Tours
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(activeTab === 'upcoming' ? upcoming : past).map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="border border-sand-200 rounded-xl p-5 hover:border-terracotta-200 hover:shadow-md transition-all duration-200 bg-white group"
                                >
                                    <div className="flex flex-col md:flex-row gap-5">
                                        {/* Tour Image */}
                                        {reservation.tour.imagen_url && (
                                            <div className="w-full md:w-48 h-40 md:h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                <img
                                                    src={reservation.tour.imagen_url}
                                                    alt={reservation.tour.nombre}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 left-2">
                                                    {getStatusBadge(reservation.estado)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tour Content */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3 className="text-lg font-bold text-mountain-800 line-clamp-1 group-hover:text-terracotta-600 transition-colors">
                                                        {reservation.tour.nombre}
                                                    </h3>
                                                    <div className="text-right hidden sm:block">
                                                        <span className="block text-xs text-mountain-500">Código</span>
                                                        <span className="font-mono text-sm font-medium text-mountain-700">{reservation.codigo_reserva}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mb-3 text-sm text-mountain-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-terracotta-500" />
                                                        <span className="capitalize"><span className="font-medium">Tour:</span> {formatTourDate(reservation.fecha_tour)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-terracotta-500" />
                                                        <span>{formatTime(reservation.hora_tour)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-terracotta-500" />
                                                        <span>{reservation.num_personas} personas</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:col-span-2">
                                                        <MapPin className="w-4 h-4 text-terracotta-500" />
                                                        <span className="truncate">{reservation.tour.destino || 'Ubicación no disponible'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-terracotta-500" />
                                                        <span>{getPaymentMethodLabel(reservation.metodo_pago)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-sand-100 mt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-mountain-400">Total Pagado</span>
                                                    <span className="text-lg font-bold text-emerald-600">
                                                        Bs. {reservation.precio_total.toFixed(2)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => openReservationDetails(reservation)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-mountain-50 text-mountain-700 rounded-lg text-sm font-medium hover:bg-mountain-100 transition-colors"
                                                >
                                                    Ver Detalles
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reservation Details Modal */}
            {isModalOpen && selectedReservation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-mountain-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeReservationDetails}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-sand-200 p-5 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-xl font-bold text-mountain-900">Detalles de la Reserva</h3>
                                <p className="text-sm text-mountain-500 font-mono mt-0.5">#{selectedReservation.codigo_reserva}</p>
                            </div>
                            <button
                                onClick={closeReservationDetails}
                                className="p-2 hover:bg-sand-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-mountain-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">
                            {/* Status Timeline */}
                            <StatusTimeline currentStatus={selectedReservation.estado} />

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Tour Information */}
                                <div>
                                    <h4 className="text-sm font-bold text-mountain-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-terracotta-500" />
                                        Información del Tour
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={selectedReservation.tour.imagen_url || '/placeholder.jpg'}
                                                    alt={selectedReservation.tour.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-mountain-800">{selectedReservation.tour.nombre}</p>
                                                <p className="text-sm text-mountain-500">{selectedReservation.tour.destino}</p>
                                            </div>
                                        </div>

                                        <div className="bg-sand-50 p-4 rounded-xl space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Fecha del Tour</span>
                                                <span className="font-medium text-mountain-900 capitalize">{formatTourDate(selectedReservation.fecha_tour)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Hora de Salida</span>
                                                <span className="font-medium text-mountain-900">{formatTime(selectedReservation.hora_tour)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Duración</span>
                                                <span className="font-medium text-mountain-900">{selectedReservation.tour.duracion_horas} horas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking details */}
                                <div>
                                    <h4 className="text-sm font-bold text-mountain-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-terracotta-500" />
                                        Detalles de Reserva
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="bg-sand-50 p-4 rounded-xl space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Fecha de Reserva</span>
                                                <span className="font-medium text-mountain-900 capitalize">{formatBookingDate(selectedReservation.created_at)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Personas</span>
                                                <span className="font-medium text-mountain-900">{selectedReservation.num_personas}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-mountain-600">Precio Total</span>
                                                <span className="font-bold text-emerald-600 text-lg">Bs. {selectedReservation.precio_total.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-2 border-t border-sand-200">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-mountain-600">Método de Pago</span>
                                                    <span className="font-medium text-mountain-900">{getPaymentMethodLabel(selectedReservation.metodo_pago)}</span>
                                                </div>
                                                {selectedReservation.comprobante_url && (
                                                    <a
                                                        href={selectedReservation.comprobante_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-terracotta-600 hover:text-terracotta-700 text-xs font-medium underline flex items-center justify-end gap-1 mt-1"
                                                    >
                                                        Ver Comprobante
                                                        <ChevronRight className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {selectedReservation.notas && (
                                            <div className="mt-4">
                                                <span className="text-xs font-bold text-mountain-500 uppercase block mb-2">Notas Adicionales</span>
                                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900">
                                                    {selectedReservation.notas}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-sand-200 p-4 flex justify-between items-center gap-4">
                            <button className="flex items-center gap-2 text-sm text-mountain-500 hover:text-terracotta-600 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span className="hidden sm:inline">Contactar Soporte</span>
                            </button>
                            <button
                                onClick={closeReservationDetails}
                                className="btn btn-primary px-8"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
