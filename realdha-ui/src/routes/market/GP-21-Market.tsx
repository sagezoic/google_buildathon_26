import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon, RotateCcw, Search, Star, X } from 'lucide-react'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { cn } from '../../lib/cn'
import MarketMap from '../../components/ui/market-map'
import {
  cardBadges,
  fetchCities,
  formatInr,
  grossYield,
  lowestRent,
  type CitySummary,
  type FlatMode,
  type FlatSort,
  type SocietyCard,
} from '../../lib/flats-api'
import { useSocieties } from '../../lib/useSocieties'

const TYPES = [
  ['', 'All types'],
  ['apartment', 'Apartment'],
  ['villa', 'Villa'],
  ['builder floor', 'Builder floor'],
  ['plot', 'Plot'],
] as const

const SORTS: ReadonlyArray<readonly [FlatSort, string]> = [
  ['best', 'Best match'],
  ['price', 'Price: low to high'],
  ['rating', 'Highest rating'],
  ['name', 'Name: A to Z'],
]

const BHK_OPTIONS = [
  { value: 0, label: 'All BHK' },
  { value: 1, label: '1 BHK' },
  { value: 2, label: '2 BHK' },
  { value: 3, label: '3 BHK' },
  { value: 4, label: '4+ BHK' },
] as const

const PAGE_SIZE = 20
const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
const PLACEHOLDER = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'

function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number
  pages: number
  total: number
  onPage: (n: number) => void
}) {
  if (pages <= 1) return null
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const btn =
    'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-control border border-line bg-surface px-2.5 text-small text-text transition-colors hover:border-line-hover disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p role="status" className="text-small text-muted">
        Showing <span className="font-semibold text-text tabular">{from}–{to}</span> of{' '}
        <span className="font-semibold text-text tabular">{total.toLocaleString('en-IN')}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={btn}
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <span className="px-2 text-small text-muted tabular">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page === pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </nav>
  )
}

