'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegistroPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombre_completo: '',
        telefono: '',
        ci: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            // Register with Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nombre_completo: formData.nombre_completo,
                        telefono: formData.telefono,
                        ci: formData.ci
                    }
                }
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Este correo ya está registrado. Intenta iniciar sesión.')
                } else {
                    setError(signUpError.message)
                }
                return
            }

            if (data.user) {
                // Upsert profile with additional info
                // This handles cases where the trigger might have failed silently
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: formData.email,
                        nombre_completo: formData.nombre_completo,
                        telefono: formData.telefono,
                        ci: formData.ci,
                        updated_at: new Date().toISOString()
                    })

                if (profileError) {
                    console.error('Profile upsert error:', profileError)
                    // Continue anyway, user is registered
                }

                // Redirect to profile
                router.push('/perfil')
                router.refresh()
            }
        } catch {
            setError('Ocurrió un error inesperado')
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

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-mountain-800 text-center mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-mountain-500 text-center mb-6">
                        Regístrate para gestionar tus reservas
                    </p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="nombre_completo" className="block text-sm font-medium text-mountain-700 mb-1">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                id="nombre_completo"
                                name="nombre_completo"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-mountain-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-mountain-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                    placeholder="+591 70000000"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="ci" className="block text-sm font-medium text-mountain-700 mb-1">
                                    CI / Pasaporte
                                </label>
                                <input
                                    type="text"
                                    id="ci"
                                    name="ci"
                                    value={formData.ci}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                    placeholder="12345678"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-mountain-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-mountain-700 mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
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
                                    Registrando...
                                </span>
                            ) : (
                                'Crear Cuenta'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-mountain-500">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="text-terracotta-500 hover:text-terracotta-600 font-medium">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-white/80 hover:text-white text-sm transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
