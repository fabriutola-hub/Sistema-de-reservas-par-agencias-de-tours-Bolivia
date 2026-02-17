
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { CheckCircle, Upload, AlertTriangle, Smartphone } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTourPublic } from '@/lib/actions/booking'

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [reservation, setReservation] = useState<any>(null)
    const [tour, setTour] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchReservation() {
            const supabase = createClient()

            // Use RPC to bypass RLS for anonymous users (securely)
            const { data, error } = await supabase
                .rpc('get_reservation_public', { p_reserva_id: id })

            if (error) {
                console.error('Error fetching reservation:', error)
                setError('No se pudo cargar la reserva.')
            } else if (data) {
                setReservation(data)

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
                    <div className="bg-green-600 p-8 text-center text-white">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </motion.div>
                        <h1 className="text-3xl font-bold mb-2">¡Solicitud Recibida!</h1>
                        <p className="text-green-100">Tu reserva #{id.slice(0, 8)} ha sido registrada.</p>
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

                            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-700">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>
                                    Tu reserva está en estado <strong>Pendiente</strong>. Para confirmarla, por favor realiza el pago escaneando el QR y sube el comprobante.
                                </p>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="p-8 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Instrucciones de Pago</h2>

                            {!uploadSuccess ? (
                                <>
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
                                                    disabled={uploading}
                                                    className="hidden"
                                                />
                                                <div className={`
                                        border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-white transition-colors
                                        ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-rose-400'}
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
