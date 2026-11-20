import { cn } from '../../lib/cn'

/** On/off switch (C1). Label it with `aria-label` or `aria-labelledby`. */
export function Switch({ checked, onChange, className, ...aria }: {
  checked: boolean
  onChange: (next: boolean) => void
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 flex-none cursor-pointer rounded-pill border transition-colors duration-[var(--rd-dur-fast)] max-md:before:absolute max-md:before:-inset-2.5 max-md:before:content-[""]', checked ? 'border-primary bg-primary' : 'border-line-strong bg-skeleton', className)}
      {...aria}
    >
      <span aria-hidden className={cn('absolute top-0.5 size-[18px] rounded-full bg-white shadow-e1 transition-all duration-[var(--rd-dur-fast)] motion-reduce:transition-none', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}
