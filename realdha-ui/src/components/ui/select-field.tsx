import { AlertCircle, ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** Label + native select, styled like Field. */
export function SelectField({ label, options, error, className, id, ...rest }: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { label: string; options: readonly string[]; error?: string; className?: string }) {
  const uid = useId()
  const fid = id ?? uid
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={fid} className="mb-1.5 block text-chip font-semibold">{label}</label>
      <div className="relative">
        <select
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : undefined}
          className={cn('h-control w-full cursor-pointer appearance-none rounded-control border bg-field px-3 pr-9 text-control text-text outline-none hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]', error ? 'border-danger' : 'border-line-strong')}
          {...rest}
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
      {error && <p id={`${fid}-err`} className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5" aria-hidden />{error}</p>}
    </div>
  )
}
