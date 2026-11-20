import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import { type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Delta } from '../../components/ui/market'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { MOBILE_TICKERS, RANGES, TICKERS, WATCHLIST_IDS, X_LABELS, seriesFor, type Range } from '../../data/fixtures/market'
import { cn } from '../../lib/cn'


function Row({ k, children, last }: { k: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 text-small', !last && 'border-b border-line')}>
      <span className="text-label text-muted">{k}</span>
      <span className="font-semibold">{children}</span>
    </div>
  )
}

function PriceChart({ series, range }: { series: number[]; range: Range }) {
  const lo = Math.floor(Math.min(...series)), hi = Math.ceil(Math.max(...series)), x0 = 90, x1 = 790, y0 = 20, y1 = 130
  const x = (i: number) => x0 + (i * (x1 - x0)) / (series.length - 1)
  const y = (v: number) => y1 - ((v - lo) / (hi - lo || 1)) * (y1 - y0)
  const pts = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const fmt = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`
  const span: Record<Range, string> = { '1D': 'today', '1W': 'the last week', '1M': 'the last month', '1Y': 'the last year', All: 'all time' }
  return (
    <svg viewBox="0 0 880 150" role="img" aria-label={`Price over ${span[range]}, from ${fmt(series[0])} to ${fmt(series[series.length - 1])}. Sample data.`} className="h-auto w-full">
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

/** GP-22 · Market detail. Rent yield shows a dash for non-income assets. View only. */
export default function MarketDetail() {
  const [params] = useSearchParams()
  const [range, setRange] = usePersistentState<Range>('market.range', '1M')
  const [watch, setWatch] = usePersistentState<string[]>('market.watchlist', WATCHLIST_IDS)
  const t = TICKERS.find((x) => x.id === params.get('id')) ?? TICKERS[0]
  const m = MOBILE_TICKERS.find((x) => t.id.startsWith(x.id))
  const [city, kind] = t.meta.split(' · ')
  const price = parseFloat(t.price.replace(/,/g, ''))
  const series = seriesFor(t.id, price, range)
  const watching = watch.includes(t.id)
  const toggleWatch = () => setWatch((w) => (w.includes(t.id) ? w.filter((x) => x !== t.id) : [...w, t.id]))
  const isPlot = kind === 'Plot'
  const watchBtn = (cls?: string) => (
    <Button size="lg" block variant="secondary" aria-pressed={watching} onClick={toggleWatch} className={cls} icon={<Star className={cn('size-4', watching && 'fill-current')} aria-hidden />}>
      {watching ? 'On your watchlist' : 'Add to watchlist'}
    </Button>
  )
  const buttons = (
    <>
      <Button size="lg" block variant="secondary" to={path('GP-16')} className="xl:hidden" icon={<ExternalLink className="size-4" aria-hidden />}>Open Digital Twin</Button>
      {watchBtn()}
      <Button size="lg" block to={path('F18-02')}>Register interest</Button>
    </>
  )
  return (
    <Screen id="GP-22">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        <div className="flex items-center justify-between gap-3 rounded-control border border-demo-line bg-demo p-2.5 text-demo-ink xl:rounded-[10px] xl:border-2 xl:px-5">
          <div className="text-chip font-semibold xl:text-body xl:font-bold xl:tracking-[0.04em]">
            <span className="xl:hidden">Sample data. View only.</span>
            <span className="max-xl:hidden">View only. No buying or selling.</span>
          </div>
          <div className="flex items-center gap-3 text-chip text-text max-xl:hidden"><SampleData /></div>
        </div>

        <Link to={path('GP-21')} className="inline-flex min-h-11 items-center gap-1 text-chip text-muted no-underline max-xl:hidden xl:min-h-0">
          <ArrowLeft className="size-3.5" aria-hidden />Market
        </Link>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <RecordId id={t.id} />
                <Pill tone="chain" className="max-xl:hidden">Anchored on-chain</Pill>
                <Pill tone="info" className="xl:hidden">Sample data</Pill>
              </div>
              <h1 className="mt-2 text-h1">
                <span className="xl:hidden">{m?.name ?? t.name}</span>
                <span className="max-xl:hidden">{t.name}</span>
              </h1>
              <div className="text-small text-muted max-xl:hidden">{city} · {kind} · 1,000 test units</div>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3.5">
              <span className="text-h1 tabular xl:text-display">
                <span className="xl:hidden">₹{m?.price ?? t.price}</span>
                <span className="max-xl:hidden">₹ {t.price}</span>
              </span>
              <span className="text-chip xl:hidden"><Delta pct={m?.pct ?? t.pct} digits={1} /></span>
              <span className="text-h3 max-xl:hidden"><Delta pct={t.pct} suffix=" today" /></span>
            </div>

            <Card className="flex flex-col gap-3 p-4 xl:p-6">
              <div className="flex items-center justify-between">
                <div role="group" aria-label="Range" className="flex gap-1.5 max-xl:overflow-hidden">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={range === r}
                      onClick={() => setRange(r)}
                      className={cn('min-h-11 cursor-pointer rounded-control border px-3.5 text-chip font-semibold xl:min-h-9', range === r ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-text hover:bg-primary-tint')}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <span className="text-label text-muted max-xl:hidden">Sample data</span>
              </div>
              <PriceChart series={series} range={range} />
              <div className="flex justify-between text-overline text-muted max-xl:hidden">
                {X_LABELS[range].map((l) => <span key={l}>{l}</span>)}
              </div>
            </Card>

            <div className="grid grid-cols-4 gap-3 max-xl:hidden">
              {([['1 day', 1.84], ['1 week', 2.1], ['1 month', 4.17], ['1 year', -0.8]] as const).map(([k, p]) => (
                <Card key={k} className="p-3.5">
                  <div className="text-label text-muted">{k}</div>
                  <Delta pct={p} className="text-h3" />
                </Card>
              ))}
            </div>
            <Card className="flex flex-col gap-3 p-4 xl:hidden">
              <div className="grid grid-cols-2 gap-3">
                {[['1 day', '+0.3%'], ['1 week', '+1.1%'], ['1 month', '+2.4%'], ['Rent yield', '—']].map(([k, v]) => (
                  <div key={k}><div className="text-label text-muted">{k}</div><div className="text-small font-semibold">{v}</div></div>
                ))}
              </div>
              <p className="text-label text-muted">Yield shows a dash for non-income assets.</p>
            </Card>
            <div className="flex flex-col gap-4 xl:hidden">{buttons}</div>
          </div>

          <div className="flex w-[400px] flex-none flex-col gap-4 max-xl:hidden">
            <Card>
              <Row k="Rent yield" last={isPlot}><span aria-label="Not applicable">—</span></Row>
              {isPlot && <p className="-mt-1.5 border-b border-line pb-3 text-label text-muted">Not applicable: this plot does not earn rent.</p>}
              <Row k="Unit price">₹ {t.price}</Row>
              <Row k="Total units">1,000</Row>
              <Row k="Fund partner"><span className="font-normal">[Fund partner name]</span></Row>
              <Row k="Network" last><span className="font-normal">Sepolia testnet</span></Row>
              <Link to={path('GP-16')} className="mt-2 inline-flex items-center gap-1 text-small font-medium">Open Digital Twin <ExternalLink className="size-3.5" aria-hidden /></Link>
            </Card>
            <Card className="flex flex-col gap-3.5">
              {watchBtn()}
              <Button size="lg" block to={path('F18-02')}>Register interest</Button>
              <p className="text-label text-muted">Registering interest only tells the owner you'd like to hear more. It is not an order or a commitment.</p>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
