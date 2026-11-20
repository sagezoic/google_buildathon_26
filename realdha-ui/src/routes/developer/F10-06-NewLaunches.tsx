import { ChevronDown, MapPin, Sparkles } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'

interface LaunchCard {
  id: string
  name: string
  locality: string
  priceRange: string
  status: string
  launchedDate: string
  desc: string
}

const LAUNCHES: LaunchCard[] = [
  {
    id: 'RA-PUN-007-A',
    name: 'Skyline Residency',
    locality: 'Baner, Pune',
    priceRange: '₹92 L to ₹1.4 Cr',
    status: 'Documents checked',
    launchedDate: '18 Nov 2026',
    desc: '2 and 3 BHK modern apartments with clubhouse and pool.',
  },
  {
    id: 'RA-PUN-001',
    name: 'Baner Heights',
    locality: 'Baner, Pune',
    priceRange: '₹1.15 Cr to ₹1.9 Cr',
    status: 'Documents checked',
    launchedDate: '20 Nov 2026',
    desc: 'Premium high-rise towers overlooking Baner hills.',
  },
  {
    id: 'RA-PUN-004-A',
    name: 'Wakad Greens',
    locality: 'Wakad, Pune',
    priceRange: '₹59 L to ₹89 L',
    status: 'Documents checked',
    launchedDate: '15 Nov 2026',
    desc: '1 and 2 BHK compact homes close to Hinjewadi IT park.',
  },
]

/** F10-06 · New launches buyer discovery feed. */
export default function NewLaunchesScreen() {
  return (
    <Screen id="F10-06" role="buyer" back={path('X-01')} title="New launches">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">New launches</h1>
            <p className="text-body text-muted">
              Recently published verified developments with direct developer pricing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              City: Pune
            </Button>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Budget
            </Button>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              BHK
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {LAUNCHES.map((launch) => (
            <Card key={launch.id} className="flex flex-col overflow-hidden p-0">
              <div className="flex h-44 w-full items-center justify-center bg-sunken text-small text-muted">
                Project image placeholder
              </div>

              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <Pill tone="brand" icon={<Sparkles className="size-3.5" />}>
                    New launch
                  </Pill>
                  <Pill tone="success">{launch.status}</Pill>
                </div>

                <div className="flex flex-col">
                  <span className="text-h3 font-bold text-text">{launch.name}</span>
                  <div className="flex items-center gap-1 text-small text-muted">
                    <MapPin className="size-3.5" />
                    <span>{launch.locality}</span>
                  </div>
                </div>

                <div className="text-h2 font-bold text-primary">
                  {launch.priceRange}
                </div>

                <p className="text-small text-muted">
                  {launch.desc}
                </p>

                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="text-overline text-muted">Launched {launch.launchedDate}</span>
                  <Button size="sm" to={path('F10-07')}>
                    View project
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Screen>
  )
}
