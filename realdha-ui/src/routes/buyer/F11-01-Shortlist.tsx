import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { UNITS, inr, unitById } from '../../data/fixtures/f11-buyer'
import { BK } from '../../lib/buyer-store'
import { cn } from '../../lib/cn'
import { UnitStatus } from '../parts/UnitStatus'

const ALL = UNITS.map((u) => u.id)
const DEFAULT_COMPARE = ALL.slice(0, 2)

/** F11-01 · Shortlist. Remove, pick two to compare, open a property. */
export default function Shortlist() {
  const nav = useNavigate()
  const [list, setList] = usePersistentState<string[]>(BK.shortlist, ALL)
  const [sel, setSel] = usePersistentState<string[]>(BK.compare, DEFAULT_COMPARE)
  const items = list.map(unitById).filter((u) => !!u)
  const picked = sel.filter((id) => list.includes(id))

  const toggle = (id: string) => setSel(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked.slice(-1), id])
  const remove = (id: string) => { setList(list.filter((x) => x !== id)); setSel(sel.filter((x) => x !== id)) }
  const go = () => { setSel(picked); nav(path('F11-02')) }
  const ready = picked.length === 2

  return (
    <Screen id="F11-01" back={path('F08-01')} title="Shortlist">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-5 xl:px-12 xl:py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-h1 font-semibold max-xl:text-h2">
            Shortlist · <span className="max-xl:hidden">{items.length} {items.length === 1 ? 'property' : 'properties'}</span><span className="xl:hidden">{items.length}</span>
          </h1>
          <Button className="max-xl:hidden" disabled={!ready} onClick={go}>Compare selected ({picked.length})</Button>
        </div>
        {!ready && items.length > 0 && <p role="status" className="-mt-2 text-small text-muted">Choose two properties with Compare to see them side by side.</p>}

        {items.length === 0 ? (
          <Card className="flex flex-col items-start gap-3">
            <h2 className="text-h3">Nothing shortlisted yet</h2>
            <p className="text-small text-muted">Shortlist properties from Search to compare them here.</p>
            <Button to={path('F08-01')} icon={<Search className="size-4" aria-hidden />}>Search properties</Button>
          </Card>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2 xl:gap-5">
            {items.map((u) => {
              const on = picked.includes(u.id)
              return (
                <Card key={u.id} className={cn('flex flex-col gap-3 p-4 xl:gap-2.5 xl:px-4 xl:py-4', on && 'border-primary')}>
                  <div className="flex items-center justify-between gap-2">
                    <RecordId id={u.id} className="max-xl:w-full" />
                    <span className="text-chip text-muted max-xl:hidden">Added 18 Nov</span>
                  </div>
                  <div className="font-semibold max-xl:text-body">
                    <span className="max-xl:hidden">{u.unit} · {u.bhk} · {u.project}</span>
                    <span className="xl:hidden">{u.bhk}{u.carpet !== 'Not stated' ? ` · ${u.carpet}` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <b className="max-xl:hidden">{inr(u.price)}</b>
                    <span className="text-small text-muted xl:hidden">{u.project} · {u.unit} · {inr(u.price)}</span>
                    <UnitStatus unit={u} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" to={`${path('F09-03')}?unit=${u.id}`} className="max-xl:hidden">Open</Button>
                    <Button variant="secondary" size="sm" aria-pressed={on} onClick={() => toggle(u.id)} className="max-xl:h-11 max-xl:flex-1">{on ? 'Selected' : 'Compare'}</Button>
                    <Button variant="secondary" size="sm" onClick={() => remove(u.id)} className="max-xl:h-11 max-xl:flex-1">Remove</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        {items.length > 0 && <Button size="lg" block className="xl:hidden" disabled={!ready} onClick={go}>Compare selected</Button>}
        <div><SampleData /></div>
      </div>
    </Screen>
  )
}
