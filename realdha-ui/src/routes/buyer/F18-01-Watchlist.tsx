import { ArrowRight, Star, Trash2 } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { SEED_WATCHLIST, type WatchlistItem } from '../../data/fixtures/f18-watchlist'
import { cn } from '../../lib/cn'

/** F18-01 · Market Watchlist and empty state. */
export default function WatchlistScreen() {
  const [state, setState] = useDemoState(['items', 'empty'] as const)
  const [items, setItems] = usePersistentState<WatchlistItem[]>('market.watchlistItems', SEED_WATCHLIST)

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const hasItems = state === 'items' && items.length > 0

  return (
    <Screen id="F18-01" back={path('X-01')} title="Watchlist">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Watchlist</h1>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('items')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'items' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · With items
              </button>
              <button
                type="button"
                onClick={() => setState('empty')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'empty' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Empty
              </button>
            </div>
          </div>
        </div>

        {hasItems ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <RecordId id={item.recordId} />
                  <SampleData />
                </div>

                <div className="flex flex-col">
                  <span className="text-h3 font-semibold text-text">{item.name}</span>
                  <span className="text-small text-muted">{item.sub}</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-h2 font-bold text-text">{item.priceLabel}</span>
                  <span className={cn('text-body font-semibold', item.deltaTone === 'up' ? 'text-success-ink' : 'text-danger')}>
                    {item.delta}
                  </span>
                </div>

                <div className="text-small text-muted">
                  Rent yield: {item.yieldLabel}
                </div>

                <div className="flex items-center justify-between border-t border-line pt-3">
                  <Button variant="secondary" size="sm" onClick={() => removeItem(item.id)} icon={<Trash2 className="size-3.5" />}>
                    Remove from watchlist
                  </Button>
                  <Button variant="ghost" size="sm" to={path('F18-02')} icon={<ArrowRight className="size-3.5" />}>
                    Register interest
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-skeleton text-muted">
              <Star className="size-7" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-h2 font-semibold text-text">Nothing on your watchlist yet</h2>
              <p className="max-w-md text-body text-muted">
                Add properties from the Market or search results to follow their prices and updates.
              </p>
            </div>
            <div className="pt-2">
              <Button to={path('GP-21')}>
                Go to Market
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
