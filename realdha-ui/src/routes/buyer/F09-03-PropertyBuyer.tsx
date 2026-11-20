import { Check, Heart, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { BK } from '../../lib/buyer-store'
import { cn } from '../../lib/cn'

/** F09-03 · Single property buyer view (A-1804). */
export default function PropertyBuyerScreen() {
  const [shortlist, setShortlist] = usePersistentState<string[]>(BK.shortlist, ['RA-PUN-001-A-18-04'])
  const isShortlisted = shortlist.includes('RA-PUN-001-A-18-04')

  const toggleShortlist = () => {
    if (isShortlisted) {
      setShortlist(shortlist.filter((id) => id !== 'RA-PUN-001-A-18-04'))
    } else {
      setShortlist([...shortlist, 'RA-PUN-001-A-18-04'])
    }
  }

  return (
    <Screen id="F09-03" back={path('F09-02')} title="A-1804 · Baner Heights">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Breadcrumbs */}
        <div className="text-small text-muted">
          Baner › Baner Heights › <b className="text-text">A-1804</b>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main property details */}
          <div className="flex flex-col gap-6 xl:col-span-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <RecordId id="RA-PUN-001-A-18-04" />
                <SampleData />
              </div>
              <h1 className="text-h1 font-bold text-text">A-1804 · 3 BHK</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="success" icon={<Check className="size-3.5" />}>
                  Signed off
                </Pill>
                <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                  Anchored on-chain
                </Pill>
                <Pill tone="success">Available</Pill>
              </div>
            </div>

            {/* Media Placeholder */}
            <div className="flex h-72 w-full items-center justify-center rounded-card border border-line bg-sunken text-center text-muted">
              Floor plan and 3D walkthrough placeholder
            </div>

            {/* Overview Card */}
            <Card className="flex flex-col gap-4">
              <h2 className="text-h2 font-semibold text-text">Overview</h2>
              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                <div>
                  <span className="text-label text-muted">Carpet area</span>
                  <div className="text-body font-semibold">1,180 sq ft</div>
                </div>
                <div>
                  <span className="text-label text-muted">Facing</span>
                  <div className="text-body font-semibold">East</div>
                </div>
                <div>
                  <span className="text-label text-muted">View</span>
                  <div className="text-body font-semibold">Hill</div>
                </div>
                <div>
                  <span className="text-label text-muted">Floor</span>
                  <div className="text-body font-semibold">18 of 24</div>
                </div>
              </div>
            </Card>

            {/* Verified Documents */}
            <Card className="flex flex-col gap-4">
              <h2 className="text-h2 font-semibold text-text">Documents</h2>
              <div className="flex flex-col divide-y divide-line">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-body font-medium">RERA registration</span>
                  <Pill tone="success">Documents checked</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-body font-medium">Occupancy certificate</span>
                  <Pill tone="success">Documents checked</Pill>
                </div>
              </div>
              <p className="border-t border-line pt-3 text-overline text-muted">
                Documents checked is not a legal opinion. A lawyer signed off on 18 Nov 2026.
              </p>
            </Card>
          </div>

          {/* Sticky sidebar */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Card className="sticky top-6 flex flex-col gap-5 p-6">
              <div className="flex flex-col">
                <span className="text-label text-muted">Price</span>
                <span className="text-h1 font-bold text-text">₹1,42,00,000</span>
                <span className="text-small text-muted">₹12,034 / sq ft · Indicative</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button size="lg" to={`${path('F12-01')}?unit=RA-PUN-001-A-18-04`} icon={<Mail className="size-4" />}>
                  Enquire
                </Button>
                <Button size="lg" variant="secondary" to={`${path('F13-01')}?unit=RA-PUN-001-A-18-04`} icon={<Phone className="size-4" />}>
                  Book a call
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={toggleShortlist}
                  icon={<Heart className={cn('size-4', isShortlisted && 'fill-danger text-danger')} />}
                >
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
              </div>

              <div className="border-t border-line pt-3 text-overline text-muted">
                Listed by Sahyadri Developers (sample). Demo only, not an offer.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
