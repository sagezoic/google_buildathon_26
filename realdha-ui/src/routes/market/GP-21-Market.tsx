import { lazy, Suspense, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, List, Map as MapIcon, Star } from 'lucide-react'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { cn } from '../../lib/cn'
import {
  cardBadges, fetchCities, formatInr, grossYield, lowestRent,
  type CitySummary, type FlatMode, type FlatSort, type SocietyCard,
} from '../../lib/flats-api'
import { useSocieties } from '../../lib/useSocieties'

const MarketMap = lazy(() => import('../../components/ui/market-map'))
const MAP_LIMIT = 100

const TABS = ['all', 'watchlist'] as const
const TYPES = [['', 'Type: All'], ['apartment', 'Apartment'], ['villa', 'Villa'], ['builder floor', 'Builder floor'], ['plot', 'Plot']] as const
const SORTS: ReadonlyArray<readonly [FlatSort, string]> = [
  ['best', 'Sort: Best match'], ['price', 'Price: low to high'], ['rating', 'Rating'], ['name', 'Name: A to Z'],
]

const PAGE_SIZE = 20
// Max 4 per row: columns are at least 15rem wide and never narrower than a quarter of the row.
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(max(15rem,calc((100%-3rem)/4)),1fr))] gap-4'

/** 1 … 4 5 6 … 12, always keeping first and last. */
function pageList(page: number, pages: number): Array<number | 'gap'> {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const out: Array<number | 'gap'> = []
  let prev = 0
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n - prev > 1) out.push('gap')
    out.push(n)
    prev = n
  }
  return out
}

