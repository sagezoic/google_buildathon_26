import { Building2, CircleCheck, Map as MapIcon, Store, type LucideIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistedDemo } from '../../../lib/demo-param'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field } from '../../../components/ui/field'
import { SelectField } from '../../../components/ui/select-field'
import { CONFIGS, FACINGS, STEP_LABEL, UNIT_TYPES, USES, type ApartmentForm, type CommercialForm, type DraftEntry, type PropKind } from '../../../data/fixtures/f03-properties'
import { cn } from '../../../lib/cn'
import { logAudit } from '../../../lib/audit'
import { useAddForm, useDrafts } from '../../../lib/f03-store'

const TILES: { id: PropKind; label: string; Icon: LucideIcon }[] = [
  { id: 'apartment', label: 'Apartment', Icon: Building2 },
  { id: 'plot', label: 'Plot / land', Icon: MapIcon },
  { id: 'commercial', label: 'Commercial', Icon: Store },
]

const pad = (s: string) => s.trim().padStart(2, '0')
const RERA = /^P\d{11}$/
const AREA = /^\d[\d,]*(\.\d+)?$/

type Errors = Record<string, string>
function checkApartment(a: ApartmentForm): Errors {
  const e: Errors = {}
  if (!a.project.trim()) e.project = 'Enter the project name.'
  if (!RERA.test(a.rera.trim())) e.rera = 'Use P followed by 11 digits, like P52100012345.'
  if (!a.tower.trim()) e.tower = 'Enter the tower.'
  if (!/^\d{1,3}$/.test(a.floor.trim())) e.floor = 'Use digits.'
  if (!/^\d{1,3}$/.test(a.unit.trim())) e.unit = 'Use digits.'
  if (!AREA.test(a.carpet.trim())) e.carpet = 'Enter the area in sq ft.'
  return e
}
function checkCommercial(c: CommercialForm): Errors {
  const e: Errors = {}
  if (!c.building.trim()) e.building = 'Enter the building or complex.'
  if (!RERA.test(c.rera.trim())) e.rera = 'Use P followed by 11 digits, like P52100054321.'
  if (!c.floor.trim()) e.floor = 'Enter the floor.'
  if (!/^\d{1,3}$/.test(c.unit.trim())) e.unit = 'Use digits.'
  if (!AREA.test(c.carpet.trim())) e.carpet = 'Enter the area in sq ft.'
  if (!c.address.trim()) e.address = 'Enter the address.'
  return e
}

