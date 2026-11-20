import { cn } from '../../lib/cn'

/** Segmented choice (the frames' ".ls" control): one option selected, arrow keys move between options. */
export function Segmented<T extends string>({ value, onChange, options, label, className }: {
  value: T
  onChange: (v: T) => void
  options: readonly { value: T; label: string }[]
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex max-w-full overflow-x-auto rounded-control border border-line-strong bg-surface text-chip font-medium', className)}>
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
              if (!step) return
              e.preventDefault()
              const next = options[(i + step + options.length) % options.length]
              onChange(next.value)
              ;(e.currentTarget.parentElement?.querySelectorAll('button')[options.indexOf(next)] as HTMLElement | undefined)?.focus()
            }}
            className={cn('min-h-11 cursor-pointer px-3.5 whitespace-nowrap md:min-h-9', on ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
