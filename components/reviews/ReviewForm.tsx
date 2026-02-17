'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { createReview } from '@/lib/actions/reviews'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
    tourId: string
    onReviewSubmitted?: () => void
}

export default function ReviewForm({ tourId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Por favor selecciona una calificación')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createReview({
                tour_id: tourId,
                rating,
                comentario: comment
            })

            if (result.success) {
                setSuccess(true)
                setComment('')
                setRating(0)
                if (onReviewSubmitted) onReviewSubmitted()
                router.refresh()
            } else {
                setError(result.error || 'Error al enviar la reseña')
            }
        } catch (err) {
            console.error(err)
            setError('Ocurrió un error inesperado')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100">
                <h3 className="text-green-800 font-bold mb-2">¡Gracias por tu opinión!</h3>
                <p className="text-green-600 text-sm">Tu reseña ha sido publicada exitosamente.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-green-700 text-sm hover:underline"
                >
                    Escribir otra reseña
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Escribe una reseña</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Calificación</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Comentario</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comparte tu experiencia..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm resize-none"
                        required
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            Publicar Reseña <Send className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
