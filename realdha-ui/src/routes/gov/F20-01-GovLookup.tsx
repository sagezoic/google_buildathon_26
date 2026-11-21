import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { DEFAULT_RECORD, findRecord, SEED_RECENT, type GovRecord } from '../../data/fixtures/f20-gov'
import { Page, Resp } from '../parts/f-bits'
import { inputCls, mono } from '../parts/f-lib'
import { cn } from '../../lib/cn'

export default function GovLookup() {
  const [lookupId, setLookupId] = usePersistentState('gov.lookup.q', DEFAULT_RECORD)
  const [record, setRecord] = useState<GovRecord | undefined>(() => findRecord(DEFAULT_RECORD))
  const [searched, setSearched] = useState(true)

  const handleLookup = (idToLookup?: string) => {
    const target = (idToLookup ?? lookupId).trim()
    if (!target) return
    const rec = findRecord(target)
    setRecord(rec)
    setSearched(true)
  }

  const selectRecent = (r: string) => {
    setLookupId(r)
    handleLookup(r)
  }

  return (
    <Screen id="F20-01" role="government" title="Lookup a record">
      <Page className="max-w-[900px] gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-small text-muted">Government body · Maharashtra Revenue (sample)</span>
        </div>

        <h1 className="text-h1"><Resp d="Lookup a record" m="Lookup a record" /></h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLookup()
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="e.g. RA-LON-004-P-112-2"
            aria-label="Record ID"
            className={cn(inputCls, mono, 'h-12 flex-1 border-2 border-primary text-body')}
          />
          <Button type="submit" size="lg" className="h-12">
            Look up
          </Button>
        </form>

        {searched && record && (
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <RecordId id={record.id} copyable />
                  <SampleData />
                </div>
                <h2 className="text-h2 font-semibold text-text">{record.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {record.signedOff && <Pill tone="success" icon={<ShieldCheck className="size-3.5" />}>Signed off</Pill>}
                {record.anchored && <Pill tone="chain">Anchored on-chain</Pill>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button to={path('F20-02')}>
                Open record
              </Button>
              <Button variant="secondary" to={path('F20-03')}>
                Check a fingerprint
              </Button>
            </div>
          </Card>
        )}

        {searched && !record && (
          <Card className="p-6 text-center text-muted">
            No official record found for <span className={cn(mono, 'font-bold')}>{lookupId}</span>. Try{' '}
            <button
              type="button"
              onClick={() => selectRecent(DEFAULT_RECORD)}
              className="font-medium text-primary underline"
            >
              {DEFAULT_RECORD}
            </button>.
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2 text-small text-muted">
          <span>Recent lookups:</span>
          {SEED_RECENT.map((r, i) => (
            <span key={r} className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => selectRecent(r)}
                className={cn(mono, 'cursor-pointer text-primary hover:underline')}
              >
                {r}
              </button>
              {i < SEED_RECENT.length - 1 && <span>,</span>}
            </span>
          ))}
        </div>
      </Page>
    </Screen>
  )
}
