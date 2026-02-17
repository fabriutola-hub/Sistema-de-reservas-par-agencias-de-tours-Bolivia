import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'glass'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        // Base styles are now handled by the CSS classes, but we can add Tailwind utilities here for specific needs
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

        const variants: Record<string, string> = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            outline: 'btn-secondary', // Reuse secondary for outline
            ghost: 'hover:bg-accent/10 hover:text-primary text-foreground', // Tailwind utility for ghost
            accent: 'bg-accent text-accent-foreground hover:bg-accent/90', // Tailwind utility
            glass: 'btn-glass',
        }

        const sizes: Record<string, string> = {
            sm: 'h-9 px-4 text-xs',
            md: 'h-11 px-8 text-sm',
            lg: 'h-14 px-10 text-base',
            icon: 'h-10 w-10',
        }

        const isUtilityVariant = ['primary', 'secondary', 'glass'].includes(variant)

        return (
            <button
                ref={ref}
                className={cn(
                    isUtilityVariant ? '' : baseStyles,
                    isUtilityVariant ? '' : sizes[size],
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button }
