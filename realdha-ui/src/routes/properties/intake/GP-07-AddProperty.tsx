import { Building2, CircleCheck, Map as MapIcon, Minus, Plus, Search, Store, type LucideIcon } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field } from '../../../components/ui/field'
import { Stepper } from '../../../components/ui/stepper'
import { plot, STEPS, type PropertyType } from '../../../data/fixtures/property-intake'
import { usePropertyDraft, type PropertyDraft } from '../../../lib/property-store'
import { cn } from '../../../lib/cn'

interface Pin { x: number; y: number }
const HOME: Pin = { x: 50, y: 45 }
const DRAGGED: Pin = { x: 62, y: 58 }

const TYPES: { id: PropertyType; label: string; desktopLabel: string; Icon: LucideIcon }[] = [
  { id: 'apartment', label: 'Apartment', desktopLabel: 'Apartment', Icon: Building2 },
  { id: 'plot', label: 'Plot / land', desktopLabel: 'Plot / land', Icon: MapIcon },
  { id: 'commercial', label: 'Commercial', desktopLabel: 'Commercial', Icon: Store },
]

const ZOOMS = ['scale-90', 'scale-100', 'scale-110', 'scale-125'] as const

type Errors = Partial<Record<'gat' | 'village' | 'taluka' | 'district', string>>
function validate(d: PropertyDraft): Errors {
  const e: Errors = {}
  const gat = d.gat.trim()
  if (!gat) e.gat = 'Enter the Gat / survey number.'
  else if (!/^\d{1,5}(\/\d{1,3}[A-Za-z]?)?$/.test(gat)) e.gat = 'Use digits like 112/2.'
  if (!d.village.trim()) e.village = 'Enter the village.'
  if (!d.taluka.trim()) e.taluka = 'Enter the taluka.'
  if (!d.district.trim()) e.district = 'Enter the district.'
  return e
}

const clamp = (n: number) => Math.min(95, Math.max(5, n))
const coords = (base: { lat: number; lng: number }, p: Pin) => {
  const lat = base.lat - (p.y - HOME.y) * 0.0003
  const lng = base.lng + (p.x - HOME.x) * 0.0004
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
}

function MapSketch({ zoom }: { zoom: number }) {
  return (
    <svg className={cn('absolute inset-0 size-full origin-center transition-transform', ZOOMS[zoom])} viewBox="0 0 700 600" preserveAspectRatio="none" aria-hidden>
      <g className="stroke-surface" strokeWidth="12" fill="none" vectorEffect="non-scaling-stroke">
        <path d="M-10 420 C160 360 320 440 500 300 S660 200 720 170" />
        <path d="M240 -10 C270 150 220 330 300 610" />
      </g>
      <g className="stroke-line-strong" strokeWidth="5" fill="none" vectorEffect="non-scaling-stroke">
        <path d="M-10 220 H720" />
        <path d="M520 -10 V610" />
      </g>
      <path className="fill-success-tint" d="M60 70 L200 50 L230 150 L90 170 Z" />
      <path className="fill-success-tint" d="M540 380 L680 360 L700 480 L560 500 Z" />
      <path className="fill-primary/20 stroke-primary" strokeWidth="2.5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" d="M330 230 L430 215 L445 300 L345 315 Z" />
    </svg>
  )
}

function Pin({ pin, dragged, onMove, hint }: { pin: Pin; dragged: boolean; onMove: (p: Pin) => void; hint: boolean }) {
  const drag = useRef(false)
  const box = (e: { currentTarget: HTMLElement }) => e.currentTarget.parentElement!.getBoundingClientRect()
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const r = box(e)
    onMove({ x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) })
  }
  const key = (e: KeyboardEvent<HTMLButtonElement>) => {
    const d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key]
    if (!d) return
    e.preventDefault()
    onMove({ x: clamp(pin.x + d[0]), y: clamp(pin.y + d[1]) })
  }
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
      {hint && !dragged && <div className="mb-1 rounded-control bg-text px-2 py-1 text-label whitespace-nowrap text-surface max-xl:hidden">Drag to place the pin</div>}
      <button
        type="button"
        aria-label="Property pin. Drag, or use the arrow keys, to move it."
        className="flex size-11 cursor-grab touch-none items-end justify-center rounded-control active:cursor-grabbing"
        onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={move}
        onPointerUp={() => { drag.current = false }}
        onPointerCancel={() => { drag.current = false }}
        onKeyDown={key}
      >
        <svg width="34" height="44" viewBox="0 0 30 38" aria-hidden>
          <path d="M15 36 C15 36 3 22 3 14 a12 12 0 0 1 24 0 c0 8-12 22-12 22z" className="fill-primary stroke-surface" strokeWidth="2.5" />
          <circle cx="15" cy="14" r="4.5" className="fill-surface" />
        </svg>
      </button>
    </div>
  )
}

