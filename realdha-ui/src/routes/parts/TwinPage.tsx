import { Check, CircleAlert, Copy, Link2, MessageSquare, ShieldCheck } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { usePersistentState } from '../../app/persist'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { Modal } from '../../components/ui/modal'
import { DOCS, type CheckRecord, type TwinDoc } from '../../data/fixtures/twin'
import { cn } from '../../lib/cn'
import { copyText, useTwinRecord } from '../../lib/twin-store'
import OsmCadastralView from '../../components/map/OsmCadastralView'
import type { LngLat } from '../../components/map/osm-geometry'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'Ownership history' },
  { id: 'activity', label: 'Activity' },
  { id: 'proof', label: 'On-chain proof' },
]

function KV({ k, children, mono }: { k: string; children: ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-label text-muted">{k}</div>
      <div className={cn('text-body font-medium', mono && 'font-mono text-small')}>{children}</div>
    </div>
  )
}

/** Live cadastral boundary panel centered on Gat 112/2 Kusgaon with satellite/street view. */
function MapPanel({ boundaryLabel }: { boundaryLabel: string }) {
  // Kusgaon Gat 112/2 survey boundaries (~418 sq m / 0.0418 ha)
  const coords = useMemo<LngLat[]>(
    () => [
      [73.40598, 18.75442],
      [73.40645, 18.75448],
      [73.40638, 18.75478],
      [73.40591, 18.75472],
    ],
    []
  )

  return (
    <div className="relative min-h-[300px] overflow-hidden bg-sunken max-xl:rounded-card max-xl:border max-xl:border-line xl:h-full xl:min-h-[380px]">
      <OsmCadastralView
        coordinates={coords}
        label={boundaryLabel}
        unit="sqm"
        defaultTheme="satellite"
        className="size-full"
      />
    </div>
  )
}

