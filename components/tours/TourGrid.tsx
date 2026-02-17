
import TourCard, { Tour } from './TourCard'

interface TourGridProps {
    tours: Tour[]
}

export default function TourGrid({ tours }: TourGridProps) {
    if (!tours || tours.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron tours disponibles.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
            ))}
        </div>
    )
}
