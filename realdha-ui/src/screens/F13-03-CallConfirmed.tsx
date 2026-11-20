import { Calendar, Check, Copy, Video } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

/** F13-03 · Confirmation screen for booked call. */
export default function CallConfirmedScreen() {
  const [copied, setCopied] = useState(false)
  const meetUrl = 'meet.example/ra-1804-xyz'

  const copyMeet = () => {
    navigator.clipboard?.writeText('https://' + meetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddToCalendar = () => {
    alert('Call added to your calendar for Tue, 24 Nov 2026 at 11:00 AM IST.')
  }

  return (
    <Screen id="F13-03" back={path('F09-03')} title="Call confirmed">
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-6 px-4 py-8 xl:py-12">
        <Card className="flex flex-col items-start gap-5 p-6 xl:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-success-tint text-success-ink">
            <Check className="size-6" />
          </div>

          <div>
            <h1 className="text-h1 font-bold text-text">Call booked</h1>
            <p className="text-body text-muted">A reminder arrives 1 hour before on WhatsApp and email.</p>
          </div>

          {/* Details callout */}
          <div className="flex w-full flex-col gap-2 rounded-control border border-line bg-canvas p-4 text-small">
            <div className="flex items-center gap-2 font-semibold text-text">
              <Video className="size-4 text-primary" />
              <span>Video call · Tue, 24 Nov 2026, 11:00 IST</span>
            </div>
            <div className="text-muted">
              Baner Heights · A-1804 · Sahyadri Developers (sample)
            </div>
            <div className="flex items-center gap-2 pt-1 font-mono text-small text-primary">
              <span>{meetUrl}</span>
              <button
                type="button"
                onClick={copyMeet}
                className="text-muted hover:text-text"
                title="Copy link"
              >
                {copied ? <Check className="size-3.5 text-success-ink" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button onClick={handleAddToCalendar} icon={<Calendar className="size-4" />}>
              Add to calendar
            </Button>
            <Button variant="secondary" to={`${path('F13-04')}?state=reschedule`}>
              Reschedule
            </Button>
            <Button variant="secondary" to={`${path('F13-04')}?state=cancel`}>
              Cancel call
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
