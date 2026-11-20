import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { RecordId, SampleData } from '../components/ui/record-id'
import { Timeline, TimelineItem } from '../components/ui/timeline'
import { OWNERSHIP_HISTORY } from '../data/fixtures/f04-twin'

/** F04-02 · Ownership history for A-1804. */
export default function OwnershipHistoryScreen() {
  return (
    <Screen id="F04-02" back={path('F04-01')} title="Ownership history">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-col gap-1">
          <Link
            to={path('F04-01')}
            className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline"
          >
            <ArrowLeft className="size-4" />
            <span>A-1804 · 3 BHK · RA-PUN-001-A-18-04</span>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-h1 font-semibold text-text">Ownership history</h1>
            <div className="flex items-center gap-2">
              <RecordId id="RA-PUN-001-A-18-04" />
              <SampleData />
            </div>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <Timeline>
            {OWNERSHIP_HISTORY.map((entry, idx) => {
              const isLast = idx === OWNERSHIP_HISTORY.length - 1
              return (
                <TimelineItem
                  key={entry.id}
                  last={isLast}
                  marker={
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-small font-semibold ${
                        entry.isCurrent
                          ? 'bg-primary text-on-primary ring-4 ring-primary-tint'
                          : 'border-2 border-line-strong bg-surface text-muted'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  }
                >
                  <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas p-4.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-h3 font-semibold text-text">{entry.name}</span>
                        {entry.isCurrent && <Pill tone="success">Current owner</Pill>}
                      </div>
                      <span className="text-small font-medium text-muted">{entry.period}</span>
                    </div>

                    <p className="text-body text-text">{entry.note}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-small">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-muted">
                          <FileText className="size-4" />
                          <b>{entry.docName}</b> ({entry.docPages})
                        </span>
                        <span className="font-mono text-chip text-muted">{entry.hash}</span>
                      </div>
                      {entry.verified && (
                        <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                          Fingerprint ✓
                        </Pill>
                      )}
                    </div>
                  </div>
                </TimelineItem>
              )
            })}
          </Timeline>
        </Card>

        <div className="flex justify-between items-center text-small text-muted border-t border-line pt-4">
          <span>Official Land Registry record verification is valid for Pune District.</span>
          <Button variant="secondary" to={path('F04-03')} size="sm">
            View original deed
          </Button>
        </div>
      </div>
    </Screen>
  )
}
