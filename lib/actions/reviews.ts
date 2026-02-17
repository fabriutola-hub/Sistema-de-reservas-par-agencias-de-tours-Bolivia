'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Review {
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

export interface CreateReviewData {
    tour_id: string
    rating: number
    comentario: string
}

export async function getReviews(tourId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      profiles:user_id (
        nombre_completo,
        avatar_url
      )
    `)
        .eq('tour_id', tourId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reviews:', error)
        return []
    }

    return data as Review[]
}

export async function getUserReview(tourId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tour_id', tourId)
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error checking user review:', error)
    }

    return data
}

export async function createReview(data: CreateReviewData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Debe iniciar sesión para dejar una reseña' }
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
        return { success: false, error: 'La calificación debe estar entre 1 y 5 estrellas' }
    }

    const { error } = await supabase
        .from('reviews')
        .insert({
            tour_id: data.tour_id,
            user_id: user.id,
            rating: data.rating,
            comentario: data.comentario
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: false, error: 'Ya has publicado una reseña para este tour' }
        }
        console.error('Error creating review:', error)
        return { success: false, error: 'Error al publicar la reseña' }
    }

    revalidatePath(`/tours/${data.tour_id}`)
    return { success: true }
}
