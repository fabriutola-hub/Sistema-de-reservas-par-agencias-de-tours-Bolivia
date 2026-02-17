import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'BOB'): string {
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency,
    }).format(amount)
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date))
}
