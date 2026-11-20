import { Check, FileText, History, MessageSquare, ShieldCheck, Sun, Moon, Share2, Coins } from 'lucide-react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { RecordId, SampleData } from '../components/ui/record-id'
import { cn } from '../lib/cn'

/** F04-01 · Apartment Digital Twin (A-1804 · Baner Heights). */
export default function ApartmentTwinScreen() {
  const [viewMode, setViewMode] = usePersistentState<'floor' | '3d'>('f04.viewMode', '3d')
  const [lightTime, setLightTime] = usePersistentState<'morning' | 'evening'>('f04.lightTime', 'morning')

  return (
    <Screen id="F04-01" back={path('F03-03')} title="A-1804 Digital Twin">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Header banner */}
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-e1 xl:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
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

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-semibold text-text">A-1804 · 3 BHK apartment</h1>
            <p className="text-body text-muted">Baner Heights, Tower A, floor 18 · Pune</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
            <div>
              <span className="text-label text-muted">Configuration</span>
              <div className="text-body font-semibold text-text">3 BHK</div>
            </div>
            <div>
              <span className="text-label text-muted">Carpet area</span>
              <div className="text-body font-semibold text-text">1,180 sq ft</div>
            </div>
            <div>
              <span className="text-label text-muted">Facing</span>
              <div className="text-body font-semibold text-text">East</div>
            </div>
            <div>
              <span className="text-label text-muted">View</span>
              <div className="text-body font-semibold text-text">Hill</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-line pt-4">
            <Button variant="secondary" size="sm" to={path('F07-01')} icon={<Share2 className="size-3.5" />}>
              Share link
            </Button>
            <Button variant="secondary" size="sm" to={path('F04-02')} icon={<History className="size-3.5" />}>
              Ownership history
            </Button>
            <Button variant="secondary" size="sm" to={path('GP-17')} icon={<FileText className="size-3.5" />}>
              Check a document
            </Button>
            <Button variant="secondary" size="sm" to={path('GP-18')} icon={<MessageSquare className="size-3.5" />}>
              Ask AI
            </Button>
            <Button variant="secondary" size="sm" to={path('GP-19')} icon={<Coins className="size-3.5" />}>
              Tokenise
            </Button>
          </div>
        </div>

        {/* 3D Walkthrough / Floor plan viewer */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-4 xl:col-span-8">
            <Card className="relative flex min-h-[360px] flex-col overflow-hidden p-0 xl:min-h-[460px]">
              <div className="absolute top-4 left-4 z-10 flex gap-2 rounded-control border border-line-strong bg-surface p-0.5 text-chip font-medium shadow-e1">
                <button
                  type="button"
                  onClick={() => setViewMode('floor')}
                  className={cn('rounded-[4px] px-3 py-1.5 transition-colors', viewMode === 'floor' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
                >
                  Floor plan
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={cn('rounded-[4px] px-3 py-1.5 transition-colors', viewMode === '3d' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
                >
                  3D walkthrough
                </button>
              </div>

              {/* Viewer canvas */}
              <div className="relative flex flex-1 items-center justify-center bg-sunken p-8">
                {viewMode === 'floor' ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-48 items-center justify-center rounded-card border-2 border-dashed border-line bg-surface p-4">
                      <span className="font-mono text-small text-muted">Floor Plan SVG [Unit A-1804]</span>
                    </div>
                    <span className="text-small text-muted">Architectural plan · Approved by PMC</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-64 items-center justify-center rounded-card border border-line bg-gradient-to-b from-surface to-canvas p-6 shadow-e2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <span className="text-label font-medium text-text">Interactive 3D Walkthrough</span>
                        <span className="text-overline text-muted">Drag to orbit · Scroll to zoom</span>
                      </div>
                    </div>
                    <span className="text-overline text-muted">Placeholder for the 3D model viewer · drag to look around</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Light check simulation */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-h2 font-semibold">Light check</h2>
                <div className="flex rounded-control border border-line bg-canvas p-0.5 text-chip font-medium">
                  <button
                    type="button"
                    onClick={() => setLightTime('morning')}
                    className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1 transition-colors', lightTime === 'morning' ? 'bg-primary text-on-primary' : 'text-muted')}
                  >
                    <Sun className="size-3.5" />
                    ☀ Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightTime('evening')}
                    className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1 transition-colors', lightTime === 'evening' ? 'bg-primary text-on-primary' : 'text-muted')}
                  >
                    <Moon className="size-3.5" />
                    ☾ Evening
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-control border border-line p-3">
                  <span className="text-label font-medium text-text">☀ Morning · east window</span>
                  <div className="h-24 rounded-[4px] bg-amber-100/60 dark:bg-amber-950/30 flex items-center justify-center text-small text-amber-800 dark:text-amber-200">
                    Direct morning sun until 10:30 AM
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-control border border-line p-3">
                  <span className="text-label font-medium text-text">☾ Evening · east window</span>
                  <div className="h-24 rounded-[4px] bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center text-small text-slate-700 dark:text-slate-300">
                    Diffused evening light, cool shade
                  </div>
                </div>
              </div>

              <p className="text-overline text-muted">
                Light simulation is indicative, based on facing and floor. Sample data.
              </p>
            </Card>
          </div>

          {/* Right rail: Documents & Proof */}
          <div className="flex flex-col gap-6 xl:col-span-4">
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-h2 font-semibold">Documents</h2>
                <Button variant="ghost" size="sm" to={path('F04-03')}>
                  View all
                </Button>
              </div>

              <div className="flex flex-col divide-y divide-line">
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex flex-col">
                    <span className="text-small font-medium text-text">Agreement for sale</span>
                    <span className="font-mono text-overline text-muted">0x7a12…44be</span>
                  </div>
                  <Button variant="ghost" size="sm" to={path('F04-03')}>
                    Open
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex flex-col">
                    <span className="text-small font-medium text-text">Occupancy certificate</span>
                    <span className="font-mono text-overline text-muted">0x21fd…9c03</span>
                  </div>
                  <Button variant="ghost" size="sm" to={path('F04-03')}>
                    Open
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex flex-col">
                    <span className="text-small font-medium text-text">RERA registration</span>
                    <span className="font-mono text-overline text-muted">0x5c44…1180</span>
                  </div>
                  <Button variant="ghost" size="sm" to={path('F04-03')}>
                    Open
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 rounded-card border-2 border-chain bg-chain-tint p-4">
              <div className="flex items-center gap-2 text-chain-ink">
                <ShieldCheck className="size-5" />
                <span className="text-body font-semibold">On-chain verification</span>
              </div>
              <p className="text-small text-chain-ink">
                Title sign-off and 3 document fingerprints are anchored to Sepolia Ethereum testnet.
              </p>
              <div className="flex flex-col gap-1 rounded-[6px] bg-surface p-2.5 font-mono text-overline">
                <span className="text-muted">Merkle Root:</span>
                <span className="text-text break-all">0x49f2b810d7a228399ef31048bca61204</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
