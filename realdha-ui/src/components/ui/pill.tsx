import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Status is never colour alone: always pass an icon and a word. teal = on-chain only. */
const pill = cva('inline-flex items-center gap-1.5 rounded-pill py-0.5 pl-2 pr-2.5 text-label font-medium whitespace-nowrap', {
  variants: {
    tone: {
      success: 'bg-success-tint text-success-ink',
      warning: 'bg-warning-tint text-warning-ink',
      danger: 'bg-danger-tint text-danger-ink',
      info: 'bg-info-tint text-info-ink',
      chain: 'bg-chain-tint text-chain-ink',
      brand: 'bg-primary-tint text-on-primary-tint',
      neutral: 'bg-skeleton text-muted',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Pill({ tone, icon, children, className }: VariantProps<typeof pill> & { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn(pill({ tone }), className)}>
      {icon && <span aria-hidden className="inline-flex">{icon}</span>}
      {children}
    </span>
  )
}
