import { Check, Circle } from 'lucide-react'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { Segmented } from '../../components/ui/segmented-control'
import { FILTERS, SEED_CLIENTS, type Client, type ClientFilter, type LeadStatus } from '../../data/fixtures/f16-partner'
import { Page, Resp } from '../parts/f-bits'

function StatusPill({ s }: { s: LeadStatus }) {
  if (s === 'Enquiry sent') return <Pill tone="info" icon={<Circle className="size-2 fill-current" />}>{s}</Pill>
  if (s === 'Call booked') return <Pill tone="warning" icon={<Circle className="size-2 fill-current" />}>{s}</Pill>
  if (s === 'Site visit done') return <Pill tone="success" icon={<Check className="size-3" />}>{s}</Pill>
  return <Pill tone="neutral" icon={<Circle className="size-2" />}>{s}</Pill>
}

/** F16-04 · My clients and leads. Keys: f16.clients, f16.filter. */
export default function ClientsLeads() {
  const [clients] = usePersistentState<Client[]>('f16.clients', SEED_CLIENTS)
  const [filter, setFilter] = usePersistentState<ClientFilter>('f16.filter', 'all')
  const rows = clients.filter((c) => filter === 'all' || (filter !== 'closed' && c.status === filter))
  const empty = <p role="status" className="px-4 py-6 text-small text-muted">Nobody here yet. Log an enquiry to add a client.</p>

  return (
    <Screen id="F16-04" back={path('F16-01')}>
      <Page>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-h1"><Resp d="My clients and leads" m="Clients and leads" /></h1>
          <Button to={path('F16-03')} className="max-xl:hidden">+ Add client</Button>
        </div>
        <Segmented label="Filter by status" value={filter} onChange={setFilter} options={FILTERS} />
        <p className="sr-only" aria-live="polite">{rows.length} shown</p>

        <Card className="overflow-hidden p-0 max-xl:hidden">
          <table className="w-full border-collapse text-small">
            <thead>
              <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                {['Client', 'Phone', 'Unit', 'Status', 'Last activity'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3">{c.phone}</td><td className="px-4 py-3">{c.unit}</td>
                  <td className="px-4 py-3"><StatusPill s={c.status} /></td><td className="px-4 py-3">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && empty}
        </Card>

        <ul className="flex flex-col gap-2.5 xl:hidden">
          {rows.map((c) => (
            <li key={c.id}>
              <Card className="flex flex-col gap-1.5 p-3.5">
                <span className="font-semibold">{c.name}</span>
                <div className="text-small">{c.phone}</div>
                <div className="text-label text-muted">{c.unit} · Last activity {c.last}</div>
                <div><StatusPill s={c.status} /></div>
              </Card>
            </li>
          ))}
        </ul>
        {rows.length === 0 && <div className="xl:hidden">{empty}</div>}
        <Button to={path('F16-03')} className="xl:hidden">+ Add client</Button>
        <p className="text-label text-muted">Sample data.</p>
      </Page>
    </Screen>
  )
}
