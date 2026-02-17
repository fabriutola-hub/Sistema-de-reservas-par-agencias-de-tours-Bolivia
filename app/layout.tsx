import type { Metadata } from 'next'
import { Fraunces, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const fraunces = Fraunces({
  variable: '--font-serif',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tourreservas.bo'),
  title: {
    default: 'TourReservas Bolivia | Tours y Experiencias Turísticas',
    template: '%s | TourReservas Bolivia'
  },
  description: 'Descubre la magia de Bolivia con los mejores tours y experiencias turísticas. Salar de Uyuni, Lago Titicaca, La Paz y mucho más. Reserva tu aventura hoy con guías expertos y seguridad garantizada.',
  keywords: ['tours bolivia', 'salar de uyuni', 'lago titicaca', 'turismo bolivia', 'agencia de viajes bolivia', 'tour operador', 'aventura bolivia', 'la paz tours', 'uyuni tours'],
  authors: [{ name: 'TourReservas Bolivia' }],
  creator: 'TourReservas Bolivia',
  publisher: 'TourReservas Bolivia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TourReservas Bolivia | Tours y Experiencias Turísticas',
    description: 'Descubre la magia de Bolivia con los mejores tours. Salar de Uyuni, Lago Titicaca y más.',
    url: 'https://tourreservas.bo',
    siteName: 'TourReservas Bolivia',
    locale: 'es_BO',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TourReservas Bolivia - Experiencias Inolvidables',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TourReservas Bolivia | Tours y Experiencias Turísticas',
    description: 'Descubre la magia de Bolivia con los mejores tours. Salar de Uyuni, Lago Titicaca y más.',
    images: ['/og-image.jpg'],
    creator: '@tourreservasbo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
      </head>
      <body className={`${fraunces.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
