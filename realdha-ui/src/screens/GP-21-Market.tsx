import { Star } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Delta, Sparkline } from '../components/ui/market'
import { Card } from '../components/ui/card'
import { RecordId, SampleData } from '../components/ui/record-id'
import { cn } from '../lib/cn'
import {
  CITIES, GAINERS, LOSERS, MOBILE_GAINERS, MOBILE_LOSERS, MOBILE_TICKERS, TICKERS, TYPES,
  WATCHLIST_IDS,
} from '../data/fixtures/market'

const TABS = ['all', 'watchlist'] as const

const select = 'h-control cursor-pointer rounded-control border border-line-strong bg-field px-2.5 text-small text-text hover:border-line-hover max-xl:h-11 max-xl:px-3 max-xl:text-primary-text'

function MoverList({ title, tone, rows }: { title: string; tone: 'up' | 'down'; rows: { name: string; pct: number }[] }) {
  return (
    <Card className="flex-1 overflow-hidden p-0">
      <div className={cn('border-b border-line bg-sunken px-4 py-2.5 text-chip font-semibold', tone === 'up' ? 'text-success-ink' : 'text-danger-ink')}>
        <span aria-hidden>{tone === 'up' ? '▲' : '▼'}</span> {title}
      </div>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center justify-between border-b border-line px-4 py-2 text-small last:border-0">
          <span>{r.name}</span>
          <Delta pct={r.pct} />
        </div>
      ))}
    </Card>
  )
}

/** GP-21 · Market. 1440: full grid with movers and sparklines. 834 / 390: compact grid. View only. */
const SORTS = [
  ['default', 'Sort: Default'], ['price-desc', 'Price: high to low'], ['price-asc', 'Price: low to high'],
  ['change-desc', 'Change: high to low'], ['change-asc', 'Change: low to high'], ['name', 'Name: A to Z'],
] as const
type Sort = (typeof SORTS)[number][0]
interface Filters { tab: (typeof TABS)[number]; q: string; city: string; type: string; sort: Sort }
const INITIAL: Filters = { tab: 'all', q: '', city: '', type: '', sort: 'default' }

function sorter<T extends { name: string; pct: number }>(sort: Sort, priceOf: (t: T) => number) {
  const by: Record<Sort, (a: T, b: T) => number> = {
    default: () => 0,
    'price-desc': (a, b) => priceOf(b) - priceOf(a),
    'price-asc': (a, b) => priceOf(a) - priceOf(b),
    'change-desc': (a, b) => b.pct - a.pct,
    'change-asc': (a, b) => a.pct - b.pct,
    name: (a, b) => a.name.localeCompare(b.name),
  }
  return by[sort]
}
const num = (p: string) => parseFloat(p.replace(/,/g, ''))

function WatchStar({ on, name, onToggle, className }: { on: boolean; name: string; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
      onClick={onToggle}
      className={cn('absolute inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:text-brand max-xl:right-0 max-xl:top-0 xl:size-8 xl:right-2 xl:top-2', on && 'text-warning-ink', className)}
    >
      <Star aria-hidden className={cn('size-4', on && 'fill-current')} />
    </button>
  )
}

