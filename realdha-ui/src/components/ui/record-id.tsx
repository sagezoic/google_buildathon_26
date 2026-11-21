import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

/** Record ID chip (C1). Mono, copyable. */
export function RecordId({ id, className, copyable }: { id: string; className?: string; copyable?: boolean }) {
  const [done, setDone] = useState(false)
  const body = <span className="font-mono font-medium">{id}</span>
  const base = 'inline-flex items-center gap-2 rounded-control border border-line bg-sunken px-2 py-1 text-small'
  if (!copyable) return <span className={cn(base, className)}>{body}</span>
  return (
    <button
      type="button"
      className={cn(base, 'cursor-pointer hover:bg-primary-tint', className)}
      aria-label={`Copy record ID ${id}`}
      onClick={() => {
        void navigator.clipboard?.writeText(id)
        setDone(true)
        setTimeout(() => setDone(false), 1600)
      }}
    >
      {body}
      {done ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5 text-muted" aria-hidden />}
      <span className="sr-only" role="status">{done ? 'Record ID copied' : ''}</span>
    </button>
  )
}

/** The Sample-data label: hidden in production app mode. */
export function SampleData(_props: { className?: string }) {
  return null
}
