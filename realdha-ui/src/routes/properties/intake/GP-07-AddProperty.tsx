import { Building2, CircleAlert, CircleCheck, Map as MapIcon, Search, Store, type LucideIcon } from 'lucide-react'
import { useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field } from '../../../components/ui/field'
import PlotMap from '../../../components/ui/plot-map'
import { Stepper } from '../../../components/ui/stepper'
import { STEPS, type PropertyType } from '../../../data/fixtures/property-intake'
import { cn } from '../../../lib/cn'
import { AREA_UNITS, parseArea, plotFeature, type AreaUnit } from '../../../lib/plot-shape'
import { defaultDraft, isGeoPin, syncDraft, usePropertyDocuments, usePropertyDraft, type GeoPin, type PropertyDraft } from '../../../lib/property-store'

/** Demo state `pin-dragged`: the pin sits a little south-east of home. */
const DRAGGED_BY = { lng: 0.0005, lat: -0.0004 }

const TYPES: { id: PropertyType; label: string; desktopLabel: string; Icon: LucideIcon }[] = [
  { id: 'apartment', label: 'Apartment', desktopLabel: 'Apartment', Icon: Building2 },
  { id: 'plot', label: 'Plot / land', desktopLabel: 'Plot / land', Icon: MapIcon },
  { id: 'commercial', label: 'Commercial', desktopLabel: 'Commercial', Icon: Store },
]

type Errors = Partial<Record<'gat' | 'village' | 'taluka' | 'district' | 'area', string>>
function validate(d: PropertyDraft): Errors {
  const e: Errors = {}
  const gat = d.gat.trim()
  if (!gat) e.gat = 'Enter the Gat / survey number.'
  else if (!/^\d{1,5}(\/\d{1,3}[A-Za-z]?)?$/.test(gat)) e.gat = 'Use digits like 112/2.'
  if (!d.village.trim()) e.village = 'Enter the village.'
  if (!d.taluka.trim()) e.taluka = 'Enter the taluka.'
  if (!d.district.trim()) e.district = 'Enter the district.'
  if (parseArea(d.area ?? '') === null) e.area = 'Enter the plot area as a number, like 3,200.'
  return e
}

const coords = (p: GeoPin) => `${p.lat.toFixed(4)}° ${p.lat >= 0 ? 'N' : 'S'}, ${p.lng.toFixed(4)}° ${p.lng >= 0 ? 'E' : 'W'}`

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

