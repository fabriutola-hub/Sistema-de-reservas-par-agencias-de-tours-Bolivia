interface SectionHeadingProps {
    title: string
    subtitle?: string
    center?: boolean
    light?: boolean
}

export default function SectionHeading({ title, subtitle, center = false, light = false }: SectionHeadingProps) {
    return (
        <div className={`mb-12 md:mb-20 ${center ? 'text-center mx-auto max-w-2xl' : ''}`}>
            {subtitle && (
                <span className={`block font-technical text-xs tracking-[0.2em] mb-4 uppercase ${light ? 'text-lavender' : 'text-violet'}`}>
                    {subtitle}
                </span>
            )}
            <h2 className={`font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] ${light ? 'text-white-lavender' : 'text-navy-900'}`}>
                {title}
            </h2>
        </div>
    )
}
