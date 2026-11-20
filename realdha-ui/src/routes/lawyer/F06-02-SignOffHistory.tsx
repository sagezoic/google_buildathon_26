import { ArrowLeft, Check, Clock, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { Timeline, TimelineItem } from '../../components/ui/timeline'
import { SIGN_OFF_HISTORY } from '../../data/fixtures/f06-lawyer'

/** F06-02 · Signed-off history for A-1804. */
export default function SignOffHistoryScreen() {
  return (
    <Screen id="F06-02" role="lawyer" back={path('F04-01')} title="Sign-off history">
      <div className="mx-auto flex w-full max-w-[840px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-col gap-1">
          <Link to={path('F04-01')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>A-1804 · 3 BHK · RA-PUN-001-A-18-04</span>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-h1 font-semibold text-text">Sign-off history</h1>
            <div className="flex items-center gap-2">
              <RecordId id="RA-PUN-001-A-18-04" />
              <SampleData />
            </div>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <Timeline>
            {SIGN_OFF_HISTORY.map((item, idx) => {
              const isLast = idx === SIGN_OFF_HISTORY.length - 1
              return (
                <TimelineItem
                  key={item.id}
                  last={isLast}
                  marker={
                    <div className="flex size-7 items-center justify-center rounded-full bg-surface border-2 border-line">
                      {item.statusTone === 'success' ? (
                        <Check className="size-4 text-success-ink" />
                      ) : item.statusTone === 'chain' ? (
                        <ShieldCheck className="size-4 text-chain-ink" />
                      ) : (
                        <Clock className="size-4 text-muted" />
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col gap-1.5 rounded-control border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-h3 font-semibold text-text">{item.title}</span>
                        <Pill tone={item.statusTone}>{item.title}</Pill>
                      </div>
                      <span className="font-mono text-small text-muted">{item.timestamp}</span>
                    </div>

                    <div className="text-small font-medium text-text">{item.actor}</div>
                    <p className="text-small text-muted">{item.details}</p>
                  </div>
                </TimelineItem>
              )
            })}
          </Timeline>
        </Card>
      </div>
    </Screen>
  )
}
