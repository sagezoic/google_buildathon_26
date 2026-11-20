import { CircleCheck } from 'lucide-react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { RecordId } from '../components/ui/record-id'
import { SEED_ENQUIRIES, UNITS, unitById, type Enquiry } from '../data/fixtures/f11-buyer'
import { BK } from '../lib/buyer-store'
import { useSharedState } from '../lib/shared-state'

/** F12-02 · Enquiry sent. Shows the enquiry in `f12.last`, or the newest one. */
export default function EnquirySent() {
  const [list] = useSharedState<Enquiry[]>(BK.enquiries, SEED_ENQUIRIES)
  const [last] = useSharedState<string>(BK.lastEnquiry, '')
  const enq = list.find((e) => e.id === last) ?? list[0]
  const unit = unitById(enq?.unitId ?? '') ?? UNITS[0]
  const phone = enq?.phone ?? '+91 98765 43210'
  return (
    <Screen id="F12-02" back={path('F12-01')} title="Enquiry sent">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-4 py-6 xl:justify-center xl:py-12">
        <Card className="flex flex-col items-start gap-3 p-6 xl:p-8" role="status">
          <CircleCheck className="size-8 text-success" aria-hidden />
          <h1 className="text-h1 font-semibold max-xl:text-h2">Enquiry sent</h1>
          <p className="text-body text-muted max-xl:hidden">{unit.developer} will reply within 1 working day. We will notify you here and by SMS on {phone}.</p>
          <p className="text-body text-muted xl:hidden">The owner usually replies within 1 day.</p>
          <div className="flex flex-wrap items-center gap-2 xl:hidden"><RecordId id={unit.id} /><span className="text-small">{unit.unit} · {unit.bhk}</span></div>
          <div className="mt-2 flex w-full flex-col gap-2.5 xl:flex-row">
            <Button size="lg" to={path('F12-03')} className="max-xl:hidden xl:h-control">View my enquiries</Button>
            <Button size="lg" variant="secondary" to={`${path('F13-01')}?unit=${unit.id}`} className="xl:h-control">Book a call</Button>
            <Button size="lg" variant="secondary" to={`${path('F09-03')}?unit=${unit.id}`} className="xl:h-control">Back to property</Button>
            <Button size="lg" variant="ghost" to={path('F12-03')} className="xl:hidden">View my enquiries</Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
