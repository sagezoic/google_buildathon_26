import { Ban, CircleAlert, Clock, Check, Square } from 'lucide-react'
import { useId, useRef, type InputHTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode, type SelectHTMLAttributes } from 'react'
import { STATUS_LABEL, STATUS_LETTER, STATUSES, type Pin, type Unit, type UnitStatus } from '../../data/fixtures/f10-project'
import { cn } from '../../lib/cn'
import { Pill } from './pill'

/* ---------- 5-step pills (desktop and tablet) ---------- */
const STEPS = ['1. Details', '2. Towers and floors', '3. Units', '4. Plans', '5. Publish']
export function StepPills({ current, className }: { current: number; className?: string }) {
  return (
    <ol aria-label="Progress" className={cn('flex flex-wrap items-center gap-2', className)}>
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i + 1 === current ? 'step' : undefined}>
          <Pill tone={i + 1 < current ? 'success' : i + 1 === current ? 'brand' : 'neutral'} className="px-2.5 text-chip">{s}<span className="sr-only">{i + 1 < current ? ', done' : ''}</span></Pill>
        </li>
      ))}
    </ol>
  )
}

/* ---------- form controls with node labels (frames differ in copy by size) ---------- */
export const control = 'h-control w-full rounded-control border bg-field px-3 text-control text-text placeholder:text-muted outline-none hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)] disabled:bg-disabled-fill disabled:text-disabled'

function Shell({ id, label, error, help, className, children }: { id: string; label: ReactNode; error?: string; help?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <label htmlFor={id} className="mb-1.5 block text-chip font-semibold">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5 flex-none" aria-hidden />{error}</p>
      ) : help ? <p id={`${id}-help`} className="mt-1.5 text-label text-muted">{help}</p> : null}
    </div>
  )
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & { label: ReactNode; error?: string; help?: ReactNode; wrap?: string }
export function TextField({ label, error, help, wrap, className, id, ...rest }: TextProps) {
  const uid = useId()
  const fid = id ?? uid
  return (
    <Shell id={fid} label={label} error={error} help={help} className={wrap}>
      <input id={fid} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-err` : help ? `${fid}-help` : undefined} className={cn(control, error ? 'border-danger' : 'border-line-strong', className)} {...rest} />
    </Shell>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: ReactNode; error?: string; wrap?: string }
export function SelectField({ label, error, wrap, className, id, children, ...rest }: SelectProps) {
  const uid = useId()
  const fid = id ?? uid
  return (
    <Shell id={fid} label={label} error={error} className={wrap}>
      <select id={fid} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-err` : undefined} className={cn(control, 'cursor-pointer', error ? 'border-danger' : 'border-line-strong', className)} {...rest}>{children}</select>
    </Shell>
  )
}

/* ---------- placeholder map with a draggable pin (steps of 5%) ---------- */
const LEFT = ['left-[0%]', 'left-[5%]', 'left-[10%]', 'left-[15%]', 'left-[20%]', 'left-[25%]', 'left-[30%]', 'left-[35%]', 'left-[40%]', 'left-[45%]', 'left-[50%]', 'left-[55%]', 'left-[60%]', 'left-[65%]', 'left-[70%]', 'left-[75%]', 'left-[80%]', 'left-[85%]', 'left-[90%]', 'left-[95%]', 'left-[100%]']
const TOP = ['top-[0%]', 'top-[5%]', 'top-[10%]', 'top-[15%]', 'top-[20%]', 'top-[25%]', 'top-[30%]', 'top-[35%]', 'top-[40%]', 'top-[45%]', 'top-[50%]', 'top-[55%]', 'top-[60%]', 'top-[65%]', 'top-[70%]', 'top-[75%]', 'top-[80%]', 'top-[85%]', 'top-[90%]', 'top-[95%]', 'top-[100%]']
const clamp = (n: number) => Math.min(20, Math.max(0, n))

export function PinMap({ pin, onChange, label, className }: { pin: Pin; onChange?: (p: Pin) => void; label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const move = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect()
    if (!r || !onChange) return
    onChange({ x: clamp(Math.round(((e.clientX - r.left) / r.width) * 20)), y: clamp(Math.round(((e.clientY - r.top) / r.height) * 20)) })
  }
  const key = (e: KeyboardEvent) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
    if (!d || !onChange) return
    e.preventDefault()
    onChange({ x: clamp(pin.x + d[0]), y: clamp(pin.y + d[1]) })
  }
  return (
    <div
      ref={box}
      className={cn('relative h-[217px] touch-none overflow-hidden rounded-control border border-dashed border-line-strong bg-sunken', onChange && 'cursor-crosshair', className)}
      onPointerDown={(e) => { if (!onChange) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e) }}
      onPointerMove={(e) => { if (dragging.current) move(e) }}
      onPointerUp={() => { dragging.current = false }}
    >
      <span className="pointer-events-none absolute top-3 left-3 rounded-control border border-line bg-surface px-2.5 py-1 text-label text-muted">{label}</span>
      <button
        type="button"
        disabled={!onChange}
        aria-label={onChange ? `Project location pin, ${pin.x * 5} percent across, ${pin.y * 5} percent down. Drag it or use the arrow keys.` : 'Project location'}
        onKeyDown={key}
        className={cn('absolute z-10 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-primary shadow-e1 disabled:cursor-default', LEFT[pin.x], TOP[pin.y], onChange && 'cursor-grab active:cursor-grabbing')}
      />
    </div>
  )
}

