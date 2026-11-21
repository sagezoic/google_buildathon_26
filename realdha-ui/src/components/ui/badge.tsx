import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

/** Small inline marker. Text only, tinted by tone; no capsule or border. */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 text-label font-medium select-none',
  {
    variants: {
      variant: {
        default: 'text-text',
        secondary: 'text-muted',
        outline: 'text-muted',
        success: 'text-success-ink',
        warning: 'text-warning-ink',
        danger: 'text-danger-ink',
        chain: 'text-chain-ink',
        brand: 'text-primary-text',
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
