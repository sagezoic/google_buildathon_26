import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  help?: ReactNode
  /** Error text. Shown with an icon, never colour alone. */
  error?: string
  className?: string
}

/** Label + input + help/error (C1). Height 44 (48 on auth screens via `className`). */
export function Field({ label, help, error, className, id, ...input }: FieldProps) {
  const uid = useId()
  const fid = id ?? uid
  const note = error ? `${fid}-err` : help ? `${fid}-help` : undefined
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={fid} className="mb-1.5 block text-chip font-semibold">{label}</label>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={note}
        className={cn(
          'h-control w-full rounded-control border bg-field px-3 text-control text-text placeholder:text-muted outline-none',
          'hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]',
          'disabled:bg-disabled-fill disabled:text-disabled',
          error ? 'border-danger' : 'border-line-strong',
        )}
        {...input}
      />
      {error ? (
        <p id={note} className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5" aria-hidden />{error}</p>
      ) : help ? (
        <p id={note} className="mt-1.5 text-label text-muted">{help}</p>
      ) : null}
    </div>
  )
}
