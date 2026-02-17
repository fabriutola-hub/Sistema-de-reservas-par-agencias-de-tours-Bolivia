'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from './actions'

const PASSWORD_RULES = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (password.length < PASSWORD_RULES.minLength) errors.push(`Mínimo ${PASSWORD_RULES.minLength} caracteres`)
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) errors.push('Al menos una mayúscula')
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) errors.push('Al menos una minúscula')
    if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) errors.push('Al menos un número')
    return { valid: errors.length === 0, errors }
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
    if (!password) return { level: 0, label: '', color: 'bg-gray-200' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 2) return { level: 1, label: 'Débil', color: 'bg-red-500' }
    if (score <= 4) return { level: 2, label: 'Media', color: 'bg-yellow-500' }
    return { level: 3, label: 'Fuerte', color: 'bg-green-500' }
}

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const passwordValidation = useMemo(() => validatePassword(password), [password])
    const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

    const handleUpdatePassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        if (!passwordValidation.valid) {
            setError('La contraseña no cumple con los requisitos.')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            setLoading(false)
            return
        }

        try {
            const result = await updatePassword(password)

            if (!result.success) {
                setError(result.error || 'Error desconocido')
                setLoading(false)
                return
            }

            setMessage('¡Contraseña actualizada exitosamente!')
            setTimeout(() => router.push('/login'), 5000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
        } finally {
            setLoading(false)
        }
    }, [password, confirmPassword, passwordValidation, router])

    if (message) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {message}
                </div>
                <p className="text-sm text-mountain-600">Redirigiendo al inicio de sesión...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-mountain-700 mb-1">
                    Nueva Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                    minLength={PASSWORD_RULES.minLength}
                />
                {password && (
                    <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-mountain-600 w-12">{passwordStrength.label}</span>
                        </div>
                        {!passwordValidation.valid && (
                            <ul className="text-xs text-mountain-500 space-y-0.5">
                                {passwordValidation.errors.map((err, i) => (
                                    <li key={i} className="flex items-center gap-1">
                                        <span className="text-red-400">•</span> {err}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-mountain-700 mb-1">
                    Confirmar Contraseña
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-terracotta-400 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                />
                {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || !passwordValidation.valid || password !== confirmPassword}
                className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                    </span>
                ) : (
                    'Cambiar Contraseña'
                )}
            </button>
        </form>
    )
}
