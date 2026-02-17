
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TopNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <MapPin className="h-8 w-8 text-rose-600" />
                            <span className="font-bold text-2xl bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                                BoliviaTours
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/" className="text-gray-700 hover:text-rose-600 transition-colors font-medium">
                            Inicio
                        </Link>
                        <Link href="/tours" className="text-gray-700 hover:text-rose-600 transition-colors font-medium">
                            Tours
                        </Link>
                        <Link href="/#about" className="text-gray-700 hover:text-rose-600 transition-colors font-medium">
                            Nosotros
                        </Link>
                        <Link href="/#contact" className="text-gray-700 hover:text-rose-600 transition-colors font-medium">
                            Contacto
                        </Link>
                        <Link
                            href="/tours"
                            className="bg-rose-600 text-white px-5 py-2 rounded-full font-medium hover:bg-rose-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Reservar Ahora
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-rose-600 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-2">
                            <Link
                                href="/"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Inicio
                            </Link>
                            <Link
                                href="/tours"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Tours
                            </Link>
                            <Link
                                href="/#about"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Nosotros
                            </Link>
                            <Link
                                href="/#contact"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Contacto
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