/** Owner Digital Twin body (GP-16). Also rendered behind the GP-17 modal and GP-18 drawer. */
export function TwinPage() {
  const { plot, anchored, signedOff, proof } = useTwinRecord()
  const [tab, setTab] = usePersistentState('twin.tab', 'overview')
  const [checks] = usePersistentState<CheckRecord[]>('twin.checks', [])
  const [viewing, setViewing] = useState<TwinDoc>()
  const [note, setNote] = useState('')
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(''), 2200) }
  const share = async () => flash((await copyText(`${location.origin}${path('F07-01')}?record=${plot.recordId}`)) ? 'Link copied' : 'Could not copy the link')
  const copyHash = async () => flash((await copyText(proof.txHash)) ? 'Transaction hash copied' : 'Could not copy the hash')
  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-12 xl:py-7">
      <section aria-label="Record summary" className="grid gap-4 xl:grid-cols-[1fr_640px] xl:grid-rows-[1fr_auto] xl:gap-0 xl:overflow-hidden xl:rounded-card xl:border xl:border-line xl:bg-surface xl:shadow-e1">
        <div className="flex flex-col gap-3.5 xl:p-7 xl:pb-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <RecordId id={plot.recordId} copyable />
            <SampleData />
          </div>
          <h1 className="text-h1 font-semibold xl:text-[32px] xl:leading-10 xl:tracking-[-0.02em]">
            <span className="xl:hidden">{plot.titleCompact}</span>
            <span className="max-xl:hidden">{plot.title}</span>
          </h1>
          <p className="text-control text-muted max-xl:hidden">{plot.location}</p>
          <div className="flex flex-wrap gap-2">
            {signedOff
              ? <Pill tone="success" icon={<ShieldCheck className="size-3.5" />}>Signed off</Pill>
              : <Pill tone="warning" icon={<CircleAlert className="size-3.5" />}>Sign-off pending</Pill>}
            {anchored
              ? <Pill tone="chain" icon={<Link2 className="size-3.5" />}>Anchored on-chain</Pill>
              : <Pill tone="warning" icon={<CircleAlert className="size-3.5" />}>Not anchored yet</Pill>}
          </div>
        </div>
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1"><MapPanel boundaryLabel={plot.boundaryLabel} /></div>
        <div className="flex flex-wrap gap-2.5 xl:col-start-1 xl:row-start-2 xl:p-7 xl:pt-4">
          <Button variant="secondary" onClick={() => void share()} icon={<Link2 className="size-4" aria-hidden />}>Share link</Button>
          <Button variant="secondary" to={path('GP-17')} icon={<ShieldCheck className="size-4" aria-hidden />}>Check a document</Button>
          <Button variant="secondary" to={path('GP-18')} icon={<MessageSquare className="size-4" aria-hidden />}>Ask AI</Button>
          <Button to={path('GP-19')}>Tokenise</Button>
          <span role="status" aria-live="polite" className="flex items-center text-chip font-medium text-success-ink">{note && <><Check className="mr-1 size-4" aria-hidden />{note}</>}</span>
        </div>
      </section>

      <nav aria-label="Sections" className="-mx-4 flex overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <a key={t.id} href={`#${t.id}`} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'true' : undefined} className={cn('inline-flex min-h-11 items-center border-b-[3px] px-4 text-small font-medium whitespace-nowrap no-underline', tab === t.id ? 'border-primary text-brand' : 'border-transparent text-muted hover:text-text')}>
            {t.label}
          </a>
        ))}
      </nav>

      <Card id="overview" className="flex scroll-mt-4 flex-col gap-4">
        <h2 className="text-h2">Overview</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-5">
          {plot.overview.map((o) => (
            <KV key={o.k} k={o.k} mono={'mono' in o}>{o.v}</KV>
          ))}
        </div>
      </Card>

      <Card id="documents" className="flex scroll-mt-4 flex-col gap-3">
        <h2 className="text-h2">Documents</h2>
        <ul>
          {DOCS.map((d) => (
            <li key={d.name} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0 xl:gap-4">
              <span className="flex-1 text-small font-medium xl:text-body">{d.name}</span>
              <span className="text-label text-muted max-xl:hidden">{d.pages}</span>
              <span className="font-mono text-label text-chain-ink max-xl:hidden">{d.hash}</span>
              <Pill tone="chain" icon={<Check className="size-3.5" />}>
                <span className="xl:hidden">Fingerprint</span>
                <span className="max-xl:hidden">Fingerprint ✓</span>
              </Pill>
              <Button size="sm" variant="secondary" className="max-xl:hidden" aria-label={`View ${d.name}`} onClick={() => setViewing(d)}>View</Button>
            </li>
          ))}
        </ul>
        {checks.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <h3 className="text-small font-semibold">Checked documents</h3>
            <ul className="flex flex-col gap-1.5">
              {checks.slice(0, 3).map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 text-chip">
                  <span className="min-w-0 flex-1 truncate font-medium">{c.file}</span>
                  <span className="text-muted">{c.at}</span>
                  {c.result === 'matches'
                    ? <Pill tone="success" icon={<Check className="size-3.5" />}>Matches</Pill>
                    : <Pill tone="danger" icon={<CircleAlert className="size-3.5" />}>Changed</Pill>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <Card id="history" className="flex scroll-mt-4 flex-col gap-4">
          <h2 className="text-h2">Ownership history</h2>
          <ol className="text-small">
            <li className="flex gap-3.5 pb-4">
              <div className="flex flex-col items-center"><span className="size-3 rounded-full bg-primary" /><span className="w-0.5 flex-1 bg-line" /></div>
              <div><b className="font-semibold">Prakash Kulkarni</b> · Current owner<div className="text-label text-muted">12 Mar 2015 · Sale deed · Mutation 2291</div></div>
            </li>
            <li className="flex gap-3.5">
              <div className="flex flex-col items-center"><span className="size-3 rounded-full border-2 border-muted" /></div>
              <div><b className="font-semibold">Shankar Dattatray Kulkarni</b><div className="text-label text-muted">Before 2015 · Previous owner</div></div>
            </li>
          </ol>
        </Card>
        <Card id="activity" className="flex scroll-mt-4 flex-col gap-4">
          <h2 className="text-h2">Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            <KV k="Views">0</KV>
            <KV k="Shortlists">0</KV>
            <KV k="Comparisons">0</KV>
          </div>
          <p className="text-label text-muted">Not listed for sale. Activity appears once the record is shared or listed.</p>
        </Card>
      </div>

      <section id="proof" aria-labelledby="proof-h" className="scroll-mt-4 overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex items-center gap-2.5 border-b border-chain/30 bg-chain-tint px-6 py-3.5 text-chain-ink">
          <Link2 className="size-[18px]" aria-hidden />
          <h2 id="proof-h" className="text-body font-semibold">On-chain proof</h2>
          <span className="ml-auto text-label font-medium">{proof.network}</span>
        </div>
        <div className="grid grid-cols-2 items-center gap-5 p-6 xl:grid-cols-4">
          <KV k="Fingerprints">{proof.fingerprints}</KV>
          <KV k="Transaction hash"><span className="inline-flex items-center gap-1.5"><span className="font-mono text-small text-chain-ink">{proof.txHash}</span><button type="button" onClick={() => void copyHash()} aria-label="Copy transaction hash" className="inline-flex size-8 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint"><Copy className="size-3.5" aria-hidden /></button></span></KV>
          <KV k="Anchored"><span className="text-small">{proof.anchored}</span></KV>
          <a href="https://sepolia.etherscan.io/" target="_blank" rel="noopener noreferrer" className="text-small font-medium text-chain-ink underline">View on explorer ↗</a>
        </div>
      </section>

      <p className="text-label text-muted">The official land register remains the legal record.</p>

      <Modal open={!!viewing} onOpenChange={(o) => !o && setViewing(undefined)} title={viewing?.name ?? ''}>
        {viewing && (
          <dl className="flex flex-col gap-2 rounded-control border border-line bg-sunken px-3.5 py-3 text-chip">
            <div className="flex justify-between gap-2"><dt className="text-muted">Record</dt><dd className="font-mono">{plot.recordId}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Pages</dt><dd>{viewing.pages}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Fingerprint</dt><dd className="font-mono text-chain-ink">{viewing.hash}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Anchored</dt><dd>{proof.network} · {proof.anchored}</dd></div>
          </dl>
        )}
      </Modal>
    </div>
  )
}
