'use client'

import { Star, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Review {
    id: string
    tour_id: string
    user_id: string
    rating: number
    comentario: string
    created_at: string
    profiles?: {
        nombre_completo: string
        avatar_url?: string
    }
}

interface ReviewListProps {
    reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Este tour aún no tiene reseñas. ¡Sé el primero en opinar!</p>
            </div>
        )
    }

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

    return (
        <div className="space-y-8">
            {/* Summary */}
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl">
                <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                <div className="flex flex-col">
                    <div className="flex text-yellow-500 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">{reviews.length} opiniones</span>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {reviews.map((review, i) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    {review.profiles?.avatar_url ? (
                                        <img src={review.profiles.avatar_url} alt={review.profiles.nombre_completo} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{review.profiles?.nombre_completo || 'Usuario'}</h4>
                                    <span className="text-xs text-gray-400 block">
                                        {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comentario}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