/** F03-01 · Add property, apartment and commercial. States: apartment, commercial. Plot goes to GP-07. */
export default function AddApartment() {
  const [type, setType] = usePersistedDemo('f03.type', ['apartment', 'commercial'] as const)
  const navigate = useNavigate()
  const [form, setForm] = useAddForm()
  const [, setDrafts] = useDrafts()
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const root = useRef<HTMLDivElement>(null)

  const apt = form.apartment
  const com = form.commercial
  const setApt = (p: Partial<ApartmentForm>) => { setNotice(''); setForm((f) => ({ ...f, apartment: { ...f.apartment, ...p } })) }
  const setCom = (p: Partial<CommercialForm>) => { setNotice(''); setForm((f) => ({ ...f, commercial: { ...f.commercial, ...p } })) }
  const pick = (t: PropKind) => {
    if (t === 'plot') { navigate(path('GP-07')); return }
    setType(t)
  }
  const errs = type === 'apartment' ? checkApartment(apt) : checkCommercial(com)
  const err = (k: string) => (submitted ? errs[k] : undefined)
  const recordPreview = `RA-PUN-001-${apt.tower.trim().toUpperCase() || '—'}-${pad(apt.floor)}-${pad(apt.unit)}`

  const focusFirst = () => setTimeout(() => {
    root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, 0)

  const entry = (): DraftEntry => {
    const apartment = type === 'apartment'
    const title = apartment ? `${apt.tower.trim().toUpperCase()}-${pad(apt.floor)}${pad(apt.unit)} · ${apt.config}` : `${com.unitType} ${pad(com.unit)}, ${com.building}`
    return {
      id: apartment ? 'draft-apartment' : 'draft-commercial',
      kind: type,
      title,
      mTitle: title,
      sub: `Step 1 of 4 · ${STEP_LABEL[1]}`,
      step: 1,
      savedAt: Date.now(),
      to: path('F03-01'),
    }
  }
  const saveDraft = () => {
    setSubmitted(true)
    const required = type === 'apartment' ? !apt.project.trim() : !com.building.trim()
    if (required) { focusFirst(); return }
    const e = entry()
    setDrafts((d) => [e, ...d.filter((x) => x.id !== e.id)])
    logAudit('Prakash Kulkarni', `Saved a draft: ${e.title}`)
    navigate(`${path('F03-04')}?state=saved`)
  }
  const next = () => {
    setSubmitted(true)
    if (Object.keys(errs).length) { focusFirst(); return }
    setDrafts((d) => d.filter((x) => x.id !== (type === 'apartment' ? 'draft-apartment' : 'draft-commercial')))
    logAudit('Prakash Kulkarni', type === 'apartment' ? `Added apartment ${recordPreview}` : `Added commercial unit ${com.unit}`)
    navigate(path('GP-08'))
  }

  const aptForm = (
    <>
      <div className="flex gap-3 max-md:flex-col">
        <Field className="flex-1" label="Project name" value={apt.project} onChange={(e) => setApt({ project: e.target.value })} error={err('project')} autoComplete="off" />
        <Field className="flex-1 [&_input]:font-mono [&_input]:font-medium" label="RERA project no." value={apt.rera} onChange={(e) => setApt({ rera: e.target.value.toUpperCase() })} error={err('rera')} autoComplete="off" />
      </div>
      <div className="flex gap-3">
        <Field className="flex-1" label="Tower" value={apt.tower} onChange={(e) => setApt({ tower: e.target.value })} error={err('tower')} autoComplete="off" />
        <Field className="flex-1" label="Floor" value={apt.floor} onChange={(e) => setApt({ floor: e.target.value })} error={err('floor')} inputMode="numeric" autoComplete="off" />
        <Field className="flex-1" label="Unit no." value={apt.unit} onChange={(e) => setApt({ unit: e.target.value })} error={err('unit')} inputMode="numeric" autoComplete="off" />
      </div>
      <div className="flex gap-3 max-md:flex-col">
        <SelectField className="flex-1" label="Configuration" options={CONFIGS} value={apt.config} onChange={(e) => setApt({ config: e.target.value })} />
        <Field className="flex-1" label="Carpet area (sq ft)" value={apt.carpet} onChange={(e) => setApt({ carpet: e.target.value })} error={err('carpet')} inputMode="decimal" autoComplete="off" />
      </div>
      <div className="flex gap-3 max-md:flex-col">
        <SelectField className="flex-1" label="Facing" options={FACINGS} value={apt.facing} onChange={(e) => setApt({ facing: e.target.value })} />
        <Field className="flex-1" label="View" value={apt.view} onChange={(e) => setApt({ view: e.target.value })} autoComplete="off" />
      </div>
      <p className="text-label text-muted">Record ID preview: <span className="font-mono font-medium text-text">{recordPreview}</span> · assigned after sign-off</p>
    </>
  )

  const comForm = (
    <>
      <div className="flex gap-3 max-md:flex-col">
        <Field className="flex-1" label="Building / complex" value={com.building} onChange={(e) => setCom({ building: e.target.value })} error={err('building')} autoComplete="off" />
        <Field className="flex-1 [&_input]:font-mono [&_input]:font-medium" label="RERA project no." value={com.rera} onChange={(e) => setCom({ rera: e.target.value.toUpperCase() })} error={err('rera')} autoComplete="off" />
      </div>
      <div className="flex gap-3">
        <SelectField className="flex-1" label="Unit type" options={UNIT_TYPES} value={com.unitType} onChange={(e) => setCom({ unitType: e.target.value })} />
        <Field className="flex-1" label="Floor" value={com.floor} onChange={(e) => setCom({ floor: e.target.value })} error={err('floor')} autoComplete="off" />
        <Field className="flex-1" label="Unit no." value={com.unit} onChange={(e) => setCom({ unit: e.target.value })} error={err('unit')} inputMode="numeric" autoComplete="off" />
      </div>
      <div className="flex gap-3 max-md:flex-col">
        <Field className="flex-1" label="Carpet area (sq ft)" value={com.carpet} onChange={(e) => setCom({ carpet: e.target.value })} error={err('carpet')} inputMode="decimal" autoComplete="off" />
        <SelectField className="flex-1" label="Permitted use" options={USES} value={com.use} onChange={(e) => setCom({ use: e.target.value })} />
      </div>
      <Field label="Address" value={com.address} onChange={(e) => setCom({ address: e.target.value })} error={err('address')} autoComplete="off" />
      <div className="flex h-[88px] items-center justify-center rounded-lg border border-line bg-surface p-2 text-label font-medium text-muted">📍 GPS Pin located at registered building address · Click to verify on survey map</div>
    </>
  )

  return (
    <Screen id="F03-01" role="owner" back={path('F03-03')} title="Add property" noTabs>
      <div ref={root} className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6 xl:px-12">
        <div>
          <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase xl:text-label">
            <span className="xl:hidden">Step 1 of 4 · Property</span>
            <span className="max-xl:hidden">Step 1 of 4 · Property details</span>
          </div>
          <h1 className="text-h1 max-md:text-[24px] max-md:leading-8">
            <span className="xl:hidden">Add a property</span>
            <span className="max-xl:hidden">Add property</span>
          </h1>
        </div>
        <Card className="flex w-full max-w-[720px] flex-col gap-4">
          <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase xl:text-label">{type === 'apartment' ? 'A · Apartment' : 'B · Commercial'}</div>
          <div role="radiogroup" aria-label="What kind of property?" className="flex gap-2.5">
            {TILES.map(({ id, label, Icon }) => {
              const on = type === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(id)}
                  className={cn('flex min-h-11 flex-1 cursor-pointer flex-col items-start gap-1 rounded-[10px] p-3 text-control font-semibold text-text', on ? 'border-2 border-primary bg-primary-tint p-[11px]' : 'border border-line-strong bg-surface')}
                >
                  <span className="flex items-center gap-2"><Icon className={cn('size-5', on ? 'text-primary-text' : 'text-muted')} aria-hidden />{label}</span>
                  {on && <span className="text-label font-normal text-on-primary-tint">Selected</span>}
                </button>
              )
            })}
          </div>
          {type === 'apartment' ? aptForm : comForm}
          <p role="status" aria-live="polite" className="flex items-center gap-1.5 text-label text-success-ink empty:hidden">{notice && <><CircleCheck className="size-3.5" aria-hidden />{notice}</>}</p>
        </Card>
        <div className="flex max-w-[720px] justify-between gap-2.5">
          <Button variant="ghost" size="lg" onClick={saveDraft} className="max-md:border-line-strong max-md:bg-surface max-md:text-primary-text">Save draft</Button>
          <Button size="lg" onClick={next} className="px-7">
            <span className="md:hidden">Continue</span>
            <span className="max-md:hidden">Continue to documents</span>
          </Button>
        </div>
      </div>
    </Screen>
  )
}
