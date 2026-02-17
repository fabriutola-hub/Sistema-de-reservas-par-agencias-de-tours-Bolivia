'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RecuperarPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.')
            }
        } catch {
            setError('Ocurrió un error inesperado al intentar enviar el correo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg
                                className="w-7 h-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">
                            TourReservas
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-mountain-800 text-center mb-2">
                        Recuperar Contraseña
                    </h1>
                    <p className="text-mountain-500 text-center mb-4">
                        Ingresa tu correo para recibir instrucciones
                    </p>
                    <div className="text-xs text-mountain-400 text-center mb-6 bg-sand-50 p-2 rounded-lg">
                        La nueva contraseña debe tener: mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                    </div>

                    {!message ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-mountain-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar Instrucciones'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {message}
                            </div>
                            <p className="text-sm text-mountain-600">
                                Revisa tu bandeja de entrada (y spam).
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-terracotta-500 hover:text-terracotta-600 font-medium text-sm">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