/* ---------- unit cells ---------- */
const TONE_COMPACT: Record<UnitStatus, string> = {
  available: 'border-success bg-success-tint text-success-ink',
  booked: 'border-warning bg-warning-tint text-warning-ink',
  sold: 'border-info bg-info-tint text-info-ink',
  'not-released': 'border-line-strong bg-sunken text-muted',
}
const TONE_FULL: Record<UnitStatus, string> = {
  available: 'border-success bg-success-tint text-success-ink',
  booked: 'border-warning bg-warning-tint text-warning-ink',
  sold: 'border-line-strong bg-sunken text-muted',
  'not-released': 'border-dashed border-line-strong bg-sunken text-muted',
}
const PLAIN = 'border-line-strong bg-surface text-text'
const ICON: Record<UnitStatus, ReactNode> = {
  available: <Check className="size-3" />,
  booked: <Clock className="size-3" />,
  sold: <Square className="size-2.5 fill-current" />,
  'not-released': <Ban className="size-3" />,
}
export const StatusIcon = ({ s }: { s: UnitStatus }) => <span aria-hidden className="inline-flex">{ICON[s]}</span>

/** Phone cell: `1801·A`. */
export function CompactCell({ u, selected, onSelect, disabled }: { u: Unit; selected?: boolean; onSelect?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${u.id}, ${STATUS_LABEL[u.status]}`}
      className={cn('flex min-h-11 cursor-pointer items-center justify-center rounded-control border text-chip font-semibold disabled:cursor-not-allowed', TONE_COMPACT[u.status], selected && 'ring-2 ring-primary ring-offset-1 ring-offset-surface')}
    >
      {u.floor}{String(u.no).padStart(2, '0')}·{STATUS_LETTER[u.status]}
    </button>
  )
}

/** Desktop and tablet cell. `grid` shows configuration and price (F10-04), `picker` shows the status (F10-08). */
export function FullCell({ u, mode, price, selected, onSelect, disabled }: { u: Unit; mode: 'grid' | 'picker'; price?: string; selected?: boolean; onSelect?: () => void; disabled?: boolean }) {
  const tone = mode === 'picker' ? TONE_FULL[u.status] : u.status === 'available' ? PLAIN : TONE_FULL[u.status]
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${u.id}, ${u.bhk}, ${STATUS_LABEL[u.status]}${price ? `, ${price}` : ''}`}
      className={cn('flex min-h-12 min-w-0 cursor-pointer flex-col items-center justify-center rounded-control border px-1 py-1 text-center disabled:cursor-not-allowed', tone, selected && 'ring-2 ring-primary ring-offset-1 ring-offset-surface')}
    >
      <span className="text-label font-semibold">{u.id}</span>
      {mode === 'grid' ? (
        <>
          <span className="font-mono text-label whitespace-nowrap max-md:text-[11px]">{u.bhk} · {price}</span>
          {u.status !== 'available' && <span className="inline-flex items-center gap-1 text-label"><StatusIcon s={u.status} />{STATUS_LABEL[u.status]}</span>}
        </>
      ) : (
        <span className="inline-flex items-center gap-1 text-label"><StatusIcon s={u.status} />{STATUS_LABEL[u.status]}</span>
      )}
    </button>
  )
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6',
  7: 'grid-cols-7', 8: 'grid-cols-8', 9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11', 12: 'grid-cols-12',
}
export const colsClass = (n: number) => COLS[Math.min(12, Math.max(1, n))]

/** Legend: A · Available, B · Booked, S · Sold, N · Not released. */
export function StatusLegend({ className }: { className?: string }) {
  const tone = { available: 'success', booked: 'warning', sold: 'info', 'not-released': 'neutral' } as const
  return (
    <ul aria-label="Status key" className={cn('flex flex-wrap gap-2', className)}>
      {STATUSES.map((s) => <li key={s}><Pill tone={tone[s]} className="px-2.5 text-chip">{STATUS_LETTER[s]} · {STATUS_LABEL[s]}</Pill></li>)}
    </ul>
  )
}