/** GP-21 · Market. 1440: full grid with movers and sparklines. 834 / 390: compact grid. View only. */
export default function Market() {
  const [params, setParams] = useSearchParams()
  const [f, setF] = usePersistentState<Filters>('market.filters', INITIAL)
  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist', WATCHLIST_IDS)
  const forcedTab = params.get('state')
  const tab = forcedTab === 'all' || forcedTab === 'watchlist' ? forcedTab : f.tab
  const { q, city, type, sort } = f
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((x) => ({ ...x, [k]: v }))
  const setTab = (t: Filters['tab']) => { set('tab', t); if (forcedTab) setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true }) }
  const toggle = (id: string) => setWatch((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))
  const watchedMobile = (id: string) => watch.some((w) => w.startsWith(id))

  const match = (meta: string, name: string, id: string) =>
    (!city || meta.startsWith(city)) && (!type || meta.endsWith(type)) &&
    (!q || (name + id).toLowerCase().includes(q.toLowerCase()))
  const rows = TICKERS.filter((t) => (tab === 'all' || watch.includes(t.id)) && match(t.meta, t.name, t.id)).sort(sorter(sort, (t) => num(t.price)))
  // The 390 frame has no city / type on each card, so filters apply to the matching 1440 row.
  const mrows = MOBILE_TICKERS.filter((t) => {
    if (tab === 'watchlist' && !watchedMobile(t.id)) return false
    const full = TICKERS.find((x) => x.id.startsWith(t.id))
    return match(full?.meta ?? '', t.name, t.id)
  }).sort(sorter(sort, (t) => num(t.price)))
  const detail = (id: string) => `${path('GP-22')}?id=${id}`

  const FILTERS = (
    <>
      <select aria-label="City" value={city} onChange={(e) => set('city', e.target.value)} className={select}>
        <option value="">City: All</option>
        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select aria-label="Type" value={type} onChange={(e) => set('type', e.target.value)} className={select}>
        <option value="">Type: All</option>
        {TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select aria-label="Sort" value={sort} onChange={(e) => set('sort', e.target.value as Sort)} className={select}>
        {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </>
  )

  const tabCls = (on: boolean) => cn('inline-flex cursor-pointer items-center px-4 py-2.5 text-small font-medium', on ? 'bg-primary text-on-primary' : 'bg-surface text-text hover:bg-primary-tint')

  return (
    <Screen id="GP-21">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        <div className="flex items-center justify-between gap-3 rounded-control border border-demo-line bg-demo p-2.5 text-demo-ink xl:rounded-[10px] xl:border-2 xl:px-5 xl:py-3">
          <div className="text-chip font-semibold xl:text-body xl:font-bold xl:tracking-[0.04em]">
            <span className="xl:hidden">Sample data. View only.</span>
          </div>
          <div className="flex items-center gap-3 text-chip text-text max-xl:hidden">
            View only. No buying or selling happens here.<SampleData />
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-h1">Market</h1>
          <div className="flex flex-wrap gap-2.5 max-xl:hidden">
            <input aria-label="Search name or record ID" placeholder="Search name or record ID" value={q} onChange={(e) => set('q', e.target.value)} className="h-control w-60 rounded-control border border-line-strong bg-field px-3 text-control outline-none placeholder:text-muted focus:border-focus" />
            {FILTERS}
          </div>
        </div>

        <div role="tablist" aria-label="Market view" className="inline-flex self-start overflow-hidden rounded-control border border-line-strong xl:hidden">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn(tabCls(tab === t), 'min-h-11 capitalize')}>{t}</button>
          ))}
        </div>
        <div role="tablist" aria-label="Market view" className="flex border-b border-line max-xl:hidden">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 text-small', tab === t ? 'border-primary font-semibold text-brand' : 'border-transparent text-text hover:text-brand')}>
              {t === 'all' ? `All · ${TICKERS.length}` : `Watchlist · ${watch.length}`}
            </button>
          ))}
        </div>
        <input aria-label="Search name or record ID" placeholder="Search name or record ID" value={q} onChange={(e) => set('q', e.target.value)} className="h-11 rounded-control border border-line-strong bg-field px-3 text-control outline-none placeholder:text-muted focus:border-focus xl:hidden" />
        <div className="flex flex-wrap gap-2.5 xl:hidden">{FILTERS}</div>

        {/* 1440 movers */}
        <div className="flex gap-4 max-xl:hidden">
          <MoverList title="Top gainers" tone="up" rows={GAINERS} />
          <MoverList title="Top losers" tone="down" rows={LOSERS} />
        </div>
        {/* 834 / 390 movers */}
        {([['Top gainers', MOBILE_GAINERS], ['Top losers', MOBILE_LOSERS]] as const).map(([title, list]) => (
          <div key={title} className="flex flex-col gap-2 xl:hidden">
            <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase">{title}</div>
            <ul className="flex gap-2.5 overflow-x-auto">
              {list.map((m) => (
                <li key={m.name} className="flex min-w-[150px] flex-col rounded-card border border-line bg-surface p-2.5 shadow-e1">
                  <b className="text-chip">{m.name}</b>
                  <Delta pct={m.pct} digits={1} className="text-chip" />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* 1440 grid */}
        <ul className="grid grid-cols-4 gap-4 max-xl:hidden">
          {rows.map((t) => (
            <li key={t.id} className="relative">
              <WatchStar on={watch.includes(t.id)} name={t.name} onToggle={() => toggle(t.id)} />
              <Link to={detail(t.id)} className="flex h-full flex-col gap-1 rounded-card border border-line bg-surface p-4 text-text no-underline shadow-e1 hover:border-line-hover">
                <div className="flex items-center justify-between">
                  <RecordId id={t.id} className="px-1.5 py-0 text-[11px]" />
                  <span className="mr-7 text-overline text-muted">Sample</span>
                </div>
                <div className="text-control font-semibold">{t.name}</div>
                <div className="text-label text-muted">{t.meta}</div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-h3 tabular">₹ {t.price}</div>
                    <Delta pct={t.pct} className="text-chip" />
                  </div>
                  <Sparkline values={t.spark} pct={t.pct} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {/* 834 / 390 grid */}
        <ul className="grid grid-cols-2 gap-2.5 xl:hidden">
          {mrows.map((t) => (
            <li key={t.id} className="relative">
              <WatchStar on={watchedMobile(t.id)} name={t.name} onToggle={() => toggle(TICKERS.find((x) => x.id.startsWith(t.id))?.id ?? t.id)} />
              <Link to={detail(TICKERS.find((x) => x.id.startsWith(t.id))?.id ?? t.id)} className="flex h-full min-h-11 flex-col gap-1.5 rounded-card border border-line bg-surface p-3 text-text no-underline shadow-e1">
                <span className="mr-9 truncate rounded-control border border-line bg-sunken px-1.5 py-0.5 font-mono text-[10px] font-medium">{t.id}</span>
                <span className="text-small font-semibold">{t.name}</span>
                <span className="text-body font-semibold tabular">₹{t.price}</span>
                <span className="flex items-center justify-between">
                  <Delta pct={t.pct} digits={1} className="text-chip" />
                  <Sparkline values={TICKERS.find((x) => x.id.startsWith(t.id))?.spark ?? []} pct={t.pct} className="h-6 w-16" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {(rows.length === 0 || mrows.length === 0) && (
          <p role="status" className={cn('text-small text-muted', rows.length > 0 && 'xl:hidden', mrows.length > 0 && 'max-xl:hidden')}>{tab === 'watchlist' && !q && !city && !type ? 'Your watchlist is empty. Use the star on a card to add one.' : 'Nothing matches these filters.'}</p>
        )}

        <p className="text-label text-muted">
          <span className="xl:hidden">View only. No buying or selling.</span>
          <span className="max-xl:hidden">Sample data, refreshed for the demo. Prices are not live and nothing on this page can be bought or sold.</span>
        </p>
      </div>
    </Screen>
  )
}
