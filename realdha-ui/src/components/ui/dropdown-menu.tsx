import * as React from 'react'
import { cn } from '../../lib/cn'

interface DropdownContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className,
  ...props
}: {
  asChild?: boolean
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) throw new Error('DropdownMenuTrigger must be inside DropdownMenu')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    ctx.setOpen((prev) => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    props.onKeyDown?.(e)
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ctx.setOpen(true)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      'aria-haspopup': 'menu',
      'aria-expanded': ctx.open,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      className={cn('inline-flex items-center justify-center outline-none', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  align = 'end',
  sideOffset = 4,
  children,
  className,
}: {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) throw new Error('DropdownMenuContent must be inside DropdownMenu')

  if (!ctx.open) return null

  const alignmentClass =
    align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'

  return (
    <div
      role="menu"
      tabIndex={-1}
      style={{ marginTop: sideOffset }}
      className={cn(
        'absolute z-50 min-w-[220px] overflow-hidden rounded-control border border-line bg-surface p-1 text-text shadow-e2 outline-none animate-in fade-in-50 duration-150',
        alignmentClass,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  disabled,
  ...props
}: {
  children: React.ReactNode
  className?: string
  onSelect?: () => void
  disabled?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DropdownContext)

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    props.onClick?.(e)
    onSelect?.()
    ctx?.setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    props.onKeyDown?.(e)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.()
      ctx?.setOpen(false)
    }
  }

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-control px-2.5 py-2 text-small text-text outline-none transition-colors hover:bg-primary-tint hover:text-primary-text focus:bg-primary-tint focus:text-primary-text',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-2.5 py-1.5 text-label font-semibold text-muted', className)}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn('-mx-1 my-1 h-px bg-line', className)} />
}

export function DropdownMenuGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-0.5', className)}>{children}</div>
}
