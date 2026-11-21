import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Quiet status marker: a colour dot and a word in body ink, no capsule.
 * The word carries the meaning, the dot carries the colour. Gold dot = on-chain only.
 * `icon` is accepted for call-site compatibility but the dot replaces it.
 */
const dot = cva('size-2 flex-none rounded-full', {
  variants: {
    tone: {
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      chain: 'bg-chain',
      brand: 'bg-info',
      neutral: 'bg-line-strong',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Pill({ tone, children, className }: VariantProps<typeof dot> & { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-small font-medium whitespace-nowrap text-text', className)}>
      <span aria-hidden className={dot({ tone })} />
      {children}
    </span>
  )
}
