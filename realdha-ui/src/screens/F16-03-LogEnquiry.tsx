import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Segmented } from '../components/ui/segmented-control'
import { SwitchToggle } from '../components/ui/switch-toggle'
import { RecordId } from '../components/ui/record-id'
import { SEED_CLIENTS, SOURCES, UNITS, findUnit, shortDate, type Client } from '../data/fixtures/f16-partner'
import { formatPhone, phoneError } from '../lib/identity-flow'
import { logAudit } from '../lib/audit'
import { writeShared } from '../lib/shared-state'
import { FieldError, Page, Resp } from './parts/f-bits'
import { inputCls } from './parts/f-lib'

type Source = (typeof SOURCES)[number]
interface Draft { name: string; phone: string; unit: string; source: Source; notes: string; consent: boolean }
const EMPTY: Draft = { name: 'Priya Deshmukh', phone: '98765 43210', unit: 'A-1804', source: 'Phone', notes: 'Wants east-facing, budget up to ₹1.5 Cr.', consent: true }

/** F16-03 · Log an enquiry for a client. Keys: f16.enquiry (draft), f16.clients. */
export default function LogEnquiry() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [d, setD] = usePersistentState<Draft>('f16.enquiry', EMPTY)
  const [errs, setErrs] = useState<Partial<Record<'name' | 'phone' | 'unit' | 'consent', string>>>({})
  const [busy, setBusy] = useState(false)
  const lab = useId()
  const fromUrl = findUnit(params.get('unit') ?? '')
  const unit = findUnit(d.unit) ?? fromUrl ?? UNITS[0]
  // A unit chosen on F16-01 wins over the saved draft.
  useEffect(() => { if (fromUrl && fromUrl.unit !== d.unit) setD((x) => ({ ...x, unit: fromUrl.unit })) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: Partial<Draft>) => { setD({ ...d, ...patch }); setErrs({}) }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const next: typeof errs = {}
    if (!d.name.trim()) next.name = 'Enter the client name.'
    const pe = phoneError(d.phone)
    if (pe) next.phone = pe.replace('your mobile number', 'the client’s mobile number')
    if (!findUnit(d.unit)) next.unit = 'Enter a unit like A-1804.'
    if (!d.consent) next.consent = 'The client must consent to be contacted.'
    setErrs(next)
    if (Object.keys(next).length) return
    setBusy(true)
    setTimeout(() => {
      const ts = Date.now()
      const c: Client = { id: `c${ts}`, name: d.name.trim(), phone: `+91 ${d.phone}`, unit: unit.unit, status: 'Enquiry sent', last: shortDate(ts), note: d.notes.trim(), source: d.source }
      writeShared<Client[]>('f16.clients', (l) => [c, ...l.filter((x) => x.name.toLowerCase() !== c.name.toLowerCase())], SEED_CLIENTS)
      logAudit('Channel partner', `Logged enquiry for ${c.name} on ${unit.unit}`)
      nav(path('F16-04'))
    }, 350)
  }

  const err = (k: keyof typeof errs) => errs[k] ? { 'aria-invalid': true as const, 'aria-describedby': `f16-${k}-err` } : {}

  return (
    <Screen id="F16-03" back={path('F16-02')} title="Enquiry">
      <Page narrow>
        <h1 className="text-h1"><Resp d="Log an enquiry for a client" m="Log an enquiry" /></h1>
        <Card className="p-6 max-xl:border-0 max-xl:bg-transparent max-xl:p-0 max-xl:shadow-none">
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-control bg-sunken px-3 py-2.5 text-small max-xl:hidden">
              <RecordId id={unit.record} /><span>{unit.unit} · {unit.type} · {unit.price}</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <div>
                <label htmlFor="f16-name" className="mb-1.5 block text-chip font-semibold">Client name</label>
                <input id="f16-name" value={d.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" className={inputCls} {...err('name')} />
                <FieldError id="f16-name-err">{errs.name}</FieldError>
              </div>
              <div>
                <label htmlFor="f16-phone" className="mb-1.5 block text-chip font-semibold">Phone</label>
                <div className="flex">
                  <span className="flex h-control items-center rounded-l-control border border-r-0 border-line-strong bg-sunken px-3 text-control text-muted">+91</span>
                  <input id="f16-phone" inputMode="numeric" value={d.phone} onChange={(e) => set({ phone: formatPhone(e.target.value) })} autoComplete="off" className={`${inputCls} rounded-l-none`} {...err('phone')} />
                </div>
                <FieldError id="f16-phone-err">{errs.phone}</FieldError>
              </div>
            </div>
            <div className="xl:hidden">
              <label htmlFor="f16-unit" className="mb-1.5 block text-chip font-semibold">Unit</label>
              <input id="f16-unit" value={d.unit} onChange={(e) => set({ unit: e.target.value })} autoComplete="off" className={inputCls} {...err('unit')} />
              <FieldError id="f16-unit-err">{errs.unit}</FieldError>
            </div>
            <div className="max-xl:hidden">
              <FieldError id="f16-unit-err">{errs.unit}</FieldError>
            </div>
            <div>
              <span className="mb-1.5 block text-chip font-semibold">Source</span>
              <Segmented label="Source" value={d.source} onChange={(source) => set({ source })} options={SOURCES.map((s) => ({ value: s, label: s }))} />
            </div>
            <div>
              <label htmlFor="f16-notes" className="mb-1.5 block text-chip font-semibold">Notes</label>
              <input id="f16-notes" value={d.notes} onChange={(e) => set({ notes: e.target.value })} className={inputCls} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <SwitchToggle labelledBy={lab} checked={d.consent} onChange={(consent) => set({ consent })} />
                <span id={lab} className="text-small">Client has consented to be contacted</span>
              </div>
              <FieldError id="f16-consent-err">{errs.consent}</FieldError>
            </div>
            <div className="flex gap-3 max-xl:flex-col xl:justify-end">
              <Button variant="secondary" to={path('F16-01')} className="max-xl:hidden">Cancel</Button>
              <Button type="submit" loading={busy}><Resp d="Log enquiry" m="Save" /></Button>
            </div>
          </form>
        </Card>
      </Page>
    </Screen>
  )
}
