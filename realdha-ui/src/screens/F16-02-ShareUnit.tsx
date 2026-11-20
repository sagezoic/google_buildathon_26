import { X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Segmented } from '../components/ui/segmented-control'
import { SwitchToggle } from '../components/ui/switch-toggle'
import { RecordId } from '../components/ui/record-id'
import { CHANNELS, DEFAULT_UNIT, SEED_CLIENTS, UNITS, shortDate, type Client } from '../data/fixtures/f16-partner'
import { logAudit } from '../lib/audit'
import { writeShared } from '../lib/shared-state'
import { FieldError, Page, Resp } from './parts/f-bits'
import { inputCls } from './parts/f-lib'
import { cn } from '../lib/cn'

type Channel = (typeof CHANNELS)[number]
interface ShareDraft { client: string; via: Channel; price: boolean }
const split = (s: string) => { const [n, ...p] = s.split(' · '); return { name: n.trim(), phone: p.join(' · ').trim() } }

/** F16-02 · Share a unit with a client. Keys: f16.share (draft), f16.clients, f16.shares. */
export default function ShareUnit() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const unit = UNITS.find((u) => u.record === params.get('unit')) ?? UNITS.find((u) => u.record === DEFAULT_UNIT)!
  const [d, setD] = usePersistentState<ShareDraft>('f16.share', { client: 'Priya Deshmukh · +91 98765 43210', via: 'WhatsApp', price: true })
  const [clients] = usePersistentState<Client[]>('f16.clients', SEED_CLIENTS)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useId()
  const lab = useId()

  const send = (e?: FormEvent) => {
    e?.preventDefault()
    const { name, phone } = split(d.client)
    if (!name) return setError('Choose or enter a client.')
    setError('')
    const link = `https://realdha.example/u/${unit.record}${d.price ? '' : '?price=hidden'}`
    if (d.via === 'Copy link') void navigator.clipboard?.writeText(link)
    setBusy(true)
    setTimeout(() => {
      const ts = Date.now()
      writeShared<Client[]>('f16.clients', (list) => {
        const i = list.findIndex((c) => c.name.toLowerCase() === name.toLowerCase())
        if (i >= 0) return list.map((c, j) => (j === i ? { ...c, unit: unit.unit, status: 'Enquiry sent', last: shortDate(ts) } : c))
        return [{ id: `c${ts}`, name, phone: phone || '—', unit: unit.unit, status: 'Enquiry sent', last: shortDate(ts) }, ...list]
      }, SEED_CLIENTS)
      writeShared<{ unit: string; client: string; via: string; price: boolean; ts: number }[]>('f16.shares', (s) => [{ unit: unit.record, client: name, via: d.via, price: d.price, ts }, ...s].slice(0, 50), [])
      logAudit('Channel partner', `Shared ${unit.unit} with ${name} via ${d.via}`)
      nav(path('F16-04'))
    }, 350)
  }

  return (
    <Screen id="F16-02" back={path('F16-01')} title="Share">
      <Page narrow>
        <Card className="flex flex-col gap-4 p-6 max-xl:border-0 max-xl:bg-transparent max-xl:p-0 max-xl:shadow-none">
          <form onSubmit={send} noValidate className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-h2"><Resp d={`Share ${unit.unit} with a client`} m="Share with a client" /></h1>
              <Button variant="secondary" size="sm" to={path('F16-01')} aria-label="Close" className="size-9 px-0 max-xl:hidden"><X className="size-4" aria-hidden /></Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-control bg-sunken px-3 py-2.5 text-small">
              <RecordId id={unit.record} />
              <span><span className="xl:hidden">{unit.unit} · {unit.type}</span><span className="max-xl:hidden">{unit.unit} · {unit.type} · {unit.price}</span></span>
            </div>
            <div>
              <label htmlFor="f16-client" className="mb-1.5 block text-chip font-semibold">Client</label>
              <input id="f16-client" list={list} value={d.client} onChange={(e) => { setD({ ...d, client: e.target.value }); setError('') }} aria-invalid={error ? true : undefined} aria-describedby={error ? 'f16-client-err' : undefined} autoComplete="off" className={inputCls} />
              <datalist id={list}>{clients.map((c) => <option key={c.id} value={`${c.name} · ${c.phone}`} />)}</datalist>
              <FieldError id="f16-client-err">{error}</FieldError>
            </div>
            <div>
              <span className="mb-1.5 block text-chip font-semibold">Send via</span>
              <Segmented label="Send via" value={d.via} onChange={(via) => setD({ ...d, via })} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div><b id={lab} className="text-small font-semibold">Include price</b><div className="text-label text-muted max-xl:hidden">Link expires in 7 days</div></div>
              <SwitchToggle labelledBy={lab} checked={d.price} onChange={(price) => setD({ ...d, price })} />
            </div>
            <div className={cn('flex gap-3 xl:justify-end', 'max-xl:flex-col')}>
              <Button variant="secondary" to={path('F16-01')} className="max-xl:hidden">Cancel</Button>
              <Button type="submit" loading={busy}><Resp d="Send" m="Send link" /></Button>
            </div>
          </form>
        </Card>
      </Page>
    </Screen>
  )
}
