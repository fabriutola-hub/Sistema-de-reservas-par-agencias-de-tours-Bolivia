'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, AlertCircle, ChevronLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import DatePicker from '@/components/booking/DatePicker'
import ReservationForm from '@/components/booking/ReservationForm'
import { useAvailability } from '@/lib/hooks/useAvailability'
import { Tour } from '@/components/tours/TourCard'
import Link from 'next/link'
import { createBookingTransaction, BookingResult } from '@/lib/actions/booking'
import ReviewList from '@/components/reviews/ReviewList'
import ReviewForm from '@/components/reviews/ReviewForm'
import { getReviews, Review, getUserReview } from '@/lib/actions/reviews'

// Helper to map error codes to user-friendly messages
function getBookingErrorMessage(result: BookingResult): string {
    if (result.success) return ''

    switch (result.errorCode) {
        case 'NO_AVAILABILITY':
            return 'Esta fecha ya no tiene disponibilidad. Por favor, seleccione otra fecha.'

        case 'OVERBOOKING':
            if (result.cuposDisponibles !== undefined) {
                return `Solo quedan ${result.cuposDisponibles} cupo${result.cuposDisponibles === 1 ? '' : 's'} disponible${result.cuposDisponibles === 1 ? '' : 's'} para esta fecha.`
            }
            return 'No hay suficientes cupos disponibles para esta fecha.'

        case 'TOUR_NOT_FOUND':
            return 'El tour seleccionado no está disponible actualmente.'

        case 'VALIDATION_ERROR':
            return result.error || 'Por favor, revise los datos del formulario.'

        case 'TRANSACTION_FAILED':
        default:
            return 'Ocurrió un error al procesar la reserva. Por favor, intente nuevamente.'
    }
}

interface TourDetailClientProps {
    id: string
    initialTour: Tour | null
}

// Fallback constant outside to avoid recreation
const FALLBACK_IMAGE = "/Imagen/about-adventure.png"

