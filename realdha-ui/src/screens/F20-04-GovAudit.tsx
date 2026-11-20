import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal } from '../components/ui/modal'
import { Pill } from '../components/ui/pill'
import { GOV_EVENTS_BASE, type GovEvent } from '../data/fixtures/f20-gov'
import { downloadBlob, makePdf } from '../lib/mini-pdf'
import { Page, Resp } from './parts/f-bits'
import { mono, toCsv } from './parts/f-lib'
import { cn } from '../lib/cn'

export default function GovAudit() {
  const [params, setParams] = useSearchParams()
  const modalOpen = params.get('state') === 'export'
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf')

  const openExport = () => {
    setParams((p) => {
      const n = new URLSearchParams(p)
      n.set('state', 'export')
      return n
    }, { replace: true })
  }

  const closeExport = () => {
    setParams((p) => {
      const n = new URLSearchParams(p)
      n.delete('state')
      return n
    }, { replace: true })
  }

  const handleDownload = () => {
    if (format === 'pdf') {
      const lines = [
        'REALDHA - OFFICIAL GOVERNMENT AUDIT TRAIL',
        'Record: RA-LON-004-P-112-2',
        'Subject: Kusgaon NA plot · Gat 112/2',
        `Generated: ${new Date().toLocaleDateString('en-GB')}`,
        '',
        'EVENTS:',
        ...GOV_EVENTS_BASE.map((e) => `${e.time} | ${e.event} | ${e.record} | ${e.tx} | ${e.actor}`),
      ]
      const blob = makePdf(lines)
      downloadBlob(blob, 'audit-RA-LON-004-P-112-2.pdf')
    } else {
      const csv = toCsv([
        ['Time', 'Event', 'Record', 'Transaction', 'Actor'],
        ...GOV_EVENTS_BASE.map((e) => [e.time, e.event, e.record, e.tx, e.actor]),
      ])
      downloadBlob(new Blob([csv], { type: 'text/csv' }), 'audit-RA-LON-004-P-112-2.csv')
    }
    closeExport()
  }

  return (
    <Screen id="F20-04" role="government" back={path('F20-02')} title="Audit trail · RA-LON-004-P-112-2">
      <Page className="max-w-[900px] gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-h1"><Resp d="Audit trail · RA-LON-004-P-112-2" m="Audit trail" /></h1>
            <p className="text-small text-muted xl:hidden">Read-only</p>
          </div>
          <Button variant="secondary" onClick={openExport} icon={<Download className="size-4" />}>
            Export
          </Button>
        </div>

        {/* Desktop/Tablet Table */}
        <Card className="hidden overflow-hidden p-0 md:block">
          <table className="w-full border-collapse text-small">
            <thead>
              <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                <th scope="col" className="px-4 py-2.5 font-semibold">Time</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Event</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Record</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {GOV_EVENTS_BASE.map((e: GovEvent) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 whitespace-nowrap">{e.time}</td>
                  <td className="px-4 py-3 font-medium text-text">{e.event}</td>
                  <td className="px-4 py-3">{e.record}</td>
                  <td className="px-4 py-3">
                    {e.tx !== '—' ? (
                      <span className={cn(mono, 'text-chain-ink')}>{e.tx}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Mobile Timeline View (matches M-F20-04) */}
        <Card className="flex flex-col gap-4 p-5 md:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Pill tone="chain" className="p-1"><FileText className="size-3" /></Pill>
                <div className="my-1 w-0.5 flex-1 bg-line" />
              </div>
              <div className="pb-3">
                <div className="font-semibold text-text">Fingerprint verified</div>
                <div className="text-label text-muted">20 Nov 2026, 15:02</div>
                <div className="text-small text-muted">Revenue Dept, officer R. Joshi</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Pill tone="neutral" className="p-1"><FileText className="size-3" /></Pill>
                <div className="my-1 w-0.5 flex-1 bg-line" />
              </div>
              <div className="pb-3">
                <div className="font-semibold text-text">Record viewed</div>
                <div className="text-label text-muted">20 Nov 2026, 14:55</div>
                <div className="text-small text-muted">Revenue Dept, officer R. Joshi</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Pill tone="chain" className="p-1"><FileText className="size-3" /></Pill>
              </div>
              <div>
                <div className="font-semibold text-text">Anchor confirmed</div>
                <div className="text-label text-muted">18 Nov 2026, 11:04</div>
                <div className="text-small text-muted">3 fingerprints</div>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => {
              const blob = makePdf([
                'REALDHA - OFFICIAL GOVERNMENT AUDIT TRAIL',
                'Record: RA-LON-004-P-112-2',
                'Generated: 20 Nov 2026',
                '',
                ...GOV_EVENTS_BASE.map((e) => `${e.time} | ${e.event} | ${e.record} | ${e.tx}`),
              ])
              downloadBlob(blob, 'audit-RA-LON-004-P-112-2.pdf')
            }}
          >
            Download audit PDF
          </Button>
        </Card>

        {/* Export Modal / Dialog */}
        <Modal
          open={modalOpen}
          onOpenChange={(open) => { if (!open) closeExport() }}
          title="Export audit trail"
        >
          <div className="flex flex-col gap-4">
            <div className="inline-flex rounded-control border border-line bg-field p-0.5 text-small">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={cn('rounded px-4 py-1.5 font-medium transition', format === 'csv' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={cn('rounded px-4 py-1.5 font-medium transition', format === 'pdf' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                PDF
              </button>
            </div>

            <p className="text-small text-muted">
              Includes 4 events for RA-LON-004-P-112-2. No personal data.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeExport}>
                Cancel
              </Button>
              <Button onClick={handleDownload}>
                Download {format.toUpperCase()}
              </Button>
            </div>
          </div>
        </Modal>
      </Page>
    </Screen>
  )
}
