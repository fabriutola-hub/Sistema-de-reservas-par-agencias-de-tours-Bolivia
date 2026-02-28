
'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { CheckCircle, Upload, AlertTriangle, Smartphone, Clock, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTourPublic } from '@/lib/actions/booking'

const TIMEOUT_MINUTES = 10

function CountdownTimer({ createdAt, onExpired }: { createdAt: string; onExpired: () => void }) {
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const created = new Date(createdAt).getTime()
        const deadline = created + TIMEOUT_MINUTES * 60 * 1000
        return Math.max(0, Math.floor((deadline - Date.now()) / 1000))
    })

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpired()
            return
        }
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1
                if (next <= 0) {
                    clearInterval(interval)
                    onExpired()
                    return 0
                }
                return next
            })
        }, 1000)
        return () => clearInterval(interval)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const isUrgent = timeLeft < 180 // < 3 minutes
    const isExpired = timeLeft <= 0

    if (isExpired) return null

    return (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${isUrgent
                ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
                Tiempo para subir comprobante: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    )
}

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [reservation, setReservation] = useState<any>(null)
    const [tour, setTour] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [expired, setExpired] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleExpired = useCallback(() => {
        setExpired(true)
    }, [])

    useEffect(() => {
        async function fetchReservation() {
            const supabase = createClient()

            // Cleanup expired reservations before fetching
            await supabase.rpc('cleanup_expired_reservations')

            // Use RPC to bypass RLS for anonymous users (securely)
            const { data, error } = await supabase
                .rpc('get_reservation_public', { p_reserva_id: id })

            if (error) {
                console.error('Error fetching reservation:', error)
                setError('No se pudo cargar la reserva.')
            } else if (data) {
                setReservation(data)

                // Check if already canceled
                if (data.estado === 'cancelada') {
                    setExpired(true)
                }

                // Check if comprobante already uploaded
                if (data.comprobante_url) {
                    setUploadSuccess(true)
                }

                // Check if time has already expired
                const created = new Date(data.created_at).getTime()
                const deadline = created + TIMEOUT_MINUTES * 60 * 1000
                if (Date.now() > deadline && !data.comprobante_url) {
                    setExpired(true)
                }

                // Try to get tour ID from various possible locations in the response
                const tourId = data.tour_id || data.tours?.id || (typeof data.tours === 'object' && data.tours.id)

                if (tourId) {
                    const tourData = await getTourPublic(tourId)
                    setTour(tourData)
                } else {
                    console.warn('Could not find tour ID in reservation data:', data)
                }
            } else {
                setError('Reserva no encontrada.')
            }
            setLoading(false)
        }
        fetchReservation()
    }, [id])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        if (expired) {
            setError('El tiempo para subir el comprobante ha expirado. Tu reserva fue cancelada.')
            return
        }

        setUploading(true)
        setError(null)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${id}-${Math.random()}.${fileExt}`
        const filePath = `comprobantes/${fileName}`

        try {
            const supabase = createClient()

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('comprobantes')
                .upload(filePath, file)

            if (uploadError) throw new Error('Error al subir el archivo: ' + uploadError.message)

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('comprobantes')
                .getPublicUrl(filePath)

            // Update reservation with URL using Secure RPC
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('subir_comprobante', {
                    p_reserva_id: id,
                    p_url: publicUrl
                })

            if (rpcError) throw new Error(rpcError.message)
            if (rpcData && !rpcData.success) throw new Error(rpcData.message || 'Error al actualizar reserva')

            setUploadSuccess(true)

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Error al subir el comprobante.')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div></div>
    }

    if (!reservation) {
        return <div className="min-h-screen flex items-center justify-center">Reserva no encontrada.</div>
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className={`${expired && !uploadSuccess ? 'bg-red-600' : 'bg-green-600'} p-8 text-center text-white`}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            {expired && !uploadSuccess ? (
                                <XCircle className="h-10 w-10 text-red-600" />
                            ) : (
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            )}
                        </motion.div>
                        <h1 className="text-3xl font-bold mb-2">
                            {expired && !uploadSuccess ? '¡Reserva Expirada!' : '¡Solicitud Recibida!'}
                        </h1>
                        <p className={expired && !uploadSuccess ? 'text-red-100' : 'text-green-100'}>
                            {expired && !uploadSuccess
                                ? 'Tu reserva fue cancelada por no subir el comprobante a tiempo.'
                                : `Tu reserva #${id.slice(0, 8)} ha sido registrada.`
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Details Section */}
                        <div className="p-8 border-r border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de la Reserva</h2>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <span className="text-sm text-gray-500 block">Tour</span>
                                    <span className="font-semibold text-gray-900">{reservation.tours.nombre}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 block">Fecha</span>
                                        <span className="font-semibold text-gray-900">
                                            {format(new Date(reservation.fecha_tour), "d MMM, yyyy", { locale: es })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Personas</span>
                                        <span className="font-semibold text-gray-900">{reservation.num_personas}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Cliente</span>
                                    <span className="font-semibold text-gray-900">{reservation.clientes.nombre_completo}</span>
                                    <span className="text-sm text-gray-500 block">{reservation.clientes.email}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-700">Total a Pagar</span>
                                    <span className="text-2xl font-bold text-rose-600">Bs {reservation.precio_total}</span>
                                </div>
                            </div>

                            {expired && !uploadSuccess ? (
                                <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 text-sm text-red-700">
                                    <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Tu reserva fue <strong>cancelada automáticamente</strong> porque no se subió el comprobante de pago en los 10 minutos permitidos. Puedes realizar una nueva reserva.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-700">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Tu reserva está en estado <strong>Pendiente</strong>. Para confirmarla, por favor realiza el pago escaneando el QR y sube el comprobante.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="p-8 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Instrucciones de Pago</h2>

                            {expired && !uploadSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center text-center h-full justify-center"
                                >
                                    <XCircle className="h-12 w-12 text-red-600 mb-4" />
                                    <h3 className="text-lg font-bold text-red-800 mb-2">Tiempo Expirado</h3>
                                    <p className="text-sm text-red-600">
                                        El plazo de 10 minutos para subir el comprobante de pago ha finalizado. Tu reserva fue cancelada automáticamente y los cupos fueron liberados.
                                    </p>
                                    <button onClick={() => router.push('/tours')} className="mt-6 px-6 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-colors">
                                        Hacer nueva reserva
                                    </button>
                                </motion.div>
                            ) : !uploadSuccess ? (
                                <>
                                    {/* Countdown timer */}
                                    {reservation.created_at && (
                                        <div className="mb-4">
                                            <CountdownTimer
                                                createdAt={reservation.created_at}
                                                onExpired={handleExpired}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {/* QR Payment Method */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Smartphone className="h-5 w-5 text-gray-700" />
                                                <h3 className="font-bold text-gray-800">Pago QR</h3>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                {tour?.qr_pago_url ? (
                                                    <div className="relative w-48 h-48 bg-white p-2 rounded-lg border border-gray-100 mb-3">
                                                        <Image
                                                            src={tour.qr_pago_url}
                                                            alt="QR de Pago"
                                                            fill
                                                            className="object-contain rounded"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg mb-3">
                                                        <span className="text-gray-400 text-sm">QR no disponible</span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-center text-gray-500">
                                                    Escanea este código para realizar el pago por Bs {reservation.precio_total}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-bold text-gray-800 text-sm">Validar Pago</h3>
                                            <p className="text-xs text-gray-500">Sube una captura de tu transferencia o pago QR.</p>

                                            <label className="block w-full cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading || expired}
                                                    className="hidden"
                                                />
                                                <div className={`
                                        border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-white transition-colors
                                        ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-rose-400'}
                                        ${expired ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}>
                                                    {uploading ? (
                                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                                            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                                                            Subiendo...
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                                            <Upload className="h-6 w-6" />
                                                            <span className="text-sm">Clic para subir comprobante</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center text-center h-full justify-center"
                                >
                                    <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                                    <h3 className="text-lg font-bold text-green-800 mb-2">Comprobante Enviado</h3>
                                    <p className="text-sm text-green-600">
                                        Hemos recibido tu comprobante. Procesaremos tu confirmación en breve y te notificaremos al email registrado.
                                    </p>
                                    <button onClick={() => router.push('/')} className="mt-6 text-green-700 font-medium hover:underline">
                                        Volver al inicio
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
