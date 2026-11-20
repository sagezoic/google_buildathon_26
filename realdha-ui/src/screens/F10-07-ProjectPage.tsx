import { Building, Heart, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { RecordId, SampleData } from '../components/ui/record-id'

/** F10-07 · Project page (buyer view). */
export default function ProjectPageScreen() {
  return (
    <Screen id="F10-07" role="buyer" back={path('F10-06')} title="Baner Heights">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Project Hero banner */}
        <div className="relative h-64 w-full overflow-hidden rounded-card border border-line bg-sunken flex items-center justify-center text-center text-muted xl:h-80">
          Project hero image placeholder
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main Info */}
          <div className="flex flex-col gap-6 xl:col-span-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <RecordId id="RA-PUN-001" />
                <SampleData />
                <Pill tone="brand" icon={<Sparkles className="size-3.5" />}>New launch</Pill>
              </div>

              <h1 className="text-h1 font-bold text-text">Baner Heights</h1>
              <p className="text-body text-muted">
                Baner, Pune · Sahyadri Developers · RERA P52100012345 (sample) · Possession Dec 2027
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button variant="secondary" size="sm" icon={<Heart className="size-3.5" />}>
                Shortlist
              </Button>
              <Button variant="secondary" size="sm" to={path('F11-03')} icon={<MessageSquare className="size-3.5" />}>
                Ask AI about this project
              </Button>
            </div>

            <Card className="flex flex-col gap-4">
              <h2 className="text-h2 font-semibold text-text">About the project</h2>
              <p className="text-body text-muted">
                Baner Heights is an expansive 3-tower luxury residential complex situated at the base of the Baner Hill Reserve. Designed with optimal natural cross-ventilation, expansive private balconies, and Vaastu-compliant entries.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                <div>
                  <span className="text-label text-muted">Towers</span>
                  <div className="text-body font-semibold">3 (A, B, C)</div>
                </div>
                <div>
                  <span className="text-label text-muted">Total Units</span>
                  <div className="text-body font-semibold">336 units</div>
                </div>
                <div>
                  <span className="text-label text-muted">Floor Range</span>
                  <div className="text-body font-semibold">1 to 24</div>
                </div>
                <div>
                  <span className="text-label text-muted">Clubhouse</span>
                  <div className="text-body font-semibold">6,000 sq ft</div>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <h2 className="text-h2 font-semibold text-text">Verified Title & Compliance</h2>
              <div className="flex flex-col divide-y divide-line">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-small font-medium">MahaRERA Registration</span>
                  <Pill tone="success" icon={<ShieldCheck className="size-3.5" />}>Verified</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-small font-medium">Building Layout Sanction</span>
                  <Pill tone="success" icon={<ShieldCheck className="size-3.5" />}>PMC Approved</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-small font-medium">Commencement Certificate</span>
                  <Pill tone="success" icon={<ShieldCheck className="size-3.5" />}>Verified</Pill>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Rail: Action card */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Card className="sticky top-6 flex flex-col gap-5 p-6">
              <div className="flex flex-col">
                <span className="text-label text-muted">Starting from</span>
                <span className="text-h1 font-bold text-text">₹1.15 Cr to ₹1.9 Cr</span>
                <span className="text-small text-muted">2 & 3 BHK units available</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button size="lg" to={path('F10-08')} icon={<Building className="size-4" />}>
                  Choose a unit (Stack picker)
                </Button>
                <Button size="lg" variant="secondary" to={`${path('F13-01')}?unit=RA-PUN-001-A-18-04`}>
                  Book a sales visit
                </Button>
              </div>

              <div className="border-t border-line pt-3 text-overline text-muted">
                Listed by Sahyadri Developers (sample). All unit bookings subject to confirmation.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
