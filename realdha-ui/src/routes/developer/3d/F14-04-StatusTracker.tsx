import { Check, Clock, Eye } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { Timeline, TimelineItem } from '../../../components/ui/timeline'
import { SAMPLE_3D_REQUEST } from '../../../data/fixtures/f14-3d'

/** F14-04 · Request status tracker. */
export default function StatusTrackerScreen() {
  const req = SAMPLE_3D_REQUEST

  return (
    <Screen id="F14-04" role="developer" back={path('F14-01')} title="Request tracker">
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-label text-muted">3D Model Order</span>
            <h1 className="text-h1 font-bold text-text">Request {req.id}</h1>
          </div>
          <Pill tone="info" icon={<Clock className="size-3.5" />}>{req.status}</Pill>
        </div>

        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas p-4 text-small">
            <div className="flex justify-between">
              <span className="text-muted">Target:</span>
              <span className="font-semibold text-text">{req.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Target delivery:</span>
              <span className="font-semibold text-text">{req.deadline}</span>
            </div>
          </div>

          <Timeline>
            {req.timeline.map((step, idx) => {
              const isLast = idx === req.timeline.length - 1
              return (
                <TimelineItem
                  key={step.title}
                  last={isLast}
                  marker={
                    <div
                      className={`flex size-7 items-center justify-center rounded-full text-small font-semibold ${
                        step.status === 'done'
                          ? 'bg-success-ink text-surface'
                          : step.status === 'active'
                          ? 'border-2 border-primary bg-primary-tint text-primary'
                          : 'border border-line bg-surface text-muted'
                      }`}
                    >
                      {step.status === 'done' ? <Check className="size-4" /> : idx + 1}
                    </div>
                  }
                >
                  <div className="flex items-center justify-between rounded-control border border-line bg-surface p-3">
                    <span className="text-small font-semibold text-text">{step.title}</span>
                    <span className="font-mono text-overline text-muted">{step.date}</span>
                  </div>
                </TimelineItem>
              )
            })}
          </Timeline>

          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="secondary" to={path('F15-01')}>
              Back to dashboard
            </Button>
            <Button to={path('F14-05')} icon={<Eye className="size-3.5" />}>
              Preview latest draft
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
