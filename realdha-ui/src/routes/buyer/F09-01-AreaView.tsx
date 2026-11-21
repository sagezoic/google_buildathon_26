import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { NEARBY_AREAS, areaByName } from '../../data/fixtures/f09-area'
import OsmMap from '../../components/map/OsmMap'
import OsmMarker from '../../components/map/OsmMarker'

const BANER_CLUSTERS = [
  { n: 24, name: 'Baner Hill Reserve', coord: [73.7820, 18.5535] as [number, number] },
  { n: 18, name: 'Baner Road Corridor', coord: [73.7915, 18.5610] as [number, number] },
  { n: 9, name: 'Pashan-Baner Link', coord: [73.7990, 18.5480] as [number, number] },
  { n: 31, name: 'Balewadi High St Junction', coord: [73.7780, 18.5720] as [number, number] },
  { n: 6, name: 'Mahalunge Border Plots', coord: [73.7650, 18.5630] as [number, number] },
]

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
          {/* Live OpenStreetMap canvas */}
          <div className="relative min-h-[420px] overflow-hidden rounded-card border border-line bg-sunken xl:col-span-8 xl:min-h-[580px]">
            <OsmMap center={[73.7868, 18.5590]} zoom={14} showThemeToggle className="size-full">
              <div className="absolute top-3.5 left-3.5 z-10 rounded-control border border-line bg-surface/90 px-3 py-1.5 text-label font-medium text-text shadow-e1 backdrop-blur-xs">
                Baner Locality Map · Verified Project Clusters & Land Parcels
              </div>

              {/* Cluster Pins on real coordinates */}
              {BANER_CLUSTERS.map((c, i) => (
                <OsmMarker
                  key={i}
                  position={c.coord}
                  onClick={() => navigate(path('F09-02'))}
                >
                  <button
                    type="button"
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-primary text-small font-bold text-on-primary shadow-e2 transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-focus"
                    title={`${c.name} · ${c.n} verified properties`}
                  >
                    {c.n}
                  </button>
                </OsmMarker>
              ))}
            </OsmMap>
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