function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (n: number) => void }) {
  if (pages <= 1) return null
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const btn = 'inline-flex h-control min-w-9 cursor-pointer items-center justify-center rounded-control border border-line-strong px-2.5 text-small text-text hover:border-line-hover disabled:cursor-not-allowed disabled:opacity-40 max-xl:h-11 max-xl:min-w-11'
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p role="status" className="text-small text-muted">Showing {from}–{to} of {total}</p>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li><button type="button" className={btn} disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft aria-hidden className="size-4" /></button></li>
        {pageList(page, pages).map((n, i) => (
          <li key={n === 'gap' ? `gap-${i}` : n}>
            {n === 'gap'
              ? <span aria-hidden className="px-1 text-muted">…</span>
              : <button type="button" className={cn(btn, n === page && 'border-primary bg-primary text-on-primary hover:border-primary')} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`} onClick={() => onPage(n)}>{n}</button>}
          </li>
        ))}
        <li><button type="button" className={btn} disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight aria-hidden className="size-4" /></button></li>
      </ul>
    </nav>
  )
}

const select = 'h-control cursor-pointer rounded-control border border-line-strong bg-field px-2.5 text-small text-text hover:border-line-hover max-xl:h-11 max-xl:px-3 max-xl:text-primary-text'
const PLACEHOLDER = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'

interface Filters { view: 'list' | 'map'; tab: (typeof TABS)[number]; q: string; city: string; type: string; mode: FlatMode; sort: FlatSort }
const INITIAL: Filters = { view: 'list', tab: 'all', q: '', city: 'pune', type: '', mode: 'buy', sort: 'best' }

function Pill({ children, tone }: { children: React.ReactNode; tone: 'brand' | 'ok' | 'dark' }) {
  return (
    <span className={cn(
      'rounded-control px-2 py-0.5 text-[11px] font-semibold text-[#fff]',
      tone === 'brand' && 'bg-primary', tone === 'ok' && 'bg-success', tone === 'dark' && 'bg-[#0B1020]/80',
    )}>{children}</span>
  )
}

function SocietyTile({ s, mode, watched, onToggle }: { s: SocietyCard; mode: FlatMode; watched: boolean; onToggle: () => void }) {
  const photos = (s.images ?? []).map((i) => i.thumb).filter(Boolean).slice(0, 8)
  const imgs = photos.length ? photos : [PLACEHOLDER]
  const [idx, setIdx] = useState(0)
  const step = (d: number) => setIdx((i) => (i + d + imgs.length) % imgs.length)
  const badges = cardBadges(s)
  const y = grossYield(s.prices)
  const rent = lowestRent(s.prices)
  const price = mode === 'rent'
    ? (rent != null ? `from ${formatInr(rent)}/mo` : 'Rent on request')
    : s.price_min != null
      ? (s.price_max && s.price_max !== s.price_min ? `${formatInr(s.price_min)} – ${formatInr(s.price_max)}` : formatInr(s.price_min))
      : 'Price on request'
  // Detail view lives in the marketplace app, which reads ?view=society&society=<id>.
  const href = `/marketplace?view=society&society=${encodeURIComponent(s.id)}`

  return (
    <li>
      <article className="relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-e1 hover:border-line-hover has-[a.card-link:focus-visible]:outline-2 has-[a.card-link:focus-visible]:outline-offset-2 has-[a.card-link:focus-visible]:outline-focus">
        <div className="group/media relative">
          <img src={imgs[idx]} alt="" loading="lazy" decoding="async" className="block aspect-[16/10] w-full bg-sunken object-cover" />
          {imgs.length > 1 && (
            <>
              {([['Previous', -1, 'left-2', ChevronLeft], ['Next', 1, 'right-2', ChevronRight]] as const).map(([label, d, side, Icon]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`${label} photo of ${s.name}`}
                  onClick={() => step(d)}
                  className={cn(
                    'absolute top-1/2 z-10 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#fff] text-[#0B1020] shadow-e1 transition-opacity hover:bg-[#f1f5f9] focus-visible:opacity-100 group-hover/media:opacity-100 [@media(hover:none)]:opacity-100 opacity-0',
                    side,
                  )}
                >
                  <Icon aria-hidden strokeWidth={2.5} className="size-4" />
                </button>
              ))}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
                {imgs.map((_, i) => <span key={i} className={cn('size-1.5 rounded-full', i === idx ? 'bg-[#fff]' : 'bg-[#fff]/50')} />)}
              </div>
              <span role="status" className="sr-only">Photo {idx + 1} of {imgs.length}</span>
            </>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap gap-1 pr-11">
          {badges.map((b, i) => (
            <Pill key={b} tone={i === 0 ? 'brand' : i === 1 && s.status?.toLowerCase().includes('ready') ? 'ok' : 'dark'}>{b}</Pill>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={watched}
          aria-label={watched ? `Remove ${s.name} from watchlist` : `Add ${s.name} to watchlist`}
          onClick={onToggle}
          className={cn('absolute right-2 top-2 z-10 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#0B1020]/70 text-[#fff] hover:bg-[#0B1020]/90', watched && 'text-warning-ink')}
        >
          <Star aria-hidden className={cn('size-4', watched && 'fill-current')} />
        </button>
        <h3 className="mx-3.5 mt-3 truncate text-control font-semibold">
          <a href={href} className="card-link text-text no-underline outline-none after:absolute after:inset-0 after:content-['']">{s.name}</a>
        </h3>
        <div className="mx-3.5 mt-1 flex flex-col gap-1 pb-3.5">
          <p className="truncate text-label text-muted">{[s.locality, s.pincode ? `Pune ${s.pincode}` : 'Pune'].filter(Boolean).join(', ')}</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-small">
            <b className="tabular">{price}</b>
            {mode === 'buy' && s.psf_now != null && <span className="tabular text-muted">· {formatInr(s.psf_now)}/sqft</span>}
            {y != null && <span className="tabular text-brand" title="Gross yield: annual median rent / median price">· {y.toFixed(1)}% gross yield</span>}
            {s.score != null && <span className="tabular font-semibold text-success-ink" title="Flat Finder score">· {s.score.toFixed(1)}/10</span>}
          </p>
          <p className="flex items-center gap-1 text-chip text-muted">
            <Star aria-hidden className="size-3.5" />
            {s.rating != null ? `${s.rating.toFixed(1)} · ` : ''}{s.review_count ?? 0} {s.review_count === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </article>
    </li>
  )
}

/** GP-21 · Market. Societies from the Flat Finder API (/api/flats). View only. */
export default function Market() {
  const [f, setF] = usePersistentState<Filters>('market.filters.v3', INITIAL)
  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist.v2', [])
  const [cities, setCities] = useState<CitySummary[]>([])
  const { view, tab, q, city, type, mode, sort } = f
  const isMap = view === 'map'
  const [page, setPage] = useState(1)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => { setPage(1); setF((x) => ({ ...x, [k]: v })) }
  const toggle = (id: string) => setWatch((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))

  useEffect(() => {
    const c = new AbortController()
    fetchCities(c.signal).then((l) => setCities(l.filter((x) => x.societies_count > 0))).catch(() => {})
    return () => c.abort()
  }, [])

  // All tab: server-side pages of 20. Watchlist: fetch the whole result (API max 100) and page it here.
  const isWatch = tab === 'watchlist'
  const { data, loading, error, retry } = useSocieties({
    city, q: q.trim() || undefined, mode, kind: type || undefined, sort,
    limit: isWatch || isMap ? MAP_LIMIT : PAGE_SIZE, offset: isWatch || isMap ? 0 : (page - 1) * PAGE_SIZE,
  })
  const fetched = data?.societies ?? []
  const watched = isWatch ? fetched.filter((s) => watch.includes(s.id)) : fetched
  const total = isWatch ? watched.length : data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(page, pages)
  const mapRows = isWatch ? watched : fetched
  const cityConf = cities.find((c) => c.slug === city)
  const rows = isWatch ? watched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) : fetched
  const goToPage = (n: number) => {
    setPage(n)
    document.getElementById('main')?.scrollIntoView({ block: 'start' })
  }

  const tabCls = (on: boolean) => cn('-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 text-small', on ? 'border-primary font-semibold text-brand' : 'border-transparent text-text hover:text-brand')

  return (
    <Screen id="GP-21">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-h1">Market</h1>
          <div className="flex flex-wrap gap-2.5">
            <input aria-label="Search society, developer or locality" placeholder="Search society or locality" value={q} onChange={(e) => set('q', e.target.value)} className="h-control w-60 rounded-control border border-line-strong bg-field px-3 text-control outline-none placeholder:text-muted focus:border-focus max-xl:h-11 max-xl:w-full" />
            <select aria-label="City" value={city} onChange={(e) => set('city', e.target.value)} className={select}>
              {(cities.length ? cities : [{ slug: 'pune', name: 'Pune', societies_count: 0 }]).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <select aria-label="Type" value={type} onChange={(e) => set('type', e.target.value)} className={select}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select aria-label="Buy or rent" value={mode} onChange={(e) => set('mode', e.target.value as FlatMode)} className={select}>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <button type="button" aria-pressed={isMap} onClick={() => set('view', isMap ? 'list' : 'map')} className={cn(select, 'inline-flex items-center gap-1.5', isMap && 'border-primary bg-primary text-on-primary max-xl:text-on-primary')}>
              {isMap ? <List aria-hidden className="size-4" /> : <MapIcon aria-hidden className="size-4" />}
              {isMap ? 'List view' : 'Map view'}
            </button>
            <select aria-label="Sort" value={sort} onChange={(e) => set('sort', e.target.value as FlatSort)} className={select}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div role="tablist" aria-label="Market view" className="flex border-b border-line">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => set('tab', t)} className={tabCls(tab === t)}>
              {t === 'all' ? `All · ${data?.total ?? '–'}` : `Watchlist · ${watch.length}`}
            </button>
          ))}
        </div>

        {error ? (
          <div role="alert" className="flex flex-col items-start gap-2 rounded-card border border-line bg-surface p-4 text-small">
            <span>Could not load homes: {error}</span>
            <button type="button" onClick={retry} className="cursor-pointer rounded-control border border-line-strong px-3 py-1.5 hover:border-line-hover">Try again</button>
          </div>
        ) : loading && !data ? (
          <ul aria-busy="true" className={GRID}>
            {Array.from({ length: 8 }, (_, i) => <li key={i} className="aspect-[3/4] animate-pulse rounded-card border border-line bg-surface" />)}
          </ul>
        ) : isMap ? (
          <>
            <Suspense fallback={<div aria-busy="true" className="h-[70vh] min-h-96 animate-pulse rounded-card border border-line bg-surface" />}>
              <MarketMap societies={mapRows} mode={mode} center={cityConf?.center} zoom={cityConf?.zoom} onUnavailable={() => set('view', 'list')} />
            </Suspense>
            {!isWatch && (data?.total ?? 0) > MAP_LIMIT && <p role="status" className="text-small text-muted">Showing the first {MAP_LIMIT} of {data?.total}. Refine the filters to narrow the map.</p>}
          </>
        ) : rows.length === 0 ? (
          <p role="status" className="text-small text-muted">
            {tab === 'watchlist' && !q && !type ? 'Your watchlist is empty. Use the star on a card to add one.' : 'Nothing matches these filters.'}
          </p>
        ) : (
          <ul aria-busy={loading} className={GRID}>
            {rows.map((s) => <SocietyTile key={s.id} s={s} mode={mode} watched={watch.includes(s.id)} onToggle={() => toggle(s.id)} />)}
          </ul>
        )}

        {!isMap && <Pager page={current} pages={pages} total={total} onPage={goToPage} />}

        <p className="text-label text-muted">
          View only. Prices come from scraped Magicbricks listings and are not live. Yield is an estimate from median rent and price.
        </p>
      </div>
    </Screen>
  )
}
