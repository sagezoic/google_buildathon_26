import { cn } from '../../lib/cn'

/** Progress bar for any 0 to 100 value (the shared ProgressBar only knows a few fixed widths). */
export function Meter({ value, label, className, thick }: { value: number; label: string; className?: string; thick?: boolean }) {
  return (
    <progress
      aria-label={label}
      max={100}
      value={Math.round(value)}
      className={cn(
        'block w-full appearance-none overflow-hidden rounded-pill border-0 bg-line [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:rounded-pill [&::-webkit-progress-value]:bg-primary',
        thick ? 'h-2' : 'h-1.5',
        className,
      )}
    />
  )
}