function AreaField({ draft, set, error, onBlur, className }: { draft: PropertyDraft; set: (patch: Partial<PropertyDraft>) => void; error?: string; onBlur: () => void; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Field className="flex-1" label="Plot area" value={draft.area} onChange={(e) => set({ area: e.target.value })} onBlur={onBlur} error={error} inputMode="decimal" autoComplete="off" help={error ? undefined : 'Draws the outline on the map.'} />
      <div className="flex flex-col">
        <label htmlFor="plot-area-unit" className="mb-1.5 block text-chip font-semibold">Unit</label>
        <select id="plot-area-unit" value={draft.areaUnit} onChange={(e) => set({ areaUnit: e.target.value as AreaUnit })} className="h-control cursor-pointer rounded-control border border-line-strong bg-field px-3 text-control text-text outline-none hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)] max-xl:h-12">
          {AREA_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>
    </div>
  )
}

/** One WebGL map at a time: both layouts are in the DOM (CSS hides one), so mount the map only for the active breakpoint. */
function useWide() {
  return useSyncExternalStore(
    (cb) => { const q = matchMedia('(min-width: 1440px)'); q.addEventListener('change', cb); return () => q.removeEventListener('change', cb) },
    () => matchMedia('(min-width: 1440px)').matches,
    () => true,
  )
}

type MapPaneProps = { pin: GeoPin; dragged: boolean; onMove: (p: GeoPin) => void; shape: ReturnType<typeof plotFeature>; fitKey: string; compact?: boolean; children?: ReactNode; className?: string }
function MapPane({ pin, dragged, onMove, shape, fitKey, compact, children, className }: MapPaneProps) {
  return (
    <PlotMap pin={pin} onPinChange={onMove} shape={shape} fitKey={fitKey} hint={!dragged} compact={compact} className={cn('rounded-lg border border-line-strong xl:rounded-card xl:border-line xl:shadow-e1', className)}>
      {children}
    </PlotMap>
  )
}

/** GP-07 · Add property (plot). 1440: form card + map. 834/390: stacked, map placeholder after the type. */
export default function AddProperty() {
  const [state] = useDemoState(['plot', 'pin-dragged'] as const)
  const navigate = useNavigate()
  const [draft, setDraft] = usePropertyDraft()
  const [, setDocs] = usePropertyDocuments()
  const [mv, setMv] = useState(() => [draft.village, draft.taluka].filter(Boolean).join(', '))
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [seen, setSeen] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const root = useRef<HTMLDivElement>(null)

  // Drafts saved before the live map hold a percent-based `{ x, y }` pin and no area: fall back to the sample values.
  const home: GeoPin = isGeoPin(draft.pin) ? (draft.pin as GeoPin) : (defaultDraft.pin as GeoPin)
  const area = draft.area ?? defaultDraft.area
  const areaUnit = draft.areaUnit ?? defaultDraft.areaUnit
  const forced = state === 'pin-dragged' && !draft.moved
  const pin = useMemo<GeoPin>(() => (forced ? { lng: home.lng + DRAGGED_BY.lng, lat: home.lat + DRAGGED_BY.lat } : home), [forced, home])
  const moved = forced || draft.moved
  const set = (patch: Partial<PropertyDraft>) => { setNotice(''); setDraft((d) => ({ ...d, ...patch })) }
  const onMove = (p: GeoPin) => set({ pin: p, moved: true })
  const errs = validate({ ...draft, area })
  const err = (k: keyof Errors) => (submitted || seen[k] ? errs[k] : undefined)
  const blur = (k: string) => () => setSeen((x) => ({ ...x, [k]: true }))
  const gps = coords(pin)
  const shape = useMemo(() => plotFeature(pin, area, areaUnit), [pin, area, areaUnit])
  const fitKey = `${area}|${areaUnit}`
  const areaDraft = { ...draft, area, areaUnit }
  const wide = useWide()

  const focusFirst = () => setTimeout(() => {
    const bad = Array.from(root.current?.querySelectorAll<HTMLElement>('[aria-invalid="true"]') ?? []).find((el) => el.offsetParent !== null)
    bad?.focus()
  }, 0)
  const save = async (next: boolean) => {
    if (saving) return
    setSubmitted(true)
    const blocking = next ? Object.keys(errs).length > 0 : !!(errs.gat || errs.village)
    if (blocking) { setNotice(''); focusFirst(); return }
    setSaveError('')
    setSaving(true)
    try {
      const id = await syncDraft({ ...draft, area, areaUnit, pin, saved: true })
      // A new server property starts with no documents: the demo seed rows are not on the server.
      if (id !== draft.id) setDocs([])
      setDraft((d) => ({ ...d, saved: true, id }))
      if (next) navigate(path('GP-08'))
      else setNotice('Draft saved. Find it on your home screen.')
    } catch (e) {
      setNotice('')
      setSaveError(e instanceof Error ? e.message : 'Could not save the draft. Try again.')
    } finally {
      setSaving(false)
    }
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
  const notes = (
    <>
      <p role="status" aria-live="polite" className="flex items-center gap-1.5 text-label text-success-ink empty:hidden">{notice && <><CircleCheck className="size-3.5" aria-hidden />{notice}</>}</p>
      <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink empty:hidden">{saveError && <><CircleAlert className="size-3.5 flex-none" aria-hidden />{saveError}</>}</p>
    </>
  )
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
            <AreaField draft={areaDraft} set={set} error={err('area')} onBlur={blur('area')} />
            <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
              <span className="flex-1 text-label text-muted">GPS pin</span>
              <span className="font-mono text-chip font-medium" aria-live="polite">{gps}</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="lg" onClick={() => save(false)}>Save draft</Button>
              <Button size="lg" onClick={() => save(true)} className="px-7">Continue to documents</Button>
            </div>
            {notes}
          </Card>
          {wide && (
            <MapPane pin={pin} dragged={moved} onMove={onMove} shape={shape} fitKey={fitKey} className="min-w-0 flex-1">
              <form role="search" onSubmit={(e) => { e.preventDefault(); search() }} className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-chip">
                <Search className="size-4 text-muted" aria-hidden />
                <input aria-label="Search village or Gat number" placeholder="Search village or Gat number" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56 bg-transparent text-chip text-text outline-none placeholder:text-muted" />
              </form>
            </MapPane>
          )}
        </div>
      </div>

      {/* 834 and 390 */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:gap-5 md:px-8 md:py-7 xl:hidden">
        <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase">Step 1 of 4 · Property</div>
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8">Add a property</h1>
        <Tiles type={type} onType={setType} mobile />
        {!wide && <MapPane pin={pin} dragged={moved} onMove={onMove} shape={shape} fitKey={fitKey} compact className="h-[200px]" />}
        <div className="text-label font-medium text-muted" aria-live="polite">GPS {gps}</div>
        <Field label="Village" value={mv} onChange={(e) => mobileVillage(e.target.value)} onBlur={() => { blur('village')(); blur('taluka')() }} error={err('village') ?? (err('taluka') && 'Add the taluka after a comma, like Kusgaon, Maval.')} className="[&_input]:h-12" />
        <Field label="Gat / survey number" value={draft.gat} onChange={(e) => set({ gat: e.target.value })} onBlur={blur('gat')} error={err('gat')} inputMode="text" autoComplete="off" className="[&_input]:h-12" />
        <AreaField draft={areaDraft} set={set} error={err('area')} onBlur={blur('area')} className="[&_input]:h-12" />
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