function SocietyTile({
  s,
  mode,
  watched,
  onToggle,
}: {
  s: SocietyCard
  mode: FlatMode
  watched: boolean
  onToggle: () => void
}) {
  const photos = (s.images ?? []).map((i) => i.thumb).filter(Boolean).slice(0, 6)
  const imgs = photos.length ? photos : [PLACEHOLDER]
  const [idx, setIdx] = useState(0)
  const step = (d: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i + d + imgs.length) % imgs.length)
  }

  const badges = cardBadges(s)
  const primaryBadge = badges[0]
  const isReady = s.status?.toLowerCase().includes('ready')
  const y = grossYield(s.prices)
  const rent = lowestRent(s.prices)
  const price =
    mode === 'rent'
      ? rent != null
        ? `from ${formatInr(rent)}/mo`
        : 'Rent on request'
      : s.price_min != null
        ? s.price_max && s.price_max !== s.price_min
          ? `${formatInr(s.price_min)} – ${formatInr(s.price_max)}`
          : formatInr(s.price_min)
        : 'Price on request'

  const href = path('GP-22', { id: s.id })

  return (
    <li>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
          <img
            src={imgs[idx]}
            alt={s.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {imgs.length > 1 && (
            <div className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                aria-label={`Previous photo of ${s.name}`}
                onClick={(e) => step(-1, e)}
                className="pointer-events-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-text shadow-e1 backdrop-blur-xs hover:bg-surface"
              >
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Next photo of ${s.name}`}
                onClick={(e) => step(1, e)}
                className="pointer-events-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-text shadow-e1 backdrop-blur-xs hover:bg-surface"
              >
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5">
            {primaryBadge ? (
              <Pill tone={isReady ? 'success' : 'brand'}>
                {primaryBadge}
              </Pill>
            ) : <span />}
            <button
              type="button"
              aria-pressed={watched}
              aria-label={watched ? `Remove ${s.name} from watchlist` : `Add ${s.name} to watchlist`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggle()
              }}
              className={cn(
                'pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/90 shadow-e1 backdrop-blur-xs transition-colors hover:bg-surface',
                watched ? 'text-warning-ink' : 'text-muted hover:text-text',
              )}
            >
              <Star aria-hidden className={cn('size-4', watched && 'fill-current')} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4 gap-2">
          <div>
            <h2 className="text-body font-semibold text-text line-clamp-1 group-hover:text-brand transition-colors">
              <Link
                to={href}
                className="no-underline text-text group-hover:text-brand after:absolute after:inset-0 after:content-['']"
              >
                {s.name}
              </Link>
            </h2>
            <p className="text-small text-muted truncate">
              {[s.locality, s.city || 'Pune'].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="border-t border-line pt-2.5 flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body font-bold text-text tabular">{price}</span>
              {mode === 'buy' && s.psf_now != null && (
                <span className="text-chip text-muted tabular">{formatInr(s.psf_now)}/sqft</span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-chip text-muted pt-0.5">
              {y != null ? (
                <span className="font-medium text-brand tabular" title="Gross yield: annual median rent / median price">
                  {y.toFixed(1)}% gross yield
                </span>
              ) : s.score != null ? (
                <span className="font-medium text-success-ink tabular">
                  Score {s.score.toFixed(1)}/10
                </span>
              ) : (
                <span className="text-muted">Verified inventory</span>
              )}
              {s.rating != null && (
                <span className="flex items-center gap-1 tabular">
                  <Star className="size-3 fill-warning text-warning" aria-hidden />
                  {s.rating.toFixed(1)}
                  {s.review_count ? ` (${s.review_count})` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

/** GP-21 · Market intelligence screen. Clean, consolidated toolbar and dense society grid. */
export default function Market() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = searchParams.get('tab') === 'watchlist' ? 'watchlist' : 'all'
  const city = searchParams.get('city') || 'pune'
  const type = searchParams.get('type') || ''
  const mode = (searchParams.get('mode') as FlatMode) || 'buy'
  const sort = (searchParams.get('sort') as FlatSort) || 'best'
  const bhkParam = searchParams.get('bhk')
  const bhk = bhkParam ? Number(bhkParam) : 0
  const ready = searchParams.get('ready') === 'true'
  const qParam = searchParams.get('q') || ''

  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist.v2', [])
  const [cities, setCities] = useState<CitySummary[]>([])
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'map'>('grid')

  const setParam = (key: string, val: string | number | boolean | null) => {
    setPage(1)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val === null || val === '' || val === 0 || val === false) {
        next.delete(key)
      } else {
        next.set(key, String(val))
      }
      return next
    }, { replace: true })
  }

  const resetAllFilters = () => {
    setPage(1)
    setSearchParams({ city: 'pune', mode: 'buy' }, { replace: true })
  }

  const toggle = (id: string) =>
    setWatch((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))

  useEffect(() => {
    const c = new AbortController()
    fetchCities(c.signal)
      .then((l) => setCities(l.filter((x) => x.societies_count > 0)))
      .catch(() => {})
    return () => c.abort()
  }, [])

  const isWatch = tab === 'watchlist'

  const { data, loading, error, retry } = useSocieties({
    city,
    q: qParam.trim() || undefined,
    mode,
    kind: type || undefined,
    sort,
    bhk: bhk > 0 ? bhk : undefined,
    ready: ready ? true : undefined,
    limit: isWatch ? 100 : PAGE_SIZE,
    offset: isWatch ? 0 : (page - 1) * PAGE_SIZE,
  })

  const fetchedSocieties = data?.societies

  const watched = useMemo(() => {
    const list = fetchedSocieties ?? []
    if (!isWatch) return list
    return list.filter(
      (s) => watch.includes(s.id) && s.city.toLowerCase() === city.toLowerCase(),
    )
  }, [isWatch, fetchedSocieties, watch, city])

  const fetched = fetchedSocieties ?? []
  const total = isWatch ? watched.length : data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(page, pages)
  const rows = isWatch ? watched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) : fetched

  const goToPage = (n: number) => {
    setPage(n)
    document.getElementById('main')?.scrollIntoView({ block: 'start' })
  }

  const hasActiveFilters = Boolean(type || bhk > 0 || ready || qParam || tab === 'watchlist')

  const selectCls =
    'h-9 cursor-pointer rounded-control border border-line-strong bg-field px-2.5 text-small text-text transition-colors hover:border-line-hover focus:border-focus outline-none'

  return (
    <Screen id="GP-21">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 md:px-8 xl:py-8">
        {/* Header Summary */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text">Market intelligence</h1>
            <p className="text-small text-muted">
              Verified residential inventory with rental yields and price metrics across Maharashtra and NCR.
            </p>
          </div>
          <div className="text-small text-muted">
            <span className="font-semibold text-text tabular">{total.toLocaleString('en-IN')}</span>{' '}
            {mode === 'buy' ? 'homes for sale' : 'rental units'}
          </div>
        </div>

        {/* Consolidated Unified Toolbar */}
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3.5 shadow-e1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Mode Segmented Toggle (Buy / Rent) */}
            <div className="inline-flex rounded-control border border-line bg-sunken p-0.5">
              <button
                type="button"
                onClick={() => setParam('mode', 'buy')}
                className={cn(
                  'cursor-pointer rounded-[4px] px-3.5 py-1 text-chip font-medium transition-colors',
                  mode === 'buy'
                    ? 'bg-surface font-semibold text-text shadow-e1'
                    : 'text-muted hover:text-text',
                )}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setParam('mode', 'rent')}
                className={cn(
                  'cursor-pointer rounded-[4px] px-3.5 py-1 text-chip font-medium transition-colors',
                  mode === 'rent'
                    ? 'bg-surface font-semibold text-text shadow-e1'
                    : 'text-muted hover:text-text',
                )}
              >
                Rent
              </button>
            </div>

            {/* View Switcher & Quick Watchlist Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-control border border-line bg-sunken p-0.5 text-chip font-medium">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={cn(
                    'flex items-center gap-1 rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer',
                    view === 'grid'
                      ? 'bg-surface font-semibold text-text shadow-e1'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <LayoutGrid className="size-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView('map')}
                  className={cn(
                    'flex items-center gap-1 rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer',
                    view === 'map'
                      ? 'bg-surface font-semibold text-text shadow-e1'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <MapIcon className="size-3.5" /> 3D Map
                </button>
              </div>

              <button
                type="button"
                onClick={() => setParam('tab', tab === 'watchlist' ? null : 'watchlist')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-control border px-3 py-1.5 text-chip font-medium transition-colors',
                  tab === 'watchlist'
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line-strong bg-field text-text hover:bg-primary-tint',
                )}
              >
                <Star className={cn('size-3.5', tab === 'watchlist' && 'fill-current')} />
                Watchlist ({watch.length})
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex cursor-pointer items-center gap-1 text-chip font-medium text-muted hover:text-text"
                >
                  <X className="size-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Selects Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                aria-label="Filter by society or locality"
                placeholder="Filter by society, locality..."
                value={qParam}
                onChange={(e) => setParam('q', e.target.value)}
                className="h-9 w-full rounded-control border border-line-strong bg-field pr-8 pl-8 text-small text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus"
              />
              {qParam && (
                <button
                  type="button"
                  onClick={() => setParam('q', null)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* City Selector */}
            <select
              aria-label="City"
              value={city}
              onChange={(e) => setParam('city', e.target.value)}
              className={selectCls}
            >
              {(cities.length ? cities : [{ slug: 'pune', name: 'Pune', societies_count: 0 }]).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Property Kind / Type */}
            <select
              aria-label="Type"
              value={type}
              onChange={(e) => setParam('type', e.target.value)}
              className={selectCls}
            >
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>

            {/* BHK Filter */}
            <select
              aria-label="Configuration"
              value={bhk}
              onChange={(e) => setParam('bhk', Number(e.target.value))}
              className={selectCls}
            >
              {BHK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className={selectCls}
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>

            {/* Ready to Move Toggle */}
            <button
              type="button"
              onClick={() => setParam('ready', ready ? null : true)}
              className={cn(
                'h-9 cursor-pointer rounded-control border px-3 text-small font-medium transition-colors',
                ready
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line-strong bg-field text-text hover:bg-primary-tint',
              )}
            >
              Ready to move
            </button>
          </div>
        </div>

        {/* Content & Results Grid or 3D Map */}
        {view === 'map' ? (
          <div className="relative min-h-[580px] overflow-hidden rounded-card border border-line bg-sunken shadow-e1">
            <MarketMap societies={rows} mode={mode} />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-2 rounded-card border border-line bg-surface p-6 text-small shadow-e1"
          >
            <span className="font-semibold text-danger-ink">Could not load market data: {error}</span>
            <Button size="sm" variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : loading && !data ? (
          <ul aria-busy="true" className={GRID}>
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="aspect-[3/4] animate-pulse rounded-card border border-line bg-surface" />
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface py-16 text-center shadow-e1">
            <p role="status" className="max-w-md text-small text-muted">
              {tab === 'watchlist'
                ? `No properties in ${city.toUpperCase()} saved to your watchlist. Star any property to monitor its yield and pricing.`
                : 'No properties match your current search and filter combination.'}
            </p>
            {hasActiveFilters && (
              <Button size="sm" variant="secondary" onClick={resetAllFilters} icon={<RotateCcw className="size-3.5" />}>
                Reset all filters
              </Button>
            )}
          </div>
        ) : (
          <ul aria-busy={loading} className={GRID}>
            {rows.map((s) => (
              <SocietyTile
                key={s.id}
                s={s}
                mode={mode}
                watched={watch.includes(s.id)}
                onToggle={() => toggle(s.id)}
              />
            ))}
          </ul>
        )}

        {/* Pagination Controls */}
        <Pager page={current} pages={pages} total={total} onPage={goToPage} />

        <p className="text-label text-muted">
          Indicative sample data. Prices derived from verified Magicbricks listings. Yield computed from annual median rent / median price.
        </p>
      </div>
    </Screen>
  )
}
