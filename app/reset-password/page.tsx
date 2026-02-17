import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">TourReservas</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-mountain-800 text-center mb-2">
                        Nueva Contraseña
                    </h1>
                    <p className="text-mountain-500 text-center mb-6">
                        Crea una contraseña segura para tu cuenta
                    </p>

                    {user ? (
                        <ResetPasswordForm />
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                No hay una sesión activa. Solicita un nuevo enlace de recuperación.
                            </div>
                            <Link
                                href="/recuperar-password"
                                className="inline-block btn btn-primary py-2 px-6"
                            >
                                Solicitar Nuevo Enlace
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
