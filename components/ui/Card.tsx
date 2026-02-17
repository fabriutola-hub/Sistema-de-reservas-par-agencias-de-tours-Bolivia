import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'warm' | 'neo' | 'glass' | 'minimal'
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
        const variants: Record<string, string> = {
            default: 'card-warm',
            warm: 'card-warm',
            elevated: 'card-elevated',
            minimal: 'bg-white border border-border rounded-2xl shadow-sm',
            // Legacy aliases
            neo: 'card-warm',
            glass: 'card-elevated',
        }

        const hoverEffects: Record<string, string> = {
            default: '',   // card-warm already has hover in CSS
            warm: '',
            elevated: '',
            minimal: 'hover:shadow-md transition-all duration-300',
            neo: '',
            glass: '',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    variants[variant],
                    hover && hoverEffects[variant],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('px-6 py-4 border-b border-border/50', className)} {...props} />
    )
)

CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
    )
)

CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('px-6 py-4 border-t border-border/50', className)} {...props} />
    )
)

CardFooter.displayName = 'CardFooter'

interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt: string
}

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
    ({ className, src, alt, ...props }, ref) => (
        <div ref={ref} className={cn('relative w-full h-48 overflow-hidden rounded-t-2xl', className)} {...props}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
        </div>
    )
)

CardImage.displayName = 'CardImage'

export { Card, CardHeader, CardContent, CardFooter, CardImage }
