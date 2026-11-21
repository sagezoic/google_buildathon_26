import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { useActiveRole } from '../../app/active-role'
import { Screen } from '../../app/Shell'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Delta } from '../../components/ui/market'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import { RANGES, seriesFor, type Range, X_LABELS } from '../../data/fixtures/market'
import { cn } from '../../lib/cn'
import {
  cardBadges,
  fetchSociety,
  formatInr,
  grossYield,
  lowestRent,
  type SocietyDetailData,
} from '../../lib/flats-api'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'

const NEARBY_LABELS: Record<string, string> = {
  park: 'Park',
  metro: 'Metro Station',
  rail: 'Railway Station',
  school: 'School',
  hospital: 'Hospital',
  shopping: 'Shopping / Mall',
}

const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`)

function SpecRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 text-small', !last && 'border-b border-line')}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular text-text">{value}</span>
    </div>
  )
}

function PriceChart({ series, range }: { series: number[]; range: Range }) {
  const lo = Math.floor(Math.min(...series))
  const hi = Math.ceil(Math.max(...series))
  const x0 = 90
  const x1 = 790
  const y0 = 20
  const y1 = 130
  const x = (i: number) => x0 + (i * (x1 - x0)) / Math.max(1, series.length - 1)
  const y = (v: number) => y1 - ((v - lo) / (hi - lo || 1)) * (y1 - y0)
  const pts = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const fmt = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`
  const span: Record<Range, string> = {
    '1D': 'today',
    '1W': 'the last week',
    '1M': 'the last month',
    '1Y': 'the last year',
    All: 'all time',
  }

  return (
    <svg
      viewBox="0 0 880 150"
      role="img"
      aria-label={`Price trend over ${span[range]}, from ${fmt(series[0])} to ${fmt(series[series.length - 1])}.`}
      className="h-auto w-full select-none"
    >
      {[hi, (hi + lo) / 2, lo].map((v) => (
        <g key={v}>
          <line x1={x0} x2={x1} y1={y(v)} y2={y(v)} className="stroke-line" strokeDasharray="3 3" />
          <text x={x0 - 10} y={y(v) + 4} textAnchor="end" className="fill-muted font-sans text-[11px] tabular">
            {fmt(v)}
          </text>
        </g>
      ))}
      <polygon points={`${x0},${y1} ${pts} ${x1},${y1}`} className="fill-primary-tint/60" />
      <polyline
        points={pts}
        fill="none"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-primary"
      />
    </svg>
  )
}

