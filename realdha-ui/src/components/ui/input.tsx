import * as React from 'react'
import { cn } from '../../lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-control w-full rounded-control border border-line-strong bg-field px-3 py-1.5 text-control text-text shadow-e0 transition-colors placeholder:text-muted focus-visible:outline-none focus-visible:border-focus focus-visible:ring-1 focus-visible:ring-focus disabled:cursor-not-allowed disabled:bg-disabled-fill disabled:border-disabled-line disabled:text-disabled',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
