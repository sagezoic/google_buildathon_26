import { Check, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import { LAUNCHES, PROFILE_DEFAULT, RECENT, SHORTLIST, type Profile } from '../../data/fixtures/x-flow'

function Tile({ id, title, sub, to, narrow }: { id: string; title: string; sub: string; to: string; narrow?: string }) {
  const nav = useNavigate()
  return (
    <Card className="flex cursor-pointer flex-col gap-2 p-4 hover:bg-primary-tint" onClick={() => nav(to)}>
      <div className="flex items-center justify-between gap-2">
        <RecordId id={id} />
        <Pill tone="success" icon={<Check className="size-3.5" />}>{narrow ? <><span className="xl:hidden">{narrow}</span><span className="max-xl:hidden">Checked</span></> : 'Checked'}</Pill>
      </div>
      <a href={to} onClick={(e) => { e.preventDefault(); e.stopPropagation(); nav(to) }} className="text-body font-semibold text-text no-underline">{title}</a>
      <span className="text-small text-muted">{sub}</span>
    </Card>
  )
}

/** X-01 · Buyer home. Search box saves `x.home.query` and opens the results (F08-02). */
export default function BuyerHome() {
  const nav = useNavigate()
  const [profile] = usePersistentState<Profile>('x.profile', PROFILE_DEFAULT)
  const [query, setQuery] = usePersistentState('x.home.query', '')
  const first = profile.name.trim().split(/\s+/)[0]
  const go = () => nav(`${path('F08-02')}${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  return (
    <Screen id="X-01">
      <div className="flex flex-1 flex-col gap-4 p-4 xl:gap-6 xl:px-12 xl:py-8">
        <h1 className="text-h2 xl:text-h1">
          {profile.saved
            ? <><span className="xl:hidden">Hello, {first}</span><span className="max-xl:hidden">Welcome back, {first}</span></>
            : <><span className="xl:hidden">Hello, Sameer</span><span className="max-xl:hidden">Welcome back, Priya</span></>}
        </h1>
        <form role="search" onSubmit={(e) => { e.preventDefault(); go() }} className="flex gap-4 max-xl:flex-col max-xl:gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted xl:hidden" aria-hidden />
            <input aria-label="Search ID, locality or address" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, locality or address" className="h-control w-full rounded-control border border-line-strong bg-field px-3 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)] max-xl:pl-9 xl:h-12" />
          </div>
          <Button type="submit" className="max-xl:hidden xl:h-12 xl:px-8">Search</Button>
          <Button to={path('F05-01')} block className="h-12 xl:hidden">Check documents before you buy</Button>
        </form>

        <section aria-label="Continue" className="flex flex-col gap-3 xl:hidden">
          <Card className="flex flex-col gap-3 p-4">
            <h2 className="text-h3">Continue</h2>
            <p className="text-small text-muted">Check #CK-2026-0412 · STOP</p>
            <Button to={path('F05-03')} variant="secondary" block className="h-12">Open report</Button>
          </Card>
        </section>

        <div className="grid gap-4 xl:grid-cols-3 xl:gap-5">
          <section aria-labelledby="h-recent" className="flex flex-col gap-3">
            <h2 id="h-recent" className="text-h3 xl:text-h2">Recently viewed</h2>
            {RECENT.map((r, i) => <div key={r.id} className={i > 0 ? 'max-xl:hidden' : undefined}><Tile id={r.id} title={r.title} sub={r.price} to={r.to} narrow={i === 0 ? 'Signed off' : undefined} /></div>)}
          </section>
          <section aria-labelledby="h-short" className="flex flex-col gap-3 max-xl:hidden">
            <h2 id="h-short" className="text-h3 xl:text-h2">Shortlist · 4</h2>
            {SHORTLIST.map((r) => <Tile key={r.id} id={r.id} title={r.title} sub={r.price} to={r.to} />)}
          </section>
          <section aria-labelledby="h-new" className="flex flex-col gap-3 max-xl:hidden">
            <h2 id="h-new" className="text-h3 xl:text-h2">New launches</h2>
            {LAUNCHES.map((r) => <Tile key={r.id} id={r.id} title={r.title} sub={r.sub} to={r.to} />)}
          </section>
          <section aria-labelledby="h-call" className="xl:hidden">
            <Card className="flex flex-col gap-2 p-4"><h2 id="h-call" className="text-h3">Upcoming call</h2><p className="text-small font-medium text-muted">Sat 21 Nov 2026, 10:30</p></Card>
          </section>
        </div>
      </div>
    </Screen>
  )
}
