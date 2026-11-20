import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { SwitchToggle } from '../components/ui/switch-toggle'
import { BOOKING_WINDOWS, CALL_LENGTHS, DEFAULT_AVAIL, type CallAvail } from '../data/fixtures/f16-partner'
import { logAudit } from '../lib/audit'
import { FieldError, Page, Resp } from './parts/f-bits'
import { inputCls } from './parts/f-lib'

/** F16-05 · Call availability settings (ADDED). Keys: f16.availability. */
export default function CallAvailability() {
  const [saved, setSaved] = usePersistentState<CallAvail>('f16.availability', DEFAULT_AVAIL)
  const [d, setD] = useState<CallAvail>(saved)
  const [justSaved, setJustSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const offer = useId()
  const dirty = JSON.stringify(d) !== JSON.stringify(saved)
  const bad = d.hours.findIndex((h) => !h.closed && h.from >= h.to)
  const set = (patch: Partial<CallAvail>) => { setD({ ...d, ...patch }); setJustSaved(false) }
  const setHours = (i: number, patch: Partial<CallAvail['hours'][number]>) => set({ hours: d.hours.map((h, j) => (j === i ? { ...h, ...patch } : h)) })

  const save = () => {
    if (bad >= 0) return
    setBusy(true)
    setTimeout(() => { setSaved(d); logAudit('Channel partner', 'Updated call availability'); setBusy(false); setJustSaved(true) }, 350)
  }
  const cancel = () => { setD(saved); setJustSaved(false) }
  const sel = (id: string, label: string, value: string, opts: string[], onChange: (v: string) => void) => (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1.5 block text-chip font-semibold">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  )

  return (
    <Screen id="F16-05" back={path('F16-04')} title="Calls">
      <Page narrow>
        <Pill tone="info" className="self-start xl:hidden">ADDED</Pill>
        <h1 className="text-h1">Call availability</h1>
        <p className="text-small text-muted"><Resp d="You set how buyers book calls for the properties you handle." m="Buyers see these times when they book." /></p>
        <Card className="flex flex-col gap-4 p-6 max-xl:border-0 max-xl:bg-transparent max-xl:p-0 max-xl:shadow-none">
          <div className="flex gap-3 max-xl:flex-col">
            {sel('f16-len', 'Call length', d.length, CALL_LENGTHS, (length) => set({ length }))}
            {sel('f16-win', 'Booking window', d.window, BOOKING_WINDOWS, (window) => set({ window }))}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-chip font-semibold">Weekly hours</legend>
            {d.hours.map((h, i) => (
              <div key={h.label} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2 last:border-0">
                <span className="min-w-24 text-small">{h.label}</span>
                {h.closed ? <span className="text-small text-muted">Closed</span> : (
                  <span className="flex items-center gap-2 text-small text-muted">
                    <input type="time" aria-label={`${h.label} opens`} value={h.from} onChange={(e) => setHours(i, { from: e.target.value })} className={`${inputCls} w-28`} />to
                    <input type="time" aria-label={`${h.label} closes`} value={h.to} onChange={(e) => setHours(i, { to: e.target.value })} className={`${inputCls} w-28`} />
                  </span>
                )}
                <SwitchToggle label={`${h.label} open`} checked={!h.closed} onChange={(open) => setHours(i, { closed: !open })} />
              </div>
            ))}
            {bad >= 0 && <FieldError id="f16-hours-err">{`${d.hours[bad].label}: closing time must be after opening time.`}</FieldError>}
          </fieldset>
          <div className="flex items-center gap-3">
            <SwitchToggle labelledBy={offer} checked={d.offer} onChange={(o) => set({ offer: o })} />
            <span id={offer} className="text-small">Offer video, phone and site visit</span>
          </div>
          <div className="flex items-center gap-3 max-xl:flex-col-reverse xl:justify-end">
            <p role="status" className="mr-auto flex items-center gap-1.5 text-label text-success-ink max-xl:mr-0">{justSaved && <><Check className="size-3.5" aria-hidden />Availability saved</>}</p>
            <Button variant="secondary" onClick={cancel} disabled={!dirty} className="max-xl:hidden">Cancel</Button>
            <Button onClick={save} loading={busy} disabled={!dirty || bad >= 0} className="max-xl:w-full"><Resp d="Save availability" m="Save" /></Button>
          </div>
        </Card>
        <p className="text-label text-muted max-xl:hidden">ADDED screen. Changes apply to new bookings only.</p>
      </Page>
    </Screen>
  )
}
