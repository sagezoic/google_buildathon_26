import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import { SEED_WATCHLIST, type WatchlistItem } from '../../data/fixtures/f18-watchlist'
import { getPropertyThumbnail } from '../../data/property-images'
import { cn } from '../../lib/cn'

function StatusBadge({ status }: { status: string }) {
  const isChain = /anchor|chain|on-chain/i.test(status)
  const isSigned = /signed/i.test(status)

  if (isChain) {
    return (
      <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
        {status}
      </Pill>
    )
  }
  if (isSigned) {
    return (
      <Pill tone="success" icon={<CheckCircle2 className="size-3.5" />}>
        {status}
      </Pill>
    )
  }
  return <Pill tone="neutral">{status}</Pill>
}

/** F18-01 · Market Watchlist and portfolio price monitoring. */
export default function WatchlistScreen() {
  const [state] = useDemoState(['items', 'empty'] as const)
  const [items, setItems] = usePersistentState<WatchlistItem[]>('market.watchlistItems', SEED_WATCHLIST)
  const [viewMode, setViewMode] = usePersistentState<'list' | 'grid'>('market.watchlistView', 'list')

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const resetWatchlist = () => {
    setItems(SEED_WATCHLIST)
  }

  const hasItems = state === 'items' && items.length > 0
  const anchoredCount = items.filter((i) => /anchor|chain/i.test(i.status)).length

  return (
    <Screen id="F18-01" back={path('X-01')} title="Watchlist">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Header banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Watchlist</h1>
            <p className="text-small text-muted">
              Track real-time valuations, rental yield rates, and cryptographic verification status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div
              role="radiogroup"
              aria-label="View mode"
              className="flex items-center rounded-control border border-line bg-surface p-0.5 text-chip font-medium shadow-2xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-control transition-colors',
                  viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                )}
              >
                <List className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-control transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                )}
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            <Button variant="secondary" size="sm" to={path('GP-21')} icon={<Plus className="size-3.5" />}>
              <span className="hidden sm:inline">Add property</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Portfolio stats strip */}
        {hasItems && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-control border border-line bg-surface px-4 py-2.5 shadow-2xs">
              <span className="text-label text-muted">Saved properties</span>
              <div className="mt-0.5 text-body font-semibold text-text">{items.length} assets</div>
            </div>
            <div className="rounded-control border border-line bg-surface px-4 py-2.5 shadow-2xs">
              <span className="text-label text-muted">Cryptographic status</span>
              <div className="mt-0.5 flex items-center gap-1.5 text-body font-semibold text-text">
                <ShieldCheck className="size-4 text-chain-ink" />
                <span>{anchoredCount} on-chain</span>
              </div>
            </div>
            <div className="col-span-2 rounded-control border border-line bg-surface px-4 py-2.5 shadow-2xs sm:col-span-1">
              <span className="text-label text-muted">Monitoring mode</span>
              <div className="mt-0.5 flex items-center gap-1.5 text-body font-semibold text-success-ink">
                <span className="size-2 rounded-full bg-success-ink animate-pulse" />
                <span>Live updates</span>
              </div>
            </div>
          </div>
        )}

        {/* Items container */}
        {hasItems ? (
          viewMode === 'list' ? (
            /* List View: Ergonomic row cards sized strictly to content */
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const thumb = getPropertyThumbnail(item.recordId, item.type)
                return (
                  <Card
                    key={item.id}
                    className="group flex flex-col sm:flex-row overflow-hidden p-0 shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2"
                  >
                    {/* Thumbnail: Controlled proportional dimension */}
                    <div className="relative w-full sm:w-56 md:w-64 lg:w-72 shrink-0 bg-sunken h-44 sm:h-auto min-h-[150px] overflow-hidden">
                      <img
                        src={thumb}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <RecordId id={item.recordId} className="bg-surface/90 backdrop-blur-xs font-mono text-label" />
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 sm:hidden">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    {/* Content: sized strictly to fit */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-3.5">
                      {/* Identity header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`${path('F09-03')}?id=${item.recordId}`}
                            className="text-body font-semibold text-text hover:text-brand transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-small text-muted">{item.sub}</p>
                        </div>
                        <div className="hidden sm:block shrink-0">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>

                      {/* Financial metrics */}
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <span className="text-h2 font-bold text-text tracking-tight">{item.priceLabel}</span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-label font-semibold',
                            item.deltaTone === 'up'
                              ? 'bg-success-tint text-success-ink'
                              : item.deltaTone === 'down'
                              ? 'bg-danger-tint text-danger-ink'
                              : 'bg-skeleton text-muted'
                          )}
                        >
                          {item.deltaTone === 'up' ? (
                            <TrendingUp className="size-3.5" aria-hidden />
                          ) : item.deltaTone === 'down' ? (
                            <TrendingDown className="size-3.5" aria-hidden />
                          ) : null}
                          {item.delta}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-pill border border-line bg-sunken px-2.5 py-0.5 text-label text-muted">
                          Rent yield: <strong className="font-semibold text-text">{item.yieldLabel}</strong>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          icon={<Trash2 className="size-3.5 text-muted hover:text-danger-ink" />}
                          className="text-muted hover:text-danger-ink hover:bg-danger-tint/30"
                        >
                          Remove
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            to={`${path('F09-03')}?id=${item.recordId}`}
                            icon={<ExternalLink className="size-3.5" />}
                          >
                            View passport
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            to={path('F18-02')}
                            icon={<ArrowRight className="size-3.5" />}
                          >
                            Register interest
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Grid View: Compact cards with controlled photo height */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const thumb = getPropertyThumbnail(item.recordId, item.type)
                return (
                  <Card
                    key={item.id}
                    className="group flex flex-col overflow-hidden p-0 shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2"
                  >
                    {/* Fixed compact image height */}
                    <div className="relative h-40 w-full overflow-hidden bg-sunken">
                      <img
                        src={thumb}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <RecordId id={item.recordId} className="bg-surface/90 backdrop-blur-xs font-mono text-label" />
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    {/* Compact card body */}
                    <div className="flex flex-1 flex-col justify-between p-4 gap-3">
                      <div>
                        <Link
                          to={`${path('F09-03')}?id=${item.recordId}`}
                          className="text-body font-semibold text-text hover:text-brand transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-chip text-muted">{item.sub}</p>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                        <div>
                          <span className="text-h3 font-bold text-text">{item.priceLabel}</span>
                          <div className="text-chip text-muted">
                            Yield: <span className="font-medium text-text">{item.yieldLabel}</span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 text-chip font-semibold',
                            item.deltaTone === 'up'
                              ? 'bg-success-tint text-success-ink'
                              : item.deltaTone === 'down'
                              ? 'bg-danger-tint text-danger-ink'
                              : 'bg-skeleton text-muted'
                          )}
                        >
                          {item.deltaTone === 'up' ? (
                            <TrendingUp className="size-3" aria-hidden />
                          ) : item.deltaTone === 'down' ? (
                            <TrendingDown className="size-3" aria-hidden />
                          ) : null}
                          {item.delta}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-line pt-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          icon={<Trash2 className="size-3.5 text-muted hover:text-danger-ink" />}
                          className="text-muted hover:text-danger-ink"
                        >
                          <span className="sr-only">Remove {item.name}</span>
                        </Button>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            to={`${path('F09-03')}?id=${item.recordId}`}
                          >
                            Passport
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            to={path('F18-02')}
                            icon={<ArrowRight className="size-3.5" />}
                          >
                            Interest
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        ) : (
          /* Empty state */
          <Card className="flex flex-col items-center gap-4 py-16 text-center shadow-e1">
            <div className="flex size-14 items-center justify-center rounded-full bg-skeleton text-muted">
              <Star className="size-7" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-h2 font-semibold text-text">Nothing on your watchlist yet</h2>
              <p className="max-w-md text-body text-muted">
                Save properties from the marketplace or explorer to monitor prices, rental returns, and on-chain
                verification updates in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button to={path('GP-21')}>Explore Market</Button>
              <Button variant="secondary" onClick={resetWatchlist} icon={<RotateCcw className="size-3.5" />}>
                Reset demo watchlist
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
