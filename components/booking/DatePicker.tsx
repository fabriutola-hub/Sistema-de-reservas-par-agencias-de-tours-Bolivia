
'use client'

import { useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isBefore,
    startOfDay,
    getDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface Availability {
    fecha: string
    cupos_disponibles: number
}

interface DatePickerProps {
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
    availability: Availability[]
}

export default function DatePicker({ selectedDate, onSelectDate, availability }: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    // Add padding days for the start of the month
    const startDay = getDay(startOfMonth(currentMonth))
    const paddingDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null)

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const isDateAvailable = (date: Date) => {
        const today = startOfDay(new Date())
        if (isBefore(date, today)) return false

        // Check if there are spots specifically listed for this date
        // Note: If no record exists for a date, we assume it's NOT available (or check logic)
        // For this implementation, let's assume availability array contains ALL available dates.
        const dateStr = format(date, 'yyyy-MM-dd')
        const avail = availability.find(a => a.fecha === dateStr)
        return avail && avail.cupos_disponibles > 0
    }

    const getSpots = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const avail = availability.find(a => a.fecha === dateStr)
        return avail ? avail.cupos_disponibles : 0
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} />
                ))}

                {daysInMonth.map((date) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, new Date())
                    const available = isDateAvailable(date)
                    const spots = getSpots(date)

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => available && onSelectDate(date)}
                            disabled={!available}
                            className={twMerge(
                                clsx(
                                    "h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm transition-all border",
                                    !available && "text-gray-300 cursor-not-allowed bg-gray-50 border-transparent",
                                    available && !isSelected && "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-gray-100 bg-white text-gray-700",
                                    isSelected && "bg-rose-600 text-white border-rose-600 shadow-md transform scale-105",
                                    isToday && !isSelected && "text-rose-600 font-bold border-rose-100"
                                )
                            )}
                        >
                            <span className="leading-none">{format(date, 'd')}</span>
                            {available && (
                                <span className={clsx(
                                    "text-[9px] mt-0.5",
                                    isSelected ? "text-rose-100" : "text-green-600 font-medium"
                                )}>
                                    {spots} cupos
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                    <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-100"></div>
                    <span>No disponible</span>
                </div>
            </div>
        </div>
    )
}
