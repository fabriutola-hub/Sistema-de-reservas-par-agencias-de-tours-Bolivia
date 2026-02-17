import Footer from '@/components/layout/Footer'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
        </div>
    )
}