function Tiles({ type, onType, mobile }: { type: PropertyType; onType: (t: PropertyType) => void; mobile?: boolean }) {
  const items = mobile ? [TYPES[1], TYPES[0], TYPES[2]] : TYPES
  return (
    <div role="radiogroup" aria-label="What kind of property?" className={cn('flex', mobile ? 'gap-2.5' : 'gap-3')}>
      {items.map(({ id, label, Icon }) => {
        const on = type === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onType(id)}
            className={cn(
              'flex flex-1 cursor-pointer text-text',
              mobile
                ? 'min-h-11 items-center justify-center rounded-lg text-small'
                : 'flex-col items-start gap-1.5 rounded-[10px] p-3.5 text-control font-semibold',
              on ? 'border-2 border-primary bg-primary-tint' : 'border border-line-strong bg-surface',
              on && !mobile && 'p-[13px]',
              mobile && (on ? 'font-semibold' : 'font-medium'),
            )}
          >
            {!mobile && <Icon className={cn('size-[22px]', on ? 'text-primary-text' : 'text-muted')} aria-hidden />}
            {label}
            {!mobile && on && <span className="text-label font-normal text-on-primary-tint">Selected</span>}
          </button>
        )
      })}
    </div>
  )
}

function MapPane({ pin, dragged, onMove, zoom, children, className }: { pin: Pin; dragged: boolean; onMove: (p: Pin) => void; zoom: number; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-dashed border-line-strong bg-sunken xl:rounded-card xl:border-solid xl:border-line xl:shadow-e1', className)}>
      <MapSketch zoom={zoom} />
      <p className="absolute inset-0 flex items-start justify-center p-2 pt-3 text-label text-muted xl:hidden">Map placeholder · drag the pin</p>
      <Pin pin={pin} dragged={dragged} onMove={onMove} hint />
      {children}
    </div>
  )
}

