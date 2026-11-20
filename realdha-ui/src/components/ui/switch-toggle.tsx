import { cn } from '../../lib/cn'

/** On/off switch (the frames' ".tg"). Name it with `label` (aria) or point `labelledBy` at visible text. */
export function SwitchToggle({ checked, onChange, label, labelledBy, className }: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  labelledBy?: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-10 flex-none cursor-pointer items-center rounded-pill border transition-colors before:absolute before:-inset-2.5 before:content-[""]', checked ? 'border-primary bg-primary' : 'border-line-strong bg-skeleton', className)}
    >
      <span aria-hidden className={cn('block size-[18px] rounded-full bg-white shadow-e1 transition-transform motion-reduce:transition-none', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  )
}
