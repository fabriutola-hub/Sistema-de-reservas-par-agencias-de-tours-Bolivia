
import { useState, useEffect } from 'react'
import { createClient } from '../supabase/client'
import { format } from 'date-fns'

interface Availability {
    fecha: string
    cupos_disponibles: number
}

export function useAvailability(tourId: string) {
    const [availability, setAvailability] = useState<Availability[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAvailability() {
            if (!tourId) return

            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('disponibilidad')
                    .select('fecha, cupos_disponibles')
                    .eq('tour_id', tourId)
                    .gt('cupos_disponibles', 0)
                    .gte('fecha', format(new Date(), 'yyyy-MM-dd'))

                if (error) throw error

                setAvailability(data || [])
            } catch (err) {
                console.error('Error fetching availability:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAvailability()
    }, [tourId])

    return { availability, loading }
}
