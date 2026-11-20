import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { NEARBY_AREAS, areaByName } from '../../data/fixtures/f09-area'
import { cn } from '../../lib/cn'

/** F09-01 · Area view, map clusters and stats. */
export default function AreaViewScreen() {
  const navigate = useNavigate()
  const area = areaByName('Baner')
  const nearby = NEARBY_AREAS['Baner'] ?? []

  return (
    <Screen id="F09-01" back={path('F08-01')} title="Baner, Pune">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-1">
          <div className="text-small text-muted">
            India › Maharashtra › Pune › <b className="text-text">Baner</b>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <h1 className="text-h1 font-semibold text-text">Baner, Pune</h1>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <span className="rounded-[4px] bg-primary px-3.5 py-1.5 text-on-primary">
                Map
              </span>
              <button
                type="button"
                onClick={() => navigate(path('F09-02'))}
                className="rounded-[4px] px-3.5 py-1.5 text-muted hover:text-text"
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Map & Stats Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Map canvas */}
          <div className="relative min-h-[420px] overflow-hidden rounded-card border border-line bg-sunken xl:col-span-8 xl:min-h-[580px]">
            <div className="absolute top-3 left-3 z-10 rounded-[6px] border border-line bg-surface/90 px-3 py-1 text-overline text-muted backdrop-blur-sm">
              Map placeholder · clusters show number of records
            </div>

            {/* Simulated map background lines */}
            <svg className="absolute inset-0 size-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="none">
              <path d="M50 50 Q200 300 400 200 T800 500" stroke="currentColor" strokeWidth="4" fill="none" className="text-line" />
              <path d="M100 550 Q300 400 500 450 T750 100" stroke="currentColor" strokeWidth="3" fill="none" className="text-line" />
              <path d="M400 50 L400 550" stroke="currentColor" strokeWidth="2" fill="none" className="text-line" />
            </svg>

            {/* Cluster Pins */}
            {area.clusters.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(path('F09-02'))}
                className={cn(
                  'absolute z-20 flex size-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-small font-bold text-on-primary shadow-e2 transition-transform hover:scale-110',
                  c.pos
                )}
                title={`Cluster with ${c.n} properties`}
              >
                {c.n}
              </button>
            ))}
          </div>

          {/* Right Rail: Stats & Nearby */}
          <div className="flex flex-col gap-6 xl:col-span-4">
            <Card className="flex flex-col gap-4 p-5 xl:p-6">
              <div className="text-overline font-semibold uppercase tracking-wider text-muted">
                Baner · Pune
              </div>
              <div className="flex flex-col">
                <span className="text-label text-muted">Average price</span>
                <span className="text-h1 font-bold text-text">₹{area.avgPrice.toLocaleString('en-IN')} / sq ft</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                <div>
                  <span className="text-label text-muted">Checked records</span>
                  <div className="text-h2 font-semibold text-text">{area.checked}</div>
                </div>
                <div>
                  <span className="text-label text-muted">New launches</span>
                  <div className="text-h2 font-semibold text-text">{area.newLaunches}</div>
                </div>
              </div>

              <p className="text-overline text-muted">
                Checked = documents checked. Sample data.
              </p>

              <div className="pt-2">
                <Button to={path('F09-02')} className="w-full">
                  Browse all {area.checked} records in Baner
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <span className="text-body font-semibold text-text">Also nearby</span>
              <div className="flex flex-col divide-y divide-line">
                {nearby.map((loc) => {
                  const locData = areaByName(loc)
                  return (
                    <div key={loc} className="flex items-center justify-between py-2 text-small">
                      <span className="font-medium text-text">{loc}</span>
                      <span className="font-mono text-muted">₹{locData.avgPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
