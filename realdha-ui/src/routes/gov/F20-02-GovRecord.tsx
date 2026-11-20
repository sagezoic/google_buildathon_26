import { Check } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { DEFAULT_RECORD, findRecord } from '../../data/fixtures/f20-gov'
import { Page } from '../parts/f-bits'
import { mono } from '../parts/f-lib'
import { cn } from '../../lib/cn'

export default function GovRecordScreen() {
  const [lookupId] = usePersistentState('gov.lookup.q', DEFAULT_RECORD)
  const record = findRecord(lookupId) ?? findRecord(DEFAULT_RECORD)!

  return (
    <Screen id="F20-02" role="government" back={path('F20-01')} title={record.title}>
      <Page className="max-w-[900px] gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <RecordId id={record.id} copyable />
            <Pill tone="info">Read-only</Pill>
            <SampleData />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" to={path('F20-03')}>
              Check fingerprint
            </Button>
            <Button variant="secondary" to={path('F20-04')}>
              Audit trail
            </Button>
          </div>
        </div>

        <h1 className="text-h1">{record.title}</h1>

        {/* Overview Card */}
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-h2 font-semibold">Overview</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {record.overview.map((item) => (
              <div key={item.k} className="flex flex-col gap-1">
                <span className="text-label text-muted">{item.k}</span>
                <span className="text-body font-semibold text-text">{item.v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Documents Card */}
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-h2 font-semibold">Documents</h2>
          <div className="flex flex-col divide-y divide-line">
            {record.docs.map((doc) => (
              <div key={doc.name} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="font-medium text-text">{doc.name}</span>
                <div className="flex items-center gap-3">
                  <span className={cn(mono, 'text-small text-chain-ink')}>{doc.hash}</span>
                  <Pill tone="success" icon={<Check className="size-3" />}>
                    Fingerprint ✓
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-small text-muted">
          No owner personal data is shown here. The official land register remains the legal record. No edit actions exist in this role.
        </p>
      </Page>
    </Screen>
  )
}
