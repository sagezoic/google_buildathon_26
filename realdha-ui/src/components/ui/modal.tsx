import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Modal (C1): radius 16, shadow-e3, scrim, focus trap, Esc closes. Content sits in a flex column. */
export function Modal({ open, onOpenChange, title, children, className }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn('fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 overflow-y-auto rounded-modal bg-surface p-6 shadow-e3 outline-none', className)}
        >
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-h3">{title}</Dialog.Title>
            <Dialog.Close aria-label="Close" className="-mt-2 -mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint">
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
