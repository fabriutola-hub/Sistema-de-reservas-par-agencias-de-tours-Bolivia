
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Mail, Phone, User, CreditCard } from 'lucide-react'

interface ReservationFormProps {
    onSubmit: (data: any) => void
    isSubmitting: boolean
    maxGuests: number
    pricePerPerson: number
    qrCodeUrl?: string | null
}

export default function ReservationForm({
    onSubmit,
    isSubmitting,
    maxGuests,
    pricePerPerson,
    qrCodeUrl
}: ReservationFormProps) {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        ci: '',
        email: '',
        telefono: '',
        num_personas: 1,
        notas: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-rose-500" />
                Detalles de la Reserva
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="nombre_completo"
                            required
                            value={formData.nombre_completo}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">CI / Pasaporte</label>
                        <input
                            type="text"
                            name="ci"
                            required
                            value={formData.ci}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
                            placeholder="Ej: 1234567 LP"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Personas</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select
                                name="num_personas"
                                value={formData.num_personas}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 appearance-none bg-white"
                            >
                                {[...Array(maxGuests)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} {i === 0 ? 'Persona' : 'Personas'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="tel"
                            name="telefono"
                            required
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
                            placeholder="+591 70000000"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notas Adicionales</label>
                    <textarea
                        name="notas"
                        value={formData.notas}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                        placeholder="Dietas especiales, requerimientos, etc."
                    />
                </div>

                {qrCodeUrl && (
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Información de Pago</h4>
                        <p className="text-sm text-gray-600">
                            Escanea el código QR para realizar el pago correspondiente.
                        </p>
                        <div className="flex justify-center bg-white p-2 rounded-lg border border-gray-100">
                            {/* Using standard img tag for simplicity within form context or Next.js Image if preferred */}
                            <img src={qrCodeUrl} alt="Código QR de Pago" className="w-48 h-48 object-contain" />
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total a Pagar</span>
                    <span className="text-2xl font-bold text-rose-600">
                        Bs {(pricePerPerson * Number(formData.num_personas)).toLocaleString()}
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Confirmar Reserva'
                    )}
                </button>
            </form>
        </div>
    )
}

