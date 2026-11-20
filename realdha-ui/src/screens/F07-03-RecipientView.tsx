import { Check, FileText, Lock, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { RecordId, SampleData } from '../components/ui/record-id'
import { cn } from '../lib/cn'

/** F07-03 · Recipient view and expired link states (public). */
export default function RecipientViewScreen() {
  const [state, setState] = useDemoState(['recipient', 'expired'] as const)

  return (
    <Screen id="F07-03" role="public" layout="app" title="Shared property record">
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2 text-label font-medium text-muted">
            <span>Shared record · view only</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('recipient')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'recipient' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · Active
              </button>
              <button
                type="button"
                onClick={() => setState('expired')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'expired' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Expired
              </button>
            </div>
          </div>
        </div>

        {state === 'recipient' ? (
          <div className="flex flex-col gap-6">
            {/* Active view */}
            <Card className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RecordId id="RA-PUN-001-A-18-04" />
                  <SampleData />
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="success" icon={<Check className="size-3.5" />}>
                    Signed off
                  </Pill>
                  <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                    Anchored on-chain
                  </Pill>
                </div>
              </div>

              <div>
                <h1 className="text-h1 font-semibold text-text">A-1804 · 3 BHK</h1>
                <p className="text-body text-muted">Baner Heights, Tower A, floor 18 · Pune</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-line py-4 sm:grid-cols-4">
                <div>
                  <span className="text-label text-muted">Carpet area</span>
                  <div className="text-body font-semibold">1,180 sq ft</div>
                </div>
                <div>
                  <span className="text-label text-muted">Facing</span>
                  <div className="text-body font-semibold">East</div>
                </div>
                <div>
                  <span className="text-label text-muted">View</span>
                  <div className="text-body font-semibold">Hill</div>
                </div>
                <div>
                  <span className="text-label text-muted">Signed off</span>
                  <div className="text-body font-semibold">18 Nov 2026</div>
                </div>
              </div>

              {/* Shared Documents */}
              <div className="flex flex-col gap-3">
                <span className="text-h3 font-semibold text-text">Documents (shared by owner)</span>
                <div className="flex flex-col divide-y divide-line rounded-control border border-line">
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-muted" />
                      <div>
                        <div className="text-small font-medium text-text">Agreement for sale</div>
                        <div className="font-mono text-overline text-muted">0x7a12…44be</div>
                      </div>
                    </div>
                    <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                      Fingerprint ✓
                    </Pill>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-muted" />
                      <div>
                        <div className="text-small font-medium text-text">Occupancy certificate</div>
                        <div className="font-mono text-overline text-muted">0x21fd…9c03</div>
                      </div>
                    </div>
                    <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                      Fingerprint ✓
                    </Pill>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-canvas p-3.5 text-small text-muted">
                <span>Link expires 27 Nov 2026. You are viewing without an account.</span>
                <Link to={path('GP-01')} className="font-medium text-primary hover:underline">
                  Create a free account to track properties
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          /* Expired State */
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-danger-tint text-danger-ink">
              <Lock className="size-7" />
            </div>
            <h2 className="text-h2 font-semibold text-text">This link has expired</h2>
            <p className="max-w-md text-body text-muted">
              The owner set this link to expire on 10 Nov 2026. Please contact the owner or broker to request a new link.
            </p>
            <div className="mt-2 flex gap-3">
              <Button variant="secondary" to={path('X-01')}>
                Go to Realdha Home
              </Button>
              <Button to={path('F08-01')}>
                Search other properties
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
