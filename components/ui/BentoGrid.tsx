'use client'

import { LucideIcon, ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BentoItemProps {
    title: string
    description?: string
    header?: ReactNode
    icon?: LucideIcon
    className?: string
    href?: string
    cta?: string
}

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string
    children?: ReactNode
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    )
}

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon: Icon,
    href,
    cta = "Ver más",
}: BentoItemProps) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {Icon && <Icon className="h-4 w-4 text-neutral-500" />}
                <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                    {description}
                </div>
                {href && (
                    <Link href={href} className="text-xs text-primary mt-4 flex items-center gap-1 group-hover/bento:gap-2 transition-all">
                        {cta} <ArrowRight size={12} />
                    </Link>
                )}
            </div>
        </div>
    )
}
