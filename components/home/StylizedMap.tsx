'use client'

export default function StylizedMap() {
    return (
        <div className="relative w-full h-full min-h-[400px] opacity-20 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2007/svg" className="absolute inset-0 w-full h-full text-violet">
                {/* Abstract Route Lines - representing Bolivia's diverse geography */}
                <path d="M100 500 C 150 450, 200 480, 250 400 S 350 350, 400 300" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <path d="M400 300 C 450 250, 500 280, 600 200 S 700 150, 750 100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />

                {/* Topographic curves */}
                <path d="M50 500 Q 150 550 250 500 T 450 500 T 650 500" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
                <path d="M50 450 Q 150 500 250 450 T 450 450 T 650 450" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />

                {/* Stylized Markers */}
                <circle cx="250" cy="400" r="4" fill="currentColor" />
                <circle cx="400" cy="300" r="4" fill="currentColor" />
                <circle cx="600" cy="200" r="4" fill="currentColor" />
            </svg>
        </div>
    )
}
