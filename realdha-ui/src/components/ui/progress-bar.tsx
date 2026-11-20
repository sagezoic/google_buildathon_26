import { cn } from '../../lib/cn'

/** Static widths so no inline styles are needed; extend the map when a fixture needs a new value. */
const WIDTH = { 0: 'w-0', 20: 'w-[20%]', 34: 'w-[34%]', 50: 'w-1/2', 100: 'w-full' } as const
export type ProgressValue = keyof typeof WIDTH

export function ProgressBar({ value, label, className, thick }: { value: ProgressValue; label: string; className?: string; thick?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn('overflow-hidden rounded-pill bg-line', thick ? 'h-2' : 'h-1.5', className)}
    >
      <div className={cn('h-full rounded-pill bg-primary', WIDTH[value])} />
    </div>
  )
}
