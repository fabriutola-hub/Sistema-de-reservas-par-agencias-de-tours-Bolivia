'use client'

import { useState } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'

// Defined in migration: array of objects
export interface ItineraryDay {
    dia: number
    titulo: string
    descripcion: string
}

interface ItineraryBuilderProps {
    itinerary: ItineraryDay[]
    onChange: (itinerary: ItineraryDay[]) => void
}

export default function ItineraryBuilder({ itinerary = [], onChange }: ItineraryBuilderProps) {

    const addDay = () => {
        const nextDay = itinerary.length + 1
        const newDay: ItineraryDay = {
            dia: nextDay,
            titulo: '',
            descripcion: ''
        }
        onChange([...itinerary, newDay])
    }

    const removeDay = (index: number) => {
        const newItinerary = itinerary.filter((_, i) => i !== index)
        // Re-index days to keep them sequential
        const reindexed = newItinerary.map((item, i) => ({
            ...item,
            dia: i + 1
        }))
        onChange(reindexed)
    }

    const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
        const newItinerary = [...itinerary]
        newItinerary[index] = {
            ...newItinerary[index],
            [field]: value
        }
        onChange(newItinerary)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group">
                        <div className="flex-shrink-0 flex flex-col items-center pt-2 text-gray-400">
                            <GripVertical className="h-5 w-5" />
                            <span className="text-xs font-bold mt-2 text-gray-500 w-6 h-6 flex items-center justify-center bg-white rounded-full border border-gray-200">
                                {item.dia}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Título del día (ej. Llegada y Traslado)"
                                    value={item.titulo}
                                    onChange={(e) => updateDay(index, 'titulo', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm font-medium"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Descripción detallada de las actividades..."
                                    value={item.descripcion}
                                    onChange={(e) => updateDay(index, 'descripcion', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm text-gray-600"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeDay(index)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded h-fit transition-colors"
                            title="Eliminar día"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ))}

                {itinerary.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                        <p className="text-sm">Aún no has agregado días al itinerario</p>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={addDay}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium"
            >
                <Plus className="h-5 w-5" />
                Agregar Día {itinerary.length + 1}
            </button>

            <input type="hidden" name="itinerario" value={JSON.stringify(itinerary)} />
        </div>
    )
}
