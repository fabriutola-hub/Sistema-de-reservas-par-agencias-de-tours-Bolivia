'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">
                            TourReservas
                        </span>
                    </Link>
                </div>

                {/* Error Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-mountain-800 mb-2">
                            Enlace Inválido o Expirado
                        </h1>
                        <p className="text-mountain-500">
                            El enlace de recuperación de contraseña ha expirado o ya fue utilizado.
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-6">
                        <p className="font-medium mb-1">¿Qué puedo hacer?</p>
                        <ul className="list-disc list-inside text-amber-700 space-y-1">
                            <li>Los enlaces expiran después de 1 hora</li>
                            <li>Cada enlace solo puede usarse una vez</li>
                            <li>Solicita un nuevo enlace abajo</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/recuperar-password"
                            className="w-full btn btn-primary py-3 text-lg block text-center"
                        >
                            Solicitar Nuevo Enlace
                        </Link>
                        <Link
                            href="/login"
                            className="w-full btn btn-secondary py-3 text-lg block text-center"
                        >
                            Volver al Inicio de Sesión
                        </Link>
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
