import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from 'react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-control border font-medium whitespace-nowrap no-underline cursor-pointer transition-colors duration-[var(--rd-dur-fast)] disabled:cursor-not-allowed disabled:bg-disabled-fill disabled:border-disabled-line disabled:text-disabled aria-disabled:cursor-not-allowed aria-disabled:bg-disabled-fill aria-disabled:border-disabled-line aria-disabled:text-disabled',
  {
    variants: {
      variant: {
        primary: 'bg-primary border-primary text-on-primary hover:bg-primary-hover hover:border-primary-hover',
        secondary: 'bg-surface border-line-strong text-primary-text hover:bg-primary-tint',
        ghost: 'bg-transparent border-transparent text-primary-text hover:bg-primary-tint',
        danger: 'bg-danger border-danger text-on-status hover:bg-danger-hover hover:border-danger-hover',
      },
      size: {
        md: 'h-control px-5 text-control',
        sm: 'h-control-sm px-3.5 text-chip',
        lg: 'h-12 px-5 text-control',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type Props = VariantProps<typeof button> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    /** Render as a router link (prototype navigation). */
    to?: string
    loading?: boolean
    icon?: ReactNode
    children?: ReactNode
  }

export function Button({ variant, size, block, to, loading, icon, className, children, disabled, ...rest }: Props) {
  const cls = cn(button({ variant, size, block }), className)
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : icon}
      {children}
    </>
  )
  if (to && !disabled) return <Link to={to} className={cls}>{content}</Link>
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
}
