import { Bell, Check, Mail, MapPin } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistentState } from '../../../app/persist'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'

/** F13-05 · No call slots available state. */
export default function NoSlotsScreen() {
  const [notified, setNotified] = usePersistentState<boolean>('f13.notify', false)

  return (
    <Screen id="F13-05" back={path('F13-01')} title="No slots available">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-8 xl:py-12">
        <div className="text-small text-muted">
          Book a call · A-1804
        </div>
        <h1 className="text-h1 font-bold text-text">Choose a slot</h1>

        <Card className="flex flex-col items-start gap-4 p-6 xl:p-8">
          <Pill tone="neutral">No slots available</Pill>
          <h2 className="text-h2 font-semibold text-text">
            No call slots in the next 14 days
          </h2>
          <p className="text-body text-muted">
            The channel partner for this property has no open slots. You can send an enquiry and they will propose a time.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button to={`${path('F12-01')}?unit=RA-PUN-001-A-18-04`} icon={<Mail className="size-4" />}>
              Send enquiry instead
            </Button>
            <Button
              variant="secondary"
              onClick={() => setNotified(true)}
              icon={notified ? <Check className="size-4 text-success-ink" /> : <Bell className="size-4" />}
            >
              {notified ? 'We will notify you' : 'Notify me when slots open'}
            </Button>
            <Button variant="secondary" to={`${path('F13-01')}?type=site`} icon={<MapPin className="size-4" />}>
              Try site visit
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
