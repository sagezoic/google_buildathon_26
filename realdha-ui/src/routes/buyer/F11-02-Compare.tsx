import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Modal } from '../../components/ui/modal'
import { SampleData } from '../../components/ui/record-id'
import { UNITS, inr, unitById, type Unit } from '../../data/fixtures/f11-buyer'
import { BK } from '../../lib/buyer-store'
import { UnitExtra, UnitStatus } from '../parts/UnitStatus'

const ALL = UNITS.map((u) => u.id)

const ROWS: { label: string; cell: (u: Unit, other: Unit) => React.ReactNode }[] = [
  { label: 'Floor', cell: (u) => u.floor },
  { label: 'View', cell: (u) => u.view },
  { label: 'Sunlight', cell: (u) => u.sunlight },
  { label: 'Carpet area', cell: (u) => u.carpet },
  { label: 'Price', cell: (u, o) => (u.price < o.price ? `${inr(u.price)} (${inr(o.price - u.price)} less)` : inr(u.price)) },
  { label: 'Documents status', cell: (u) => <span className="flex flex-wrap gap-1.5"><UnitStatus unit={u} /><UnitExtra unit={u} /></span> },
]

/** F11-02 · Compare two shortlisted units. Differences are written out in each cell. */
export default function Compare() {
  const [list, setList] = usePersistentState<string[]>(BK.shortlist, ALL)
  const [sel, setSel] = usePersistentState<string[]>(BK.compare, ALL.slice(0, 2))
  const [adding, setAdding] = useState(false)
  const units = sel.map(unitById).filter((u): u is Unit => !!u)
  const [a, b] = units
  const both = !!a && !!b
  const shortlisted = both && list.includes(a.id) && list.includes(b.id)
  const candidates = UNITS.filter((u) => list.includes(u.id) && !sel.includes(u.id))

  return (
    <Screen id="F11-02" back={path('F11-01')} title="Compare">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-5 xl:px-12 xl:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-label font-semibold tracking-[0.04em] text-muted uppercase max-xl:hidden">Compare · Priya (sample)</div>
            <h1 className="text-h1 font-semibold max-xl:text-h2">{both ? <span className="max-xl:hidden">{a.unit} vs {b.unit}</span> : null}<span className={both ? 'xl:hidden' : ''}>Compare</span></h1>
          </div>
          <div className="flex gap-2.5 max-xl:hidden">
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden />} onClick={() => setAdding(true)} disabled={candidates.length === 0}>Add a property</Button>
            <Button variant="secondary" disabled={!both || shortlisted} icon={shortlisted ? <Check className="size-4" aria-hidden /> : undefined} onClick={() => setList((l) => [...new Set([...l, a.id, b.id])])}>{shortlisted ? 'Both shortlisted' : 'Shortlist both'}</Button>
          </div>
        </div>

        {!both ? (
          <Card className="flex flex-col items-start gap-3">
            <h2 className="text-h3">Choose two properties to compare</h2>
            <p className="text-small text-muted">Pick them with Compare on your shortlist.</p>
            <Button to={path('F11-01')}>Go to shortlist</Button>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden p-0" role="table" aria-label={`${a.unit} compared with ${b.unit}`}>
              <div role="row" className="grid grid-cols-[88px_1fr_1fr] border-b border-line bg-sunken px-4 py-2.5 text-label font-semibold text-muted xl:grid-cols-[300px_1fr_1fr]">
                <span role="columnheader" className="sr-only">Attribute</span><span aria-hidden />
                <span role="columnheader">{a.unit}</span><span role="columnheader">{b.unit}</span>
              </div>
              {ROWS.map((r) => (
                <div role="row" key={r.label} className="grid grid-cols-[88px_1fr_1fr] items-center gap-x-2 border-b border-line px-4 py-3.5 text-small last:border-0 max-xl:text-chip xl:grid-cols-[300px_1fr_1fr] xl:py-3.5">
                  <span role="rowheader" className="font-semibold max-xl:font-normal max-xl:text-muted">{r.label}</span>
                  <span role="cell" className="max-xl:font-semibold">{r.cell(a, b)}</span>
                  <span role="cell" className="max-xl:font-semibold">{r.cell(b, a)}</span>
                </div>
              ))}
            </Card>
            <div className="flex flex-col gap-2.5 xl:flex-row">
              <Button size="lg" to={`${path('F12-01')}?unit=${a.id}`} className="xl:h-control">Enquire about {a.unit}</Button>
              <Button size="lg" variant="secondary" to={`${path('F12-01')}?unit=${b.id}`} className="xl:h-control">Enquire about {b.unit}</Button>
              <Button size="lg" variant="secondary" to={path('F11-03')} className="xl:hidden">Ask AI about these</Button>
              <div className="flex gap-2.5 xl:hidden">
                <Button variant="ghost" className="max-xl:h-11 flex-1" onClick={() => setAdding(true)} disabled={candidates.length === 0}>Add a property</Button>
                <Button variant="ghost" className="max-xl:h-11 flex-1" disabled={shortlisted} onClick={() => setList((l) => [...new Set([...l, a.id, b.id])])}>{shortlisted ? 'Both shortlisted' : 'Shortlist both'}</Button>
              </div>
            </div>
          </>
        )}
        <p className="text-chip font-medium text-muted"><span className="max-xl:hidden">Differences are written out, not only highlighted. </span><span className="xl:hidden">*Indicative, set by owner. </span><SampleData className="align-middle" /></p>
      </div>

      <Modal open={adding} onOpenChange={setAdding} title="Add a property">
        {both && <p className="text-small text-muted">It replaces {b.unit} in the comparison.</p>}
        <ul className="flex flex-col gap-2">
          {candidates.map((u) => (
            <li key={u.id}>
              <button type="button" onClick={() => { setSel([sel[0], u.id]); setAdding(false) }} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-control border border-line-strong bg-surface px-3 py-2 text-left text-small hover:bg-primary-tint">
                <span className="font-medium">{u.unit} · {u.bhk} · {u.project}</span><span className="text-muted">{inr(u.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </Screen>
  )
}
