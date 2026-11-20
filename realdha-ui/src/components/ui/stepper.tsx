import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Add-property stepper (desktop). `current` is 1-based; earlier steps are done. */
export function Stepper({ steps, current, className }: { steps: readonly string[]; current: number; className?: string }) {
  return (
    <ol aria-label="Progress" className={cn('flex max-w-[720px] items-center text-chip', className)}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li key={label} className={cn('flex items-center', n < steps.length && 'flex-1')} aria-current={active ? 'step' : undefined}>
            <span className={cn('flex items-center gap-2', !done && !active && 'text-muted', active && 'font-semibold')}>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full font-semibold',
                  done && 'bg-success text-on-status',
                  active && 'bg-primary text-on-primary ring-4 ring-primary-tint',
                  !done && !active && 'border-2 border-line-strong',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : n}
              </span>
              {label}
              {done && <span className="sr-only">, done</span>}
            </span>
            {n < steps.length && <span aria-hidden className={cn('mx-3 h-0.5 flex-1', done ? 'bg-success' : 'bg-line')} />}
          </li>
        )
      })}
    </ol>
  )
}