/** GP-07 · Add property (plot). 1440: form card + map. 834/390: stacked, map placeholder after the type. */
export default function AddProperty() {
  const [state] = useDemoState(['plot', 'pin-dragged'] as const)
  const navigate = useNavigate()
  const [draft, setDraft] = usePropertyDraft()
  const [mv, setMv] = useState(() => [draft.village, draft.taluka].filter(Boolean).join(', '))
  const [zoom, setZoom] = useState(1)
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [seen, setSeen] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState('')
  const root = useRef<HTMLDivElement>(null)

  const forced = state === 'pin-dragged' && !draft.moved
  const pin = forced ? DRAGGED : draft.pin
  const moved = forced || draft.moved
  const set = (patch: Partial<PropertyDraft>) => { setNotice(''); setDraft((d) => ({ ...d, ...patch })) }
  const onMove = (p: Pin) => set({ pin: p, moved: true })
  const errs = validate(draft)
  const err = (k: keyof Errors) => (submitted || seen[k] ? errs[k] : undefined)
  const blur = (k: string) => () => setSeen((x) => ({ ...x, [k]: true }))
  const desktopGps = coords(plot.gps, pin)
  const mobileGps = coords(plot.mobileGps, pin)

  const focusFirst = () => setTimeout(() => {
    const bad = Array.from(root.current?.querySelectorAll<HTMLElement>('[aria-invalid="true"]') ?? []).find((el) => el.offsetParent !== null)
    bad?.focus()
  }, 0)
  const save = (next: boolean) => {
    setSubmitted(true)
    const blocking = next ? Object.keys(errs).length > 0 : !!(errs.gat || errs.village)
    if (blocking) { setNotice(''); focusFirst(); return }
    setDraft((d) => ({ ...d, saved: true }))
    if (next) navigate(path('GP-08'))
    else setNotice('Draft saved. Find it on your home screen.')
  }
  const mobileVillage = (v: string) => {
    setMv(v)
    const [village, ...rest] = v.split(',')
    set({ village: village.trim(), taluka: rest.join(',').trim() })
  }
  const search = () => {
    const q = query.trim()
    if (!q) return
    set(/^\d/.test(q) ? { gat: q } : { village: q })
    if (!/^\d/.test(q)) setMv([q, draft.taluka].filter(Boolean).join(', '))
    setQuery('')
  }
  const notes = <p role="status" aria-live="polite" className="flex items-center gap-1.5 text-label text-success-ink empty:hidden">{notice && <><CircleCheck className="size-3.5" aria-hidden />{notice}</>}</p>
  const type = draft.type
  const setType = (t: PropertyType) => set({ type: t })

  return (
    <Screen id="GP-07" noTabs>
      <div ref={root} className="flex flex-1 flex-col">
      {/* 1440 */}
      <div className="flex flex-1 flex-col gap-5 px-12 py-7 max-xl:hidden">
        <Stepper steps={STEPS} current={1} />
        <h1 className="text-h1">Add property</h1>
        <div className="flex min-h-0 flex-1 gap-6">
          <Card className="flex w-[600px] flex-none flex-col gap-4">
            <div className="text-small font-medium">What kind of property?</div>
            <Tiles type={type} onType={setType} />
            <div className="flex gap-3">
              <Field className="flex-1" label="Gat / survey number" value={draft.gat} onChange={(e) => set({ gat: e.target.value })} onBlur={blur('gat')} error={err('gat')} inputMode="text" autoComplete="off" />
              <Field className="flex-1" label="Village" value={draft.village} onChange={(e) => set({ village: e.target.value })} onBlur={blur('village')} error={err('village')} />
            </div>
            <div className="flex gap-3">
              <Field className="flex-1" label="Taluka" value={draft.taluka} onChange={(e) => set({ taluka: e.target.value })} onBlur={blur('taluka')} error={err('taluka')} />
              <Field className="flex-1" label="District" value={draft.district} onChange={(e) => set({ district: e.target.value })} onBlur={blur('district')} error={err('district')} />
            </div>
            <Field label="Address or landmark" value={draft.address} onChange={(e) => set({ address: e.target.value })} help="Optional. Helps people find the plot." />
            <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
              <span className="flex-1 text-label text-muted">GPS pin</span>
              <span className="font-mono text-chip font-medium" aria-live="polite">{desktopGps}</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="lg" onClick={() => save(false)}>Save draft</Button>
              <Button size="lg" onClick={() => save(true)} className="px-7">Continue to documents</Button>
            </div>
            {notes}
          </Card>
          <MapPane pin={pin} dragged={moved} onMove={onMove} zoom={zoom} className="min-w-0 flex-1">
            <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5">
              <button type="button" aria-label="Zoom in" disabled={zoom === 3} onClick={() => setZoom((z) => Math.min(3, z + 1))} className="flex size-10 cursor-pointer items-center justify-center rounded-control border border-line-strong bg-surface text-text hover:bg-primary-tint"><Plus className="size-[18px]" aria-hidden /></button>
              <button type="button" aria-label="Zoom out" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} className="flex size-10 cursor-pointer items-center justify-center rounded-control border border-line-strong bg-surface text-text hover:bg-primary-tint"><Minus className="size-[18px]" aria-hidden /></button>
            </div>
            <form role="search" onSubmit={(e) => { e.preventDefault(); search() }} className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-chip">
              <Search className="size-4 text-muted" aria-hidden />
              <input aria-label="Search village or Gat number" placeholder="Search village or Gat number" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56 bg-transparent text-chip text-text outline-none placeholder:text-muted" />
            </form>
            <div className="absolute bottom-3 left-3.5 rounded bg-surface/90 px-1.5 py-0.5 text-overline text-muted">Sample map tile · map provider attribution</div>
          </MapPane>
        </div>
      </div>

      {/* 834 and 390 */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:gap-5 md:px-8 md:py-7 xl:hidden">
        <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase">Step 1 of 4 · Property</div>
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8">Add a property</h1>
        <Tiles type={type} onType={setType} mobile />
        <MapPane pin={pin} dragged={moved} onMove={onMove} zoom={zoom} className="h-[200px]" />
        <div className="text-label font-medium text-muted" aria-live="polite">GPS {mobileGps} (sample)</div>
        <Field label="Village" value={mv} onChange={(e) => mobileVillage(e.target.value)} onBlur={() => { blur('village')(); blur('taluka')() }} error={err('village') ?? (err('taluka') && 'Add the taluka after a comma, like Kusgaon, Maval.')} className="[&_input]:h-12" />
        <Field label="Gat / survey number" value={draft.gat} onChange={(e) => set({ gat: e.target.value })} onBlur={blur('gat')} error={err('gat')} inputMode="text" autoComplete="off" className="[&_input]:h-12" />
        <Field label="Address" value={draft.address} onChange={(e) => set({ address: e.target.value })} className="[&_input]:h-12" />
        {notes}
        <div className="flex gap-2.5 md:max-w-[360px]">
          <Button variant="secondary" size="lg" block className="px-4" onClick={() => save(false)}>Save draft</Button>
          <Button size="lg" block className="px-4" onClick={() => save(true)}>Continue</Button>
        </div>
      </div>
      </div>
    </Screen>
  )
}
