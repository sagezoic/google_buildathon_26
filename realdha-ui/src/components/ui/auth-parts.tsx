import { AlertCircle, Check, Circle, Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { PW_LABEL, PW_RULES, pwScore } from '../../lib/auth-store'
import { cn } from '../../lib/cn'

/** Centred auth card: borderless page on 390, bordered card from 834. */
export function AuthCard({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-6 pb-8 md:items-center md:pt-0">
      <div className={cn('flex w-full flex-col gap-4 md:rounded-card md:border md:border-line md:bg-surface md:p-8 md:shadow-e1', wide ? 'max-w-[560px]' : 'max-w-[440px]', className)}>{children}</div>
    </div>
  )
}

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode
  error?: string
  help?: ReactNode
  /** Right of the label (e.g. "Forgot password?"). */
  aside?: ReactNode
  mono?: boolean
  /** Adds a show/hide toggle. */
  secret?: boolean
}

/** 48px auth input with ReactNode label, inline error (icon + text) and optional password toggle. */
export function AuthInput({ label, error, help, aside, mono, secret, className, id, ...rest }: Props) {
  const uid = useId()
  const fid = id ?? uid
  const [show, setShow] = useState(false)
  const note = error ? `${fid}-err` : help ? `${fid}-help` : undefined
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={fid} className="text-chip font-semibold">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <input
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={note}
          type={secret && !show ? 'password' : secret ? 'text' : rest.type}
          {...rest}
          className={cn('h-12 w-full rounded-control border bg-field px-3 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]', mono && 'font-mono font-medium', secret && 'pr-12', error ? 'border-danger' : 'border-line-strong')}
        />
        {secret && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute top-0 right-0 flex size-12 cursor-pointer items-center justify-center rounded-control text-muted hover:text-text">
            {show ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
          </button>
        )}
      </div>
      {error ? <p id={note} role="alert" className="mt-1.5 flex items-start gap-1.5 text-label text-danger-ink"><AlertCircle className="mt-px size-3.5 flex-none" aria-hidden />{error}</p> : help ? <p id={note} className="mt-1.5 text-label text-muted">{help}</p> : null}
    </div>
  )
}

const BAR = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'] as const
const INK = ['text-danger-ink', 'text-danger-ink', 'text-warning-ink', 'text-success-ink', 'text-success-ink'] as const

/** Four-segment strength bar, word and rule checklist. The word and ticks carry meaning, not colour. */
export function PasswordStrength({ value, showRules = true }: { value: string; showRules?: boolean }) {
  const score = value ? pwScore(value) : 0
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((n) => <span key={n} className={cn('h-1 flex-1 rounded-pill', n <= score ? BAR[score] : 'bg-line')} />)}
      </div>
      {value && <p className={cn('mt-1.5 text-label font-semibold', INK[score])}>Strength: {PW_LABEL[score]}</p>}
      {showRules && (
        <ul className="mt-1.5 flex flex-col gap-1">
          {PW_RULES.map((r) => {
            const ok = r.test(value)
            return (
              <li key={r.id} className={cn('flex items-center gap-1.5 text-label', ok ? 'text-success-ink' : 'text-muted')}>
                {ok ? <Check className="size-3.5" aria-hidden /> : <Circle className="size-3" aria-hidden />}
                <span className="sr-only">{ok ? 'Met: ' : 'Not met: '}</span>{r.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Inline alert row with icon + text. */
export function Notice({ tone, icon, children }: { tone: 'danger' | 'warning' | 'success' | 'info'; icon: ReactNode; children: ReactNode }) {
  const t = { danger: 'border-danger bg-danger-tint text-danger-ink', warning: 'border-demo-line bg-warning-tint text-warning-ink', success: 'border-success bg-success-tint text-success-ink', info: 'border-info bg-info-tint text-info-ink' }[tone]
  return <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-[8px] border px-3.5 py-3 text-small', t)}><span aria-hidden className="mt-0.5 flex-none">{icon}</span><div>{children}</div></div>
}
