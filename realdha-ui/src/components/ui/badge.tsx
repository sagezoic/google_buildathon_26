import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-label font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary',
        secondary: 'bg-sunken text-text border border-line',
        outline: 'border border-line-strong text-text',
        success: 'bg-success-tint text-success-ink border border-success',
        warning: 'bg-warning-tint text-warning-ink border border-warning',
        danger: 'bg-danger-tint text-danger-ink border border-danger',
        chain: 'bg-chain-tint text-chain-ink border border-chain',
        brand: 'bg-primary-tint text-primary-text border border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
