import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Right-hand drawer (C1). 360 wide by default, `wide` = 480 (Ask AI). Full width at 390. */
export function Drawer({ open, onOpenChange, title, subtitle, wide, children, className }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: ReactNode
  wide?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn('fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-e3 outline-none md:rounded-l-modal', wide ? 'md:w-[480px]' : 'md:w-[360px]', className)}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="text-h3">{title}</Dialog.Title>
              {subtitle && <div className="text-label text-muted">{subtitle}</div>}
            </div>
            <Dialog.Close aria-label="Close" className="-mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint">
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
