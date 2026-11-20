import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Vertical timeline. Each item has a marker (dot or icon chip) joined to the next by a line. */
export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cn('flex flex-col', className)}>{children}</ol>
}

export function TimelineItem({ marker, last, children, gap = 'gap-3.5 xl:gap-4' }: { marker: ReactNode; last?: boolean; children: ReactNode; gap?: string }) {
  return (
    <li className={cn('flex', gap)}>
      <div className="flex flex-col items-center">
        {marker}
        {!last && <span className="my-1 w-0.5 flex-1 bg-line" aria-hidden />}
      </div>
      <div className={cn('min-w-0 flex-1', !last && 'pb-5 xl:pb-6')}>{children}</div>
    </li>
  )
}
