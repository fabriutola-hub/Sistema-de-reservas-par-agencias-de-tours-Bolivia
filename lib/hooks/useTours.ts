
import { useState, useEffect } from 'react'
import { createClient } from '../supabase/client'
import { Tour } from '@/components/tours/TourCard'

export function useTours(featured = false) {
    const [tours, setTours] = useState<Tour[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTours() {
            try {
                const supabase = createClient()
                let query = supabase
                    .from('tours')
                    .select('*')
                    .eq('activo', true)

                if (featured) {
                    // Just an example limit for featured
                    query = query.limit(3)
                }

                const { data, error } = await query

                if (error) {
                    throw error
                }

                setTours(data || [])
            } catch (err: any) {
                console.error('Error fetching tours:', err)
                console.error('Error details:', JSON.stringify(err, null, 2))
                console.error('Error message:', err.message)
                console.error('Error hint:', err.hint)
                console.error('Error code:', err.code)
                setError(err.message || 'An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchTours()
    }, [featured])

    return { tours, loading, error }
}
