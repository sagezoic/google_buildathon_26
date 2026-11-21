import * as React from 'react'
import { cn } from '../../lib/cn'

export function Avatar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full bg-primary-tint text-label font-semibold text-on-primary-tint',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = React.useState(false)

  if (error || !src) return null

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'flex size-full items-center justify-center text-label font-semibold text-on-primary-tint select-none',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
