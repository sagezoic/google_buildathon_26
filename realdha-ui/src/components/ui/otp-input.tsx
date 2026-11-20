import { useRef } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  value: string
  onChange: (v: string) => void
  length?: number
  error?: boolean
  disabled?: boolean
  label?: string
  describedBy?: string
  className?: string
}

/** Segmented one-time-code input: auto-advance, backspace, paste. */
export function OtpInput({ value, onChange, length = 6, error, disabled, label = 'Verification code', describedBy, className }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), length - 1)]?.focus()
  const set = (i: number, d: string) => {
    const chars = value.padEnd(length, ' ').split('')
    chars[i] = d || ' '
    onChange(chars.join('').trimEnd().replace(/ /g, ''))
  }
  return (
    <div role="group" aria-label={label} className={cn('flex gap-1.5 md:gap-2', disabled && 'opacity-50', className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          value={value[i] ?? ''}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1)
            if (!d) return
            set(i, d)
            focus(i + 1)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault()
              if (value[i]) set(i, '')
              else { set(Math.max(i - 1, 0), ''); focus(i - 1) }
            } else if (e.key === 'ArrowLeft') focus(i - 1)
            else if (e.key === 'ArrowRight') focus(i + 1)
          }}
          onPaste={(e) => {
            const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (!t) return
            e.preventDefault()
            onChange(t)
            focus(t.length)
          }}
          className={cn(
            'h-[52px] min-w-0 flex-1 rounded-control border bg-field text-center font-mono text-[20px] font-semibold text-text outline-none',
            'focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]',
            error ? 'border-danger shadow-[inset_0_0_0_1px_var(--rd-danger)]' : 'border-line-strong',
          )}
        />
      ))}
    </div>
  )
}