/** GP-22 · Market Detail. Real society data from `/api/flats/societies/:id` + financial metrics widget. */
export default function MarketDetail() {
  const [activeRole] = useActiveRole()
  const isOwner = activeRole === 'owner'
  const { id } = useParams<{ id: string }>()
  const societyId = id ? decodeURIComponent(id) : ''

  const [society, setSociety] = useState<SocietyDetailData | null>(null)
  const [loading, setLoading] = useState(Boolean(societyId))
  const [error, setError] = useState<string | null>(societyId ? null : 'No society ID provided')
  const [attempt, setAttempt] = useState(0)
  const [activePhoto, setActivePhoto] = useState(0)
  const [activeSection, setActiveSection] = useState<'overview' | 'listings' | 'token'>('overview')
  const [listingFilter, setListingFilter] = useState<'all' | 'sale' | 'rent'>('all')

  const [trackedId, setTrackedId] = useState(societyId)
  if (trackedId !== societyId) {
    setTrackedId(societyId)
    setSociety(null)
    setLoading(Boolean(societyId))
    setError(societyId ? null : 'No society ID provided')
    setActivePhoto(0)
  }

  const tabListRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = usePersistentState<Range>('market.range', '1M')
  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist.v2', [])

  useEffect(() => {
    if (!societyId) return

    const controller = new AbortController()
    fetchSociety(societyId, controller.signal)
      .then((data) => {
        setSociety(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Failed to load society details')
        setLoading(false)
      })

    return () => controller.abort()
  }, [societyId, attempt])

  const watching = society ? watch.includes(society.id) : false
  const toggleWatch = () => {
    if (!society) return
    setWatch((w) => (w.includes(society.id) ? w.filter((x) => x !== society.id) : [...w, society.id]))
  }

  // Fallback financial ticker series
  const tokenUnitPrice = society?.price_min ? Math.round(society.price_min / 1000) : 5000
  const tokenSeries = seriesFor(society?.id || 'mb_1', tokenUnitPrice, range)

  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: 'overview' | 'listings' | 'token') => {
    const tabs: Array<'overview' | 'listings' | 'token'> = ['overview', 'listings', 'token']
    const idx = tabs.indexOf(currentTab)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextTab = tabs[(idx + 1) % tabs.length]
      setActiveSection(nextTab)
      const nextBtn = tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${nextTab}`)
      nextBtn?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevTab = tabs[(idx - 1 + tabs.length) % tabs.length]
      setActiveSection(prevTab)
      const prevBtn = tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${prevTab}`)
      prevBtn?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveSection(tabs[0])
      tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${tabs[0]}`)?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveSection(tabs[tabs.length - 1])
      tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${tabs[tabs.length - 1]}`)?.focus()
    }
  }

  if (error) {
    return (
      <Screen id="GP-22" title="Could not load society">
        <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 px-4 py-16 text-center">
          <Card className="flex flex-col items-center gap-4 p-8 text-center shadow-e1">
            <div className="flex size-14 items-center justify-center rounded-full bg-danger-tint text-danger-ink">
              <AlertTriangle className="size-7" aria-hidden />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-h2 font-semibold text-text">Could not load society</h1>
              <p className="max-w-md text-small text-muted">{error}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  setAttempt((n) => n + 1)
                }}
                icon={<RotateCcw className="size-4" />}
              >
                Try again
              </Button>
              <Button variant="secondary" to={path('GP-21')}>
                Back to market
              </Button>
            </div>
          </Card>
        </div>
      </Screen>
    )
  }

  if (loading && !society) {
    return (
      <Screen id="GP-22" title="Loading society...">
        <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded bg-skeleton" />
            <div className="h-6 w-36 animate-pulse rounded bg-skeleton" />
          </div>

          {/* Title hero skeleton */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="h-5 w-20 animate-pulse rounded-pill bg-skeleton" />
                <div className="h-5 w-24 animate-pulse rounded-pill bg-skeleton" />
              </div>
              <div className="h-9 w-72 animate-pulse rounded bg-skeleton" />
              <div className="h-5 w-48 animate-pulse rounded bg-skeleton" />
            </div>
            <div className="flex flex-col items-start gap-1 xl:items-end">
              <div className="h-4 w-28 animate-pulse rounded bg-skeleton" />
              <div className="h-8 w-40 animate-pulse rounded bg-skeleton" />
              <div className="h-4 w-32 animate-pulse rounded bg-skeleton" />
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6">
              <div className="aspect-[16/9] w-full animate-pulse rounded-card bg-skeleton" />
              <div className="h-11 w-full animate-pulse rounded bg-skeleton" />
              <div className="h-48 w-full animate-pulse rounded-card bg-skeleton" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-80 w-full animate-pulse rounded-card bg-skeleton" />
              <div className="h-32 w-full animate-pulse rounded-card bg-skeleton" />
            </div>
          </div>
        </div>
      </Screen>
    )
  }

  if (!society) {
    return (
      <Screen id="GP-22" title="Society not found">
        <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 px-4 py-16 text-center">
          <Card className="flex flex-col items-center gap-4 p-8 text-center shadow-e1">
            <div className="flex size-14 items-center justify-center rounded-full bg-sunken text-muted">
              <Info className="size-7" aria-hidden />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-h2 font-semibold text-text">Society not found</h1>
              <p className="max-w-md text-small text-muted">
                The requested property record could not be found in the sovereign land registry.
              </p>
            </div>
            <div className="pt-2">
              <Button to={path('GP-21')}>Back to market</Button>
            </div>
          </Card>
        </div>
      </Screen>
    )
  }

  const s = society
  const badges = cardBadges(s)
  const prices =
    s.prices && Object.keys(s.prices).length > 0
      ? s.prices
      : Object.fromEntries(
          (s.bhk_prices ?? []).map((p) => [
            String(p.bhk),
            { buy_median: p.buy_median, rent_median: p.rent_median, psf: p.psf },
          ]),
        )
  const y = grossYield(prices)
  const rent = lowestRent(prices)
  const photos = (s.images ?? []).map((i) => i.full || i.thumb).filter(Boolean)
  const gallery = photos.length ? photos : [PLACEHOLDER]

  const buyPriceDisplay =
    s.price_min != null
      ? s.price_max && s.price_max !== s.price_min
        ? `${formatInr(s.price_min)} – ${formatInr(s.price_max)}`
        : formatInr(s.price_min)
      : 'Price on request'

  const rentPriceDisplay = rent != null ? `from ${formatInr(rent)}/mo` : 'Rent on request'

  const nearbyPOIs = Object.entries(s.nearby ?? {}).filter(([, v]) => typeof v?.m === 'number')
  const allListings = s.listings ?? []
  const listings = allListings.filter((l) => listingFilter === 'all' || l.mode === listingFilter)
  const saleListingsCount = allListings.filter((l) => l.mode === 'sale').length
  const rentListingsCount = allListings.filter((l) => l.mode === 'rent').length

  return (
    <Screen id="GP-22" title={s.name}>
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={path('GP-21')}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-control text-chip font-medium text-muted transition-colors hover:text-text focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-0"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to market
          </Link>
          <div className="flex items-center gap-2">
            <RecordId id={s.id} />
            <Pill tone="chain" icon={<CheckCircle2 className="size-3" />} className="max-xl:hidden">
              Verified on Realdha
            </Pill>
          </div>
        </div>

        {/* Title & Core Price Hero */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((b, i) => {
                const isStatus = i === 1 && s.status?.toLowerCase().includes('ready')
                const tone = i === 0 ? 'brand' : isStatus ? 'success' : 'neutral'
                return (
                  <Pill key={b} tone={tone} icon={isStatus ? <CheckCircle2 className="size-3" /> : undefined}>
                    {b}
                  </Pill>
                )
              })}
              {s.rera_id && (
                <span className="rounded-control border border-line bg-sunken px-2 py-0.5 font-mono text-[11px] text-muted">
                  RERA: {s.rera_id}
                </span>
              )}
            </div>

            <h1 className="text-h1 font-semibold text-text">{s.name}</h1>
            <p className="flex items-center gap-1.5 text-small text-muted">
              <MapPin className="size-4 shrink-0 text-muted" aria-hidden />
              {[s.locality, s.pincode ? `Pune ${s.pincode}` : 'Pune', s.developer ? `By ${s.developer}` : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          <div className="flex flex-col items-start xl:items-end">
            <span className="text-label text-muted">Purchase estimate</span>
            <div className="text-h1 font-semibold tabular text-text">{buyPriceDisplay}</div>
            <div className="flex flex-wrap items-center gap-x-2 text-chip text-muted">
              {s.psf_now != null && <span className="tabular">{formatInr(s.psf_now)}/sqft</span>}
              {y != null && (
                <span className="font-semibold tabular text-primary-text">
                  · {y.toFixed(1)}% gross yield
                </span>
              )}
              {s.score != null && (
                <span className="font-semibold tabular text-success-ink">
                  · {s.score.toFixed(1)}/10 score
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid: Gallery & Details on Left, Actions & Summary on Right */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            {/* Photo Gallery */}
            <Card className="overflow-hidden p-0 shadow-e1">
              <div className="relative aspect-[16/9] w-full bg-sunken">
                <img
                  src={gallery[activePhoto % gallery.length]}
                  alt={`${s.name} photograph`}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER
                  }}
                  className="size-full object-cover"
                />

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label={`Previous photo (${activePhoto === 0 ? gallery.length : activePhoto} of ${gallery.length})`}
                      onClick={() => setActivePhoto((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/90 text-text shadow-e1 transition-colors hover:bg-surface focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Next photo (${activePhoto + 2 > gallery.length ? 1 : activePhoto + 2} of ${gallery.length})`}
                      onClick={() => setActivePhoto((i) => (i + 1) % gallery.length)}
                      className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/90 text-text shadow-e1 transition-colors hover:bg-surface focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <ChevronRight className="size-5" aria-hidden />
                    </button>
                    <div className="absolute right-3 bottom-3 rounded-pill border border-line bg-surface/90 px-3 py-1 text-chip font-medium tabular text-text shadow-e1">
                      {activePhoto + 1} / {gallery.length}
                    </div>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {gallery.slice(0, 8).map((imgUrl, i) => (
                    <button
                      key={imgUrl}
                      type="button"
                      aria-label={`View photo ${i + 1} of ${gallery.length}`}
                      aria-current={i === activePhoto ? 'true' : undefined}
                      onClick={() => setActivePhoto(i)}
                      className={cn(
                        'relative size-16 flex-none cursor-pointer overflow-hidden rounded-control border-2 transition-all focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2',
                        i === activePhoto
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-line opacity-75 hover:border-line-hover hover:opacity-100',
                      )}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER
                        }}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* View Mode Tabs: Property Overview vs Active Listings vs Financial Token Analysis */}
            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Detail sections"
              className="flex border-b border-line"
            >
              <button
                type="button"
                role="tab"
                id="tab-overview"
                aria-selected={activeSection === 'overview'}
                aria-controls="tabpanel-overview"
                tabIndex={activeSection === 'overview' ? 0 : -1}
                onClick={() => setActiveSection('overview')}
                onKeyDown={(e) => handleTabKeyDown(e, 'overview')}
                className={cn(
                  '-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-[3px] px-4 py-2.5 text-small transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2',
                  activeSection === 'overview'
                    ? 'border-primary font-semibold text-primary-text'
                    : 'border-transparent text-muted hover:border-line-strong hover:text-text',
                )}
              >
                Property overview
              </button>
              <button
                type="button"
                role="tab"
                id="tab-listings"
                aria-selected={activeSection === 'listings'}
                aria-controls="tabpanel-listings"
                tabIndex={activeSection === 'listings' ? 0 : -1}
                onClick={() => setActiveSection('listings')}
                onKeyDown={(e) => handleTabKeyDown(e, 'listings')}
                className={cn(
                  '-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-[3px] px-4 py-2.5 text-small transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2',
                  activeSection === 'listings'
                    ? 'border-primary font-semibold text-primary-text'
                    : 'border-transparent text-muted hover:border-line-strong hover:text-text',
                )}
              >
                Active listings ({s.listings?.length ?? 0})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-token"
                aria-selected={activeSection === 'token'}
                aria-controls="tabpanel-token"
                tabIndex={activeSection === 'token' ? 0 : -1}
                onClick={() => setActiveSection('token')}
                onKeyDown={(e) => handleTabKeyDown(e, 'token')}
                className={cn(
                  '-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-[3px] px-4 py-2.5 text-small transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2',
                  activeSection === 'token'
                    ? 'border-primary font-semibold text-primary-text'
                    : 'border-transparent text-muted hover:border-line-strong hover:text-text',
                )}
              >
                Financial & token metrics
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeSection === 'overview' && (
              <div
                role="tabpanel"
                id="tabpanel-overview"
                aria-labelledby="tab-overview"
                tabIndex={0}
                className="flex flex-col gap-6 focus-visible:outline-focus"
              >
                {/* Description */}
                {s.description && (
                  <Card className="flex flex-col gap-2 p-6 shadow-e1">
                    <h2 className="text-h3 font-semibold text-text">About {s.name}</h2>
                    <p className="text-body leading-relaxed text-muted whitespace-pre-line">{s.description}</p>
                  </Card>
                )}

                {/* BHK Configurations & Pricing Breakdown */}
                {s.bhk_prices && s.bhk_prices.length > 0 && (
                  <Card className="flex flex-col gap-4 p-6 shadow-e1">
                    <div>
                      <h2 className="text-h3 font-semibold text-text">BHK configurations & price breakdown</h2>
                      <p className="text-small text-muted">
                        Official registration benchmarks derived from recent transactions.
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-control border border-line">
                      <table className="w-full text-left text-small">
                        <thead>
                          <tr className="border-b border-line bg-sunken text-muted">
                            <th className="px-4 py-3 text-label font-semibold text-muted">BHK type</th>
                            <th className="px-4 py-3 text-label font-semibold text-muted">Buy median</th>
                            <th className="px-4 py-3 text-label font-semibold text-muted">Rent median</th>
                            <th className="px-4 py-3 text-label font-semibold text-muted">Avg PSF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line bg-surface">
                          {s.bhk_prices.map((bp) => (
                            <tr key={bp.bhk} className="transition-colors hover:bg-primary-tint/40">
                              <td className="px-4 py-3 font-semibold text-text">{bp.bhk} BHK</td>
                              <td className="px-4 py-3 tabular font-medium text-text">{formatInr(bp.buy_median)}</td>
                              <td className="px-4 py-3 tabular text-text">
                                {bp.rent_median ? `${formatInr(bp.rent_median)}/mo` : '–'}
                              </td>
                              <td className="px-4 py-3 tabular text-muted">
                                {bp.psf ? `${formatInr(bp.psf)}/sqft` : '–'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Available Unit Types */}
                {s.unit_types && s.unit_types.length > 0 && (
                  <Card className="flex flex-col gap-4 p-6 shadow-e1">
                    <div>
                      <h2 className="text-h3 font-semibold text-text">Floor plans & sizes</h2>
                      <p className="text-small text-muted">Available unit typologies verified from master plan.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {s.unit_types.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-control border border-line bg-surface p-4 transition-colors hover:border-line-hover"
                        >
                          <div>
                            <div className="font-semibold text-text">{u.bhk ? `${u.bhk} BHK` : 'Unit'}</div>
                            <div className="text-label text-muted">
                              {u.size_sqft ? `${u.size_sqft.toLocaleString('en-IN')} sq ft` : 'Size on request'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold tabular text-text">
                              {u.price_min != null ? formatInr(u.price_min) : 'On request'}
                            </div>
                            {u.price_max && u.price_max !== u.price_min && (
                              <div className="text-label tabular text-muted">up to {formatInr(u.price_max)}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Amenities */}
                {s.amenities && s.amenities.length > 0 && (
                  <Card className="flex flex-col gap-4 p-6 shadow-e1">
                    <div>
                      <h2 className="text-h3 font-semibold text-text">Amenities & facilities</h2>
                      <p className="text-small text-muted">Infrastructure and common areas verified on deed.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {s.amenities.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-3 py-2 text-chip font-medium text-text shadow-e0"
                        >
                          <CheckCircle2 className="size-3.5 shrink-0 text-success-ink" aria-hidden />
                          <span>{a}</span>
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Nearby POIs */}
                {nearbyPOIs.length > 0 && (
                  <Card className="flex flex-col gap-4 p-6 shadow-e1">
                    <div>
                      <h2 className="text-h3 font-semibold text-text">Neighborhood & proximity</h2>
                      <p className="text-small text-muted">Key connectivity nodes and transit times.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {nearbyPOIs.map(([key, item]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface p-4 transition-colors hover:border-line-hover"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="size-4 shrink-0 text-primary-text" aria-hidden />
                            <div>
                              <div className="font-medium text-text">{NEARBY_LABELS[key] || key}</div>
                              {item.name && <div className="text-label text-muted">{item.name}</div>}
                            </div>
                          </div>
                          <div className="font-semibold tabular text-primary-text">{fmtDist(item.m)}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Resident Reviews */}
                {s.reviews && s.reviews.length > 0 && (
                  <Card className="flex flex-col gap-4 p-6 shadow-e1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-h3 font-semibold text-text">Resident reviews</h2>
                        <p className="text-small text-muted">Direct feedback from verified residents.</p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-control border border-line bg-sunken px-3 py-1.5 text-small font-semibold">
                        <Star className="size-4 fill-warning-ink text-warning-ink" aria-hidden />
                        <span className="tabular">{s.rating ? s.rating.toFixed(1) : '–'}</span>
                        <span className="font-normal text-muted tabular">
                          ({s.review_count ?? s.reviews.length} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-line">
                      {s.reviews.map((rev, i) => (
                        <div key={i} className="py-3.5 first:pt-1 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text">{rev.author || 'Resident'}</span>
                            {rev.date && <span className="text-label text-muted">{rev.date}</span>}
                          </div>
                          {rev.title && <div className="mt-1 font-medium text-small text-text">{rev.title}</div>}
                          <p className="mt-1 text-small leading-relaxed text-muted">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 2: ACTIVE LISTINGS */}
            {activeSection === 'listings' && (
              <div
                role="tabpanel"
                id="tabpanel-listings"
                aria-labelledby="tab-listings"
                tabIndex={0}
                className="flex flex-col gap-4 focus-visible:outline-focus"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={listingFilter === 'all'}
                    onClick={() => setListingFilter('all')}
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center rounded-control border px-4 py-2 text-chip font-medium transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-9',
                      listingFilter === 'all'
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                    )}
                  >
                    All ({allListings.length})
                  </button>
                  <button
                    type="button"
                    aria-pressed={listingFilter === 'sale'}
                    onClick={() => setListingFilter('sale')}
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center rounded-control border px-4 py-2 text-chip font-medium transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-9',
                      listingFilter === 'sale'
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                    )}
                  >
                    For sale ({saleListingsCount})
                  </button>
                  <button
                    type="button"
                    aria-pressed={listingFilter === 'rent'}
                    onClick={() => setListingFilter('rent')}
                    className={cn(
                      'inline-flex min-h-11 cursor-pointer items-center rounded-control border px-4 py-2 text-chip font-medium transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-9',
                      listingFilter === 'rent'
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                    )}
                  >
                    For rent ({rentListingsCount})
                  </button>
                </div>

                {listings.length === 0 ? (
                  <Card className="flex flex-col items-center gap-3 p-8 text-center shadow-e1">
                    <p className="text-small text-muted">No active listings match this filter at the moment.</p>
                    <Button variant="secondary" size="sm" onClick={() => setListingFilter('all')}>
                      Show all listings
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {listings.map((l, i) => (
                      <Card
                        key={i}
                        className="flex flex-col justify-between gap-4 p-5 shadow-e1 transition-all hover:border-line-hover"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-control font-semibold text-text">
                              {l.bhk ? `${l.bhk} BHK` : 'Apartment'}
                            </span>
                            <span
                              className={cn(
                                'rounded px-2 py-0.5 text-label font-semibold',
                                l.mode === 'rent'
                                  ? 'bg-info-tint text-info-ink'
                                  : 'bg-primary-tint text-primary-text',
                              )}
                            >
                              {l.mode === 'rent' ? 'For rent' : 'For sale'}
                            </span>
                          </div>
                          <div className="text-h2 font-semibold tabular text-text">
                            {l.price != null
                              ? l.mode === 'rent'
                                ? `${formatInr(l.price)}/mo`
                                : formatInr(l.price)
                              : 'On request'}
                          </div>
                          <div className="text-small text-muted">
                            {[
                              l.sqft ? `${l.sqft.toLocaleString('en-IN')} sq ft` : null,
                              l.floor ? `Floor ${l.floor}` : null,
                              l.furnished,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        </div>
                        <Button size="sm" variant="secondary" to={path('F18-02')}>
                          Enquire unit
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FINANCIAL & TOKEN METRICS */}
            {activeSection === 'token' && (
              <div
                role="tabpanel"
                id="tabpanel-token"
                aria-labelledby="tab-token"
                tabIndex={0}
                className="flex flex-col gap-6 focus-visible:outline-focus"
              >
                <Card className="flex flex-col gap-4 p-5 shadow-e1 xl:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-h3 font-semibold text-text">Historical token valuation</h2>
                      <p className="text-label text-muted">Sample financial model. View only. Not an offer.</p>
                    </div>
                    <div role="group" aria-label="Time range" className="flex gap-1.5 max-xl:overflow-hidden">
                      {RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={range === r}
                          onClick={() => setRange(r)}
                          className={cn(
                            'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control border px-3 text-chip font-semibold transition-colors focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-8',
                            range === r
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PriceChart series={tokenSeries} range={range} />
                  <div className="flex justify-between text-overline tabular text-muted">
                    {X_LABELS[range].map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ['1 day', 1.84],
                      ['1 week', 2.1],
                      ['1 month', 4.17],
                      ['1 year', -0.8],
                    ] as const
                  ).map(([k, p]) => (
                    <Card key={k} className="p-4 shadow-e1">
                      <div className="text-label text-muted">{k}</div>
                      <Delta pct={p} className="text-h2 font-semibold tabular" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Key Specs & Primary Actions */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col p-6 shadow-e1">
              <h2 className="mb-2 text-h3 font-semibold text-text">Society summary</h2>
              <SpecRow label="Status" value={s.status || 'Ready to move'} />
              <SpecRow label="Possession" value={s.possession || 'Ready'} />
              <SpecRow label="Total units" value={s.units ? s.units.toLocaleString('en-IN') : '–'} />
              <SpecRow label="Towers" value={s.towers ?? '–'} />
              <SpecRow label="Land area" value={s.acres ? `${s.acres} acres` : '–'} />
              <SpecRow label="Rental yield" value={y != null ? `${y.toFixed(1)}% gross` : '–'} />
              <SpecRow label="Lowest rent" value={rentPriceDisplay} />
              <SpecRow label="On-chain network" value="Sepolia testnet" last />

              <div className="mt-5 flex flex-col gap-2.5">
                {isOwner && (
                  <Button
                    variant="secondary"
                    block
                    to={path('GP-16', { id: s.id })}
                    icon={<ExternalLink className="size-4" />}
                  >
                    Open digital twin
                  </Button>
                )}
                <Button
                  variant="secondary"
                  block
                  to={isOwner ? path('GP-18', { id: s.id }) : path('F11-03')}
                  icon={<Sparkles className="size-4" />}
                >
                  Ask AI about {s.name}
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-6 shadow-e1">
              <Button
                size="lg"
                block
                variant="secondary"
                aria-pressed={watching}
                onClick={toggleWatch}
                icon={<Star className={cn('size-4', watching && 'fill-warning-ink text-warning-ink')} />}
              >
                {watching ? 'On your watchlist' : 'Add to watchlist'}
              </Button>

              <Button size="lg" block to={path('F18-02')}>
                Register interest
              </Button>

              <div className="flex items-start gap-2 pt-1 text-label text-muted">
                <Calendar className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>Enquiries sent directly to verified representatives. Not an offer or financial contract.</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
