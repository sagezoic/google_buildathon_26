import { useId, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Label + textarea + inline error, matching Field. */
export function TextareaField({ label, error, className, id, ...rest }: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & { label: string; error?: string; className?: string }) {
  const uid = useId()
  const fid = id ?? uid
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={fid} className="mb-1.5 block text-chip font-semibold">{label}</label>
      <textarea
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        className={cn(
          'min-h-24 w-full resize-y rounded-control border bg-field px-3 py-2.5 text-control text-text outline-none placeholder:text-muted',
          'hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]',
          error ? 'border-danger' : 'border-line-strong',
        )}
        {...rest}
      />
      {error && <p id={`${fid}-err`} className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5" aria-hidden />{error}</p>}
    </div>
  )
}
