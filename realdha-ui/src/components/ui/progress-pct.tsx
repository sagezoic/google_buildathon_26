import { cn } from '../../lib/cn'

/** Progress bar for any percentage (rounded to 5). Static class map, no inline styles. */
const W = ['w-0', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]', 'w-[35%]', 'w-[40%]', 'w-[45%]', 'w-1/2', 'w-[55%]', 'w-[60%]', 'w-[65%]', 'w-[70%]', 'w-[75%]', 'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-full'] as const

export function ProgressPct({ pct, label, className }: { pct: number; label: string; className?: string }) {
  const p = Math.min(100, Math.max(0, pct))
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} className={cn('h-1.5 overflow-hidden rounded-pill bg-line', className)}>
      <div className={cn('h-full rounded-pill bg-primary', W[Math.round(p / 5)])} />
    </div>
  )
}
