import { useEffect, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
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
    <div className={cn('flex items-center justify-between gap-4 py-2.5 text-small', !last && 'border-b border-line')}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}</span>
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
  const span: Record<Range, string> = { '1D': 'today', '1W': 'the last week', '1M': 'the last month', '1Y': 'the last year', All: 'all time' }

  return (
    <svg viewBox="0 0 880 150" role="img" aria-label={`Price trend over ${span[range]}, from ${fmt(series[0])} to ${fmt(series[series.length - 1])}.`} className="h-auto w-full">
      {[hi, (hi + lo) / 2, lo].map((v) => (
        <g key={v}>
          <line x1={x0} x2={x1} y1={y(v)} y2={y(v)} className="stroke-line" />
          <text x={x0 - 6} y={y(v) - 4} textAnchor="end" className="fill-muted text-[11px]">{fmt(v)}</text>
        </g>
      ))}
      <polygon points={`${x0},${y1} ${pts} ${x1},${y1}`} className="fill-primary-tint" />
      <polyline points={pts} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="stroke-primary" />
    </svg>
  )
}

/** GP-22 · Market Detail. Real society data from `/api/flats/societies/:id` + financial metrics widget. */
export default function MarketDetail() {
  const { id } = useParams<{ id: string }>()
  const societyId = id ? decodeURIComponent(id) : ''

  const [society, setSociety] = useState<SocietyDetailData | null>(null)
  const [loading, setLoading] = useState(Boolean(societyId))
  const [error, setError] = useState<string | null>(societyId ? null : 'No society ID provided')
  const [attempt, setAttempt] = useState(0)
  const [activePhoto, setActivePhoto] = useState(0)
  const [activeSection, setActiveSection] = useState<'overview' | 'listings' | 'token'>('overview')
  const [listingFilter, setListingFilter] = useState<'all' | 'sale' | 'rent'>('all')

  const [range, setRange] = usePersistentState<Range>('market.range', '1M')
  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist.v2', [])

  useEffect(() => {
    if (!societyId) return

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setActivePhoto(0)

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

  if (error) {
    return (
      <Screen id="GP-22">
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
              <Button onClick={() => setAttempt((n) => n + 1)} icon={<RotateCcw className="size-4" />}>
                Try again
              </Button>
              <Button variant="secondary" to={path('GP-21')}>
                Back to Market
              </Button>
            </div>
          </Card>
        </div>
      </Screen>
    )
  }

  if (loading && !society) {
    return (
      <Screen id="GP-22">
        <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
          <div className="h-6 w-32 animate-pulse rounded bg-sunken" />
          <div className="h-10 w-96 animate-pulse rounded bg-sunken" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-4">
              <div className="aspect-[16/9] w-full animate-pulse rounded-card bg-sunken" />
              <div className="h-36 w-full animate-pulse rounded-card bg-sunken" />
            </div>
            <div className="h-96 w-full animate-pulse rounded-card bg-sunken" />
          </div>
        </div>
      </Screen>
    )
  }

  if (!society) return null

  const s = society
  const badges = cardBadges(s)
  const y = grossYield(s.prices)
  const rent = lowestRent(s.prices)
  const photos = (s.images ?? []).map((i) => i.full || i.thumb).filter(Boolean)
  const gallery = photos.length ? photos : [PLACEHOLDER]

  const buyPriceDisplay = s.price_min != null
    ? s.price_max && s.price_max !== s.price_min
      ? `${formatInr(s.price_min)} – ${formatInr(s.price_max)}`
      : formatInr(s.price_min)
    : 'Price on request'

  const rentPriceDisplay = rent != null ? `from ${formatInr(rent)}/mo` : 'Rent on request'

  const nearbyPOIs = Object.entries(s.nearby ?? {}).filter(([, v]) => typeof v?.m === 'number')
  const listings = (s.listings ?? []).filter((l) => listingFilter === 'all' || l.mode === listingFilter)

  return (
    <Screen id="GP-22">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={path('GP-21')}
            className="inline-flex min-h-11 items-center gap-1.5 text-chip font-medium text-muted hover:text-text xl:min-h-0"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to Market
          </Link>
          <div className="flex items-center gap-2">
            <RecordId id={s.id} />
            <Pill tone="chain" className="max-xl:hidden">Verified on Realdha</Pill>
          </div>
        </div>

        {/* Title & Core Price Hero */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((b, i) => (
                <Pill key={b} tone={i === 0 ? 'brand' : i === 1 && s.status?.toLowerCase().includes('ready') ? 'success' : 'neutral'}>
                  {b}
                </Pill>
              ))}
              {s.rera_id && (
                <span className="rounded-control border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                  RERA: {s.rera_id}
                </span>
              )}
            </div>

            <h1 className="text-h1 font-bold text-text">{s.name}</h1>
            <p className="flex items-center gap-1.5 text-small text-muted">
              <MapPin className="size-4 shrink-0 text-muted" aria-hidden />
              {[s.locality, s.pincode ? `Pune ${s.pincode}` : 'Pune', s.developer ? `By ${s.developer}` : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          <div className="flex flex-col items-start xl:items-end">
            <span className="text-label text-muted">Purchase Estimate</span>
            <div className="text-h2 font-bold tabular text-text">{buyPriceDisplay}</div>
            <div className="flex flex-wrap items-center gap-x-2 text-chip text-muted">
              {s.psf_now != null && <span>{formatInr(s.psf_now)}/sqft</span>}
              {y != null && <span className="font-semibold text-brand">· {y.toFixed(1)}% gross yield</span>}
              {s.score != null && (
                <span className="font-semibold text-success-ink">
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
                  alt={`${s.name} photo`}
                  className="size-full object-cover"
                />

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setActivePhoto((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute top-1/2 left-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#fff] text-[#0B1020] shadow-e1 transition-opacity hover:bg-[#f1f5f9]"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setActivePhoto((i) => (i + 1) % gallery.length)}
                      className="absolute top-1/2 right-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#fff] text-[#0B1020] shadow-e1 transition-opacity hover:bg-[#f1f5f9]"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <div className="absolute right-3 bottom-3 rounded-pill bg-[#0B1020]/75 px-2.5 py-1 text-chip font-medium text-[#fff]">
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
                      onClick={() => setActivePhoto(i)}
                      className={cn(
                        'relative size-16 flex-none overflow-hidden rounded-control border-2 transition-all',
                        i === activePhoto ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-75 hover:opacity-100',
                      )}
                    >
                      <img src={imgUrl} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* View Mode Tabs: Property Overview vs Active Listings vs Financial Token Analysis */}
            <div role="tablist" aria-label="Detail Sections" className="flex border-b border-line">
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === 'overview'}
                onClick={() => setActiveSection('overview')}
                className={cn(
                  '-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 text-small transition-colors',
                  activeSection === 'overview'
                    ? 'border-primary font-semibold text-brand'
                    : 'border-transparent text-muted hover:text-text',
                )}
              >
                Property Overview
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === 'listings'}
                onClick={() => setActiveSection('listings')}
                className={cn(
                  '-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 text-small transition-colors',
                  activeSection === 'listings'
                    ? 'border-primary font-semibold text-brand'
                    : 'border-transparent text-muted hover:text-text',
                )}
              >
                Active Listings ({s.listings?.length ?? 0})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSection === 'token'}
                onClick={() => setActiveSection('token')}
                className={cn(
                  '-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 text-small transition-colors',
                  activeSection === 'token'
                    ? 'border-primary font-semibold text-brand'
                    : 'border-transparent text-muted hover:text-text',
                )}
              >
                Financial & Token Metrics
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* Description */}
                {s.description && (
                  <Card className="flex flex-col gap-2 p-5">
                    <h3 className="text-control font-semibold text-text">About {s.name}</h3>
                    <p className="text-small text-muted leading-relaxed whitespace-pre-line">{s.description}</p>
                  </Card>
                )}

                {/* BHK Configurations & Pricing Breakdown */}
                {s.bhk_prices && s.bhk_prices.length > 0 && (
                  <Card className="flex flex-col gap-3 p-5">
                    <h3 className="text-control font-semibold text-text">BHK Configurations & Price Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-small">
                        <thead>
                          <tr className="border-b border-line text-muted">
                            <th className="py-2.5 font-medium">BHK Type</th>
                            <th className="py-2.5 font-medium">Buy Median</th>
                            <th className="py-2.5 font-medium">Rent Median</th>
                            <th className="py-2.5 font-medium">Avg PSF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {s.bhk_prices.map((bp) => (
                            <tr key={bp.bhk}>
                              <td className="py-2.5 font-semibold text-text">{bp.bhk} BHK</td>
                              <td className="py-2.5 tabular text-text">{formatInr(bp.buy_median)}</td>
                              <td className="py-2.5 tabular text-text">{bp.rent_median ? `${formatInr(bp.rent_median)}/mo` : '–'}</td>
                              <td className="py-2.5 tabular text-muted">{bp.psf ? `${formatInr(bp.psf)}/sqft` : '–'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Available Unit Types */}
                {s.unit_types && s.unit_types.length > 0 && (
                  <Card className="flex flex-col gap-3 p-5">
                    <h3 className="text-control font-semibold text-text">Floor Plans & Sizes</h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {s.unit_types.map((u, i) => (
                        <div key={i} className="flex items-center justify-between rounded-control border border-line bg-surface p-3">
                          <div>
                            <div className="font-semibold text-text">{u.bhk ? `${u.bhk} BHK` : 'Unit'}</div>
                            <div className="text-label text-muted">{u.size_sqft ? `${u.size_sqft} sq ft` : 'Size on request'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold tabular text-text">
                              {u.price_min != null ? formatInr(u.price_min) : 'On request'}
                            </div>
                            {u.price_max && u.price_max !== u.price_min && (
                              <div className="text-label text-muted">up to {formatInr(u.price_max)}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Amenities */}
                {s.amenities && s.amenities.length > 0 && (
                  <Card className="flex flex-col gap-3 p-5">
                    <h3 className="text-control font-semibold text-text">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {s.amenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1.5 rounded-control border border-line-strong bg-field px-3 py-1.5 text-chip font-medium text-text">
                          <CheckCircle2 className="size-3.5 text-success-ink" /> {a}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Nearby POIs */}
                {nearbyPOIs.length > 0 && (
                  <Card className="flex flex-col gap-3 p-5">
                    <h3 className="text-control font-semibold text-text">Neighborhood & Proximity</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {nearbyPOIs.map(([key, item]) => (
                        <div key={key} className="flex items-center justify-between rounded-control border border-line p-3">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="size-4 text-brand" />
                            <div>
                              <div className="font-medium text-text">{NEARBY_LABELS[key] || key}</div>
                              {item.name && <div className="text-label text-muted">{item.name}</div>}
                            </div>
                          </div>
                          <div className="font-semibold tabular text-brand">{fmtDist(item.m)}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Resident Reviews */}
                {s.reviews && s.reviews.length > 0 && (
                  <Card className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-control font-semibold text-text">Resident Reviews</h3>
                      <div className="flex items-center gap-1.5 text-small font-semibold">
                        <Star className="size-4 fill-warning-ink text-warning-ink" />
                        <span>{s.rating ? s.rating.toFixed(1) : '–'}</span>
                        <span className="font-normal text-muted">({s.review_count ?? s.reviews.length} reviews)</span>
                      </div>
                    </div>
                    <div className="divide-y divide-line">
                      {s.reviews.map((rev, i) => (
                        <div key={i} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text">{rev.author || 'Resident'}</span>
                            {rev.date && <span className="text-label text-muted">{rev.date}</span>}
                          </div>
                          {rev.title && <div className="mt-0.5 font-medium text-small text-text">{rev.title}</div>}
                          <p className="mt-1 text-small text-muted">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 2: ACTIVE LISTINGS */}
            {activeSection === 'listings' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  {(['all', 'sale', 'rent'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setListingFilter(mode)}
                      className={cn(
                        'cursor-pointer rounded-control border px-3 py-1.5 text-chip font-medium capitalize',
                        listingFilter === mode ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {listings.length === 0 ? (
                  <Card className="p-8 text-center text-small text-muted">
                    No active listings for this filter at the moment.
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {listings.map((l, i) => (
                      <Card key={i} className="flex flex-col justify-between gap-3 p-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text">{l.bhk ? `${l.bhk} BHK` : 'Apartment'}</span>
                            <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase', l.mode === 'rent' ? 'bg-info-tint text-info-ink' : 'bg-primary-tint text-primary-text')}>
                              {l.mode === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                          </div>
                          <div className="mt-1 text-h3 font-bold tabular text-text">
                            {l.price != null ? (l.mode === 'rent' ? `${formatInr(l.price)}/mo` : formatInr(l.price)) : 'On request'}
                          </div>
                          <div className="mt-2 text-label text-muted">
                            {[l.sqft ? `${l.sqft} sq ft` : null, l.floor ? `Floor: ${l.floor}` : null, l.furnished].filter(Boolean).join(' · ')}
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

            {/* TAB 3: FINANCIAL & TOKEN METRICS (RETAINED AS REQUESTED) */}
            {activeSection === 'token' && (
              <div className="flex flex-col gap-6">
                <Card className="flex flex-col gap-3 p-4 xl:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-control font-semibold text-text">Historical Token Valuation</h3>
                      <p className="text-label text-muted">Sample financial model. View only.</p>
                    </div>
                    <div role="group" aria-label="Range" className="flex gap-1.5 max-xl:overflow-hidden">
                      {RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={range === r}
                          onClick={() => setRange(r)}
                          className={cn(
                            'min-h-11 cursor-pointer rounded-control border px-3 text-chip font-semibold xl:min-h-8',
                            range === r ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-text hover:bg-primary-tint',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PriceChart series={tokenSeries} range={range} />
                  <div className="flex justify-between text-overline text-muted">
                    {X_LABELS[range].map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([['1 day', 1.84], ['1 week', 2.1], ['1 month', 4.17], ['1 year', -0.8]] as const).map(([k, p]) => (
                    <Card key={k} className="p-3.5">
                      <div className="text-label text-muted">{k}</div>
                      <Delta pct={p} className="text-h3 font-bold" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Key Specs & Primary Actions */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col p-4">
              <h3 className="mb-2 text-control font-semibold text-text">Society Summary</h3>
              <SpecRow label="Status" value={s.status || 'Ready to Move'} />
              <SpecRow label="Possession" value={s.possession || 'Ready'} />
              <SpecRow label="Total Units" value={s.units ? s.units.toLocaleString('en-IN') : '–'} />
              <SpecRow label="Towers" value={s.towers ?? '–'} />
              <SpecRow label="Acres" value={s.acres ? `${s.acres} acres` : '–'} />
              <SpecRow label="Rental Yield" value={y != null ? `${y.toFixed(1)}% gross` : '–'} />
              <SpecRow label="Lowest Rent" value={rentPriceDisplay} />
              <SpecRow label="Token Network" value="Sepolia Testnet" last />

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to={path('GP-16', { id: s.id })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control border border-line py-2 text-small font-medium text-brand hover:border-line-hover"
                >
                  <ExternalLink className="size-4" /> Open Digital Twin
                </Link>
                <Link
                  to={path('GP-18', { id: s.id })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control border border-line py-2 text-small font-medium text-brand hover:border-line-hover"
                >
                  <Sparkles className="size-4" /> Ask AI about {s.name}
                </Link>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-4">
              <Button
                size="lg"
                block
                variant="secondary"
                aria-pressed={watching}
                onClick={toggleWatch}
                icon={<Star className={cn('size-4', watching && 'fill-current text-warning-ink')} />}
              >
                {watching ? 'On your watchlist' : 'Add to watchlist'}
              </Button>

              <Button size="lg" block to={path('F18-02')}>
                Register interest
              </Button>

              <div className="flex items-center gap-1.5 text-label text-muted">
                <Calendar className="size-3.5" />
                <span>Enquiries sent directly to verified representatives</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
