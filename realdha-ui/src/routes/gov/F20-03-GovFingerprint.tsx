import { AlertCircle, Check, UploadCloud } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { usePersistedDemo } from '../../lib/demo-param'
import { Page, Resp } from '../parts/f-bits'
import { mono } from '../parts/f-lib'
import { cn } from '../../lib/cn'

export default function GovFingerprint() {
  const [, setState] = usePersistedDemo('gov.fingerprint.state', ['matches', 'changed'] as const)

  const handleSimulate = (which: 'matches' | 'changed') => {
    setState(which)
  }

  return (
    <Screen id="F20-03" role="government" back={path('F20-02')} title="Fingerprint check">
      <Page className="max-w-[900px] gap-5">
        <h1 className="text-h1"><Resp d="Fingerprint check" m="Verify a document" /></h1>

        {/* Dropzone */}
        <div
          role="region"
          aria-label="Document fingerprint dropzone"
          className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-field p-8 text-center"
        >
          <UploadCloud className="size-8 text-muted" aria-hidden />
          <b className="text-body font-semibold">Drop a file to compare with the anchored fingerprint</b>
          <p className="text-small text-muted">The file is not stored. Only its fingerprint is computed and compared.</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleSimulate('matches')}>
              Sample matching file
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleSimulate('changed')}>
              Sample changed file
            </Button>
          </div>
        </div>

        {/* Desktop Comparison or View (matches frame F20-03 side-by-side) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* State A: Matches */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-control bg-sunken px-2 py-0.5 text-label font-semibold uppercase tracking-wider text-muted">State A</span>
              <span className="text-small font-medium text-muted">Matches</span>
            </div>
            <Card className="flex flex-col gap-4 border-chain-line bg-surface p-5">
              <div className="flex items-center gap-2 rounded-control border border-chain-line bg-chain-tint p-3 text-chain-ink font-semibold text-small">
                <Check className="size-4 flex-none" aria-hidden />
                <span>Matches the verified version</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-small">
                <div>
                  <div className="text-label text-muted">Fingerprint</div>
                  <div className={cn(mono, 'text-body font-medium text-chain-ink')}>0x9f3a…c21e</div>
                </div>
                <div>
                  <div className="text-label text-muted">Anchored</div>
                  <div className="text-body font-semibold">20 Nov 2026, 14:32</div>
                </div>
              </div>
              <div className="text-label text-muted">File: 7_12_extract.pdf</div>
            </Card>
          </div>

          {/* State B: Changed */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-control bg-sunken px-2 py-0.5 text-label font-semibold uppercase tracking-wider text-muted">State B</span>
              <span className="text-small font-medium text-muted">Changed</span>
            </div>
            <Card className="flex flex-col gap-4 border-danger-line bg-surface p-5">
              <div className="flex items-center gap-2 rounded-control border border-danger-line bg-danger-tint p-3 text-danger-ink font-semibold text-small">
                <AlertCircle className="size-4 flex-none" aria-hidden />
                <span>Changed since verification on 20 Nov 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-small">
                <div>
                  <div className="text-label text-muted">Anchored fingerprint</div>
                  <div className={cn(mono, 'text-body font-medium')}>0x9f3a…c21e</div>
                </div>
                <div>
                  <div className="text-label text-muted">This file</div>
                  <div className={cn(mono, 'text-body font-medium text-danger-ink')}>0x41de…7a90</div>
                </div>
              </div>
              <div className="text-label text-muted">File: 7_12_extract_v2.pdf</div>
            </Card>
          </div>
        </div>
      </Page>
    </Screen>
  )
}
