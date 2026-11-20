import { Check, Circle, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { RecordId, SampleData } from '../components/ui/record-id'
import { DEFAULT_UNIT, PROJECT_TALLY, UNITS, findUnit, type Unit } from '../data/fixtures/f16-partner'
import { FieldError, Page } from './parts/f-bits'
import { inputCls, mono } from './parts/f-lib'
import { cn } from '../lib/cn'

function StatusPill({ s }: { s: Unit['status'] }) {
  if (s === 'Available') return <Pill tone="success" icon={<Check className="size-3" />}>Available</Pill>
  if (s === 'Booked') return <Pill tone="warning" icon={<Circle className="size-2 fill-current" />}>Booked</Pill>
  return <Pill tone="neutral" icon={<Lock className="size-3" />}>Sold</Pill>
}

/** F16-01 · Live availability by unit ID. Keys: f16.query, f16.unit, f16.checkedAt. */
export default function LiveAvailability() {
  const [query, setQuery] = usePersistentState('f16.query', DEFAULT_UNIT)
  const [unitId, setUnitId] = usePersistentState('f16.unit', DEFAULT_UNIT)
  const [checkedAt, setCheckedAt] = usePersistentState<number | null>('f16.checkedAt', null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const unit = UNITS.find((u) => u.record === unitId) ?? UNITS[0]

  const check = (e?: FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return setError('Enter a unit ID or record ID.')
    const u = findUnit(query)
    if (!u) return setError(`No unit found for ${query.trim()}. Check the ID and try again.`)
    setError('')
    setBusy(true)
    setTimeout(() => { setUnitId(u.record); setQuery(u.record); setCheckedAt(Date.now()); setBusy(false) }, 350)
  }
  const [now] = useState(() => Date.now())
  const updated = checkedAt && now - checkedAt > 60_000 ? new Date(checkedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'just now'
  const priced = unit.status === 'Available'

  return (
    <Screen id="F16-01">
      <Page>
        <h1 className="text-h1">Live availability</h1>
        <p className="text-label text-muted xl:hidden">{PROJECT_TALLY.project} · <SampleData /></p>
        <div className="grid grid-cols-4 gap-2.5 xl:hidden">
          {[['Available', PROJECT_TALLY.available], ['Booked', PROJECT_TALLY.booked], ['Sold', PROJECT_TALLY.sold], ['Updated', PROJECT_TALLY.updated]].map(([k, v]) => (
            <Card key={k} className="flex flex-col gap-0.5 p-2.5"><div className="text-label text-muted">{k}</div><div className="text-h3 tabular">{v}</div></Card>
          ))}
        </div>

        <form onSubmit={check} noValidate className="flex flex-col gap-1">
          <div className="flex gap-3">
            <input aria-label="Unit ID or record ID" aria-invalid={error ? true : undefined} aria-describedby={error ? 'f16-q-err' : undefined} value={query} onChange={(e) => { setQuery(e.target.value); setError('') }} placeholder="RA-PUN-001-A-18-04" className={cn(inputCls, mono, 'flex-1')} />
            <Button type="submit" loading={busy}>Check</Button>
          </div>
          <FieldError id="f16-q-err">{error}</FieldError>
        </form>

        <Card aria-live="polite" className="flex flex-col gap-4 p-6 max-xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><RecordId id={unit.record} /><SampleData /></div>
            <StatusPill s={unit.status} />
          </div>
          <h2 className="text-h2">{unit.unit} · {unit.type} · {unit.project}</h2>
          <dl className="grid grid-cols-4 gap-4">
            {[['Carpet', unit.carpet], ['Facing', unit.facing], ['Price', priced ? unit.price : 'Not shown'], ['Updated', updated]].map(([k, v]) => (
              <div key={k}><dt className="text-label text-muted">{k}</dt><dd className="text-body font-semibold">{v}</dd></div>
            ))}
          </dl>
          <div className="flex gap-3">
            <Button to={priced ? `${path('F16-02')}?unit=${unit.record}` : undefined} disabled={!priced}>Share with client</Button>
            <Button variant="secondary" to={`${path('F16-03')}?unit=${unit.record}`}>Log enquiry</Button>
          </div>
        </Card>

        <ul className="flex flex-col gap-2.5 xl:hidden">
          {UNITS.filter((u) => u.status === 'Available' || u.record === unit.record).map((u) => (
            <li key={u.record}>
              <Card className="flex flex-col gap-1.5 p-3.5">
                <span className={cn(mono, 'text-small')}>{u.unit}</span>
                <div className="text-small font-semibold">{u.type === '—' ? u.project : `${u.type} · ${u.carpet}`}</div>
                {u.status === 'Available' && <div className="text-label text-muted">{u.price}</div>}
                <div><StatusPill s={u.status} /></div>
                {u.status === 'Available' && <Button size="sm" variant="secondary" to={`${path('F16-02')}?unit=${u.record}`} className="min-h-11 self-start">Share</Button>}
              </Card>
            </li>
          ))}
        </ul>
        <p className="text-label text-muted">Booked or Sold units show their status and no price to partners without price access.</p>
      </Page>
    </Screen>
  )
}
