import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PerfilLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get profile info
    const { data: profile } = await supabase
        .from('profiles')
        .select('nombre_completo, email')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-sand-50 pt-32">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-sand-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
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
                            <span className="text-xl font-bold text-mountain-800">
                                TourReservas
                            </span>
                        </Link>

                        {/* User Info & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-mountain-800">
                                    {profile?.nombre_completo || 'Usuario'}
                                </p>
                                <p className="text-xs text-mountain-500">
                                    {profile?.email || user.email}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href="/"
                                    className="px-3 py-2 text-sm text-mountain-600 hover:text-mountain-800 transition-colors"
                                >
                                    Ver Tours
                                </Link>
                                <form action="/api/auth/signout" method="POST">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-mountain-100 text-mountain-700 rounded-lg hover:bg-mountain-200 transition-colors"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    )
}