export default function TourDetailClient({ id, initialTour }: TourDetailClientProps) {
    const router = useRouter()
    const [tour, setTour] = useState<Tour | null>(initialTour)
    const [loading, setLoading] = useState(!initialTour)
    // Initialize image source state with tour data or fallback
    const [imgSrc, setImgSrc] = useState(initialTour?.imagen_url || FALLBACK_IMAGE)
    const { availability } = useAvailability(id)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [reviews, setReviews] = useState<Review[]>([])
    const [userReview, setUserReview] = useState<any>(null)
    const [reviewsLoading, setReviewsLoading] = useState(true)

    useEffect(() => {
        if (tour) {
            // Update image source if tour data changes (e.g. from props or initial load)
            setImgSrc(tour.imagen_url || FALLBACK_IMAGE)
            return
        }

        async function fetchTour() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('tours')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setTour(data)
                setImgSrc(data.imagen_url || FALLBACK_IMAGE)
            }
            setLoading(false)
        }
        fetchTour()
    }, [id, tour])

    // Fetch reviews
    useEffect(() => {
        async function fetchReviewsData() {
            try {
                const [reviewsData, userReviewData] = await Promise.all([
                    getReviews(id),
                    getUserReview(id)
                ])
                setReviews(reviewsData)
                setUserReview(userReviewData)
            } catch (error) {
                console.error('Error loading reviews:', error)
            } finally {
                setReviewsLoading(false)
            }
        }
        fetchReviewsData()
    }, [id])

    const handleReviewSubmitted = async () => {
        const [reviewsData, userReviewData] = await Promise.all([
            getReviews(id),
            getUserReview(id)
        ])
        setReviews(reviewsData)
        setUserReview(userReviewData)
    }

    // Get available spots for selected date
    const getSpots = (date: Date) => {
        if (!date) return 0
        const dateStr = format(date, 'yyyy-MM-dd')
        const avail = availability.find(a => a.fecha === dateStr)
        return avail ? avail.cupos_disponibles : 0
    }

    const handleReservation = async (formData: any) => {
        if (!selectedDate || !tour) return
        setIsBooking(true)
        setError(null)

        try {
            // Call secure server action for atomic booking
            const result = await createBookingTransaction({
                tourId: tour.id,
                fecha: format(selectedDate, 'yyyy-MM-dd'),
                cliente: {
                    nombre_completo: formData.nombre_completo,
                    email: formData.email,
                    telefono: formData.telefono,
                    ci: formData.ci,
                },
                num_personas: parseInt(formData.num_personas),
                notas: formData.notas || undefined,
            })

            if (result.success && result.reservaId) {
                // Redirect to confirmation page
                router.push(`/reserva/confirmacion/${result.reservaId}`)
            } else {
                // Show user-friendly error message
                setError(getBookingErrorMessage(result))
            }
        } catch (err: any) {
            console.error('[TourDetail] Booking error:', err)
            setError('Ocurrió un error inesperado. Por favor, intente nuevamente.')
        } finally {
            setIsBooking(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div></div>
    }

    if (!tour) {
        return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Tour no encontrado</h1>
            <Link href="/tours" className="text-rose-600 hover:underline">Volver al catálogo</Link>
        </div>
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Gallery / Hero */}
            <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
                <Image
                    src={imgSrc}
                    alt={tour.nombre || 'Tour Image'}
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <Link href="/tours" className="inline-flex items-center text-white/90 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm transition-all">
                        <ChevronLeft className="h-5 w-5 mr-1" /> Volver
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-3 mb-4"
                        >
                            <span className="bg-rose-600 px-3 py-1 rounded-full text-sm font-bold">{tour.destino}</span>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {tour.duracion_horas} horas
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-4"
                        >
                            {tour.nombre}
                        </motion.h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Info Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Descripción</h2>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                {tour.descripcion}
                            </p>

                        </div>

                        {/* Itinerary Section */}
                        {tour.itinerario && Array.isArray(tour.itinerario) && tour.itinerario.length > 0 && (
                            <div className="border-t border-gray-100 pt-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <Clock className="h-6 w-6 text-rose-500" />
                                    Itinerario
                                </h2>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {tour.itinerario.map((day: any, i: number) => (
                                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon/Dot */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-rose-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                <span className="text-white font-bold text-xs">{day.dia}</span>
                                            </div>

                                            {/* Content Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <h3 className="font-bold text-gray-900 mb-2">{day.titulo}</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">{day.descripcion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery Section */}
                        {tour.galeria && Array.isArray(tour.galeria) && tour.galeria.length > 0 && (
                            <div className="border-t border-gray-100 pt-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Galería
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {tour.galeria.map((img: string, i: number) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group">
                                            <Image
                                                src={img}
                                                alt={`${tour.nombre} gallery ${i + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tour.incluye && Array.isArray(tour.incluye) && tour.incluye.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Qué incluye</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tour.incluye.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="lg:col-span-2 space-y-12 pt-12 border-t border-gray-100">
                        <div id="reviews">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Opiniones de viajeros</h2>

                            <div className="mb-12">
                                {!reviewsLoading && !userReview && (
                                    <ReviewForm tourId={id} onReviewSubmitted={handleReviewSubmitted} />
                                )}
                                {userReview && (
                                    <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-8 border border-blue-100">
                                        <p className="font-medium">Ya has publicado una reseña para este tour.</p>
                                    </div>
                                )}
                            </div>

                            {reviewsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                </div>
                            ) : (
                                <ReviewList reviews={reviews} />
                            )}
                        </div>
                    </div>

                    {/* Booking Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            {/* Price Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
                                <div className="flex justify-between items-baseline mb-6">
                                    <span className="text-gray-500 font-medium">Precio por persona</span>
                                    <span className="text-3xl font-bold text-rose-600">Bs {tour.precio_por_persona}</span>
                                </div>

                                {/* Date Selection */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-400" /> Selecciona una fecha
                                    </h3>
                                    <DatePicker
                                        selectedDate={selectedDate}
                                        onSelectDate={setSelectedDate}
                                        availability={availability}
                                    />
                                    {selectedDate && (
                                        <div className="p-3 bg-rose-50 rounded-lg text-rose-700 text-sm font-medium text-center">
                                            Seleccionado: {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                                        </div>
                                    )}
                                </div>

                                {/* Reservation Form */}
                                <AnimatePresence>
                                    {selectedDate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            {error && (
                                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    {error}
                                                </div>
                                            )}

                                            <ReservationForm
                                                onSubmit={handleReservation}
                                                isSubmitting={isBooking}
                                                maxGuests={Math.min(10, getSpots(selectedDate))}
                                                pricePerPerson={tour.precio_por_persona || 0}
                                                qrCodeUrl={tour.qr_pago_url}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!selectedDate && (
                                    <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                        Por favor selecciona una fecha disponible arriba para continuar.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
