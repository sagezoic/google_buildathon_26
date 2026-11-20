import { CheckCircle2, Copy, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { AuditTrail } from '../../../components/ui/audit-trail'
import { Pill } from '../../../components/ui/pill'
import { VerdictBanner } from '../../../components/ui/verdict-banner'
import { hashes, tx } from '../../../data/fixtures/anchoring'
import type { SignedOff } from '../../../data/fixtures/lawyer'
import { dayStamp, logAudit, stamp } from '../../../lib/audit'
import { readShared, useSharedState, writeShared } from '../../../lib/shared-state'

type Status = 'approve' | 'pending' | 'confirmed'
const STATES: Status[] = ['approve', 'pending', 'confirmed']
const CONFIRM_MS = 5000
const short = (h: string) => `0x${h.slice(2, 6)}…${h.slice(-4)}`
const newHash = () => '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')

const Row = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div className="flex justify-between gap-3 text-chip">
    <dt className="text-muted">{k}</dt>
    <dd className={mono ? 'font-mono text-label font-medium text-chain-ink' : ''}>{v}</dd>
  </div>
)
const Cap = ({ children }: { children: string }) => <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase md:text-label">{children}</div>

/** GP-15 · Anchoring. Three states: approve (default), pending, confirmed. */
export default function Anchoring() {
  const [params] = useSearchParams()
  const forcedRaw = params.get('state') as Status | null
  const forced = forcedRaw && STATES.includes(forcedRaw) ? forcedRaw : null
  const [persisted] = useSharedState<Status>('anchor.status', 'approve')
  const [hash] = useSharedState<string>('anchor.txHash', '')
  const [submittedAt] = useSharedState<number>('anchor.submittedAt', 0)
  const [confirmedAt] = useSharedState<number>('anchor.confirmedAt', 0)
  const [approved, setApproved] = useSharedState<boolean>('anchor.approved', false)
  const [signed] = useSharedState<SignedOff | null>('lawyer.signedOff', null)
  const [copied, setCopied] = useState(false)
  const state: Status = forced ?? persisted

  // Pending moves to confirmed on its own after a few seconds, also after a reload. A forced ?state= is left alone.
  useEffect(() => {
    if (forced || persisted !== 'pending') return
    const wait = Math.max(0, CONFIRM_MS - (Date.now() - submittedAt))
    const id = window.setTimeout(() => {
      if (readShared<Status>('anchor.status', 'approve') !== 'pending') return
      writeShared('anchor.confirmedAt', Date.now(), 0)
      writeShared<Status>('anchor.status', 'confirmed', 'approve')
      logAudit('Realdha', 'Anchoring confirmed on Sepolia testnet')
    }, wait)
    return () => window.clearTimeout(id)
  }, [forced, persisted, submittedAt])

  const approve = () => {
    if (!approved) return
    writeShared('anchor.txHash', newHash(), '')
    writeShared('anchor.submittedAt', Date.now(), 0)
    writeShared<Status>('anchor.status', 'pending', 'approve')
    logAudit('Prakash Kulkarni', 'Approved putting 5 document fingerprints on-chain')
    logAudit('Realdha', 'Anchoring transaction submitted to Sepolia testnet')
  }
  const txShort = hash ? short(hash) : tx.hash
  const submitted = hash && submittedAt ? stamp(submittedAt) : tx.submitted
  const confirmed = confirmedAt ? stamp(confirmedAt) : tx.confirmed
  const copy = async () => {
    try { await navigator.clipboard.writeText(hash || tx.hash); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }
  const CopyBtn = (
    <Button size="sm" variant="secondary" className="min-h-11 self-start md:min-h-0" onClick={copy} icon={<Copy className="size-4" aria-hidden />}>{copied ? 'Copied' : 'Copy transaction hash'}</Button>
  )
  return (
    <Screen id="GP-15">
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-[18px] md:px-12 md:py-7">
        <div>
          <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-md:hidden">Step 4 of 4 · Signed off by {signed?.by ?? 'Adv. Meera Joshi'}, {signed ? dayStamp(signed.at) : '20 Nov 2026'}</div>
          <h1 className="text-h2 md:mt-1 md:text-h1">Anchor your record on-chain</h1>
        </div>
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col md:max-w-[560px]" aria-live="polite">
          {state === 'approve' && (
            <Card className="flex flex-1 flex-col gap-3.5 md:p-6">
              <Cap>A · Approve</Cap>
              <h2 className="text-h2">Approve putting these 5 document fingerprints on-chain</h2>
              <div className="rounded-control border border-chain/30 bg-chain-tint px-3.5 py-3 text-chip text-chain-ink">
                <b className="font-semibold">On-chain:</b> only a fingerprint (hash) of each document. <b className="font-semibold">Stays private:</b> the documents, your name and your personal data.
              </div>
              <dl>
                {hashes.map((h) => (
                  <div key={h.doc} className="flex items-center justify-between border-b border-line py-2 text-small last:border-b-0"><dt>{h.doc}</dt><dd className="font-mono text-label font-medium text-chain-ink">{h.hash}</dd></div>
                ))}
              </dl>
              <label className="flex items-start gap-2.5 text-chip">
                <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} className="mt-0.5 size-5 flex-none accent-primary max-md:size-6" />
                <span>I approve putting these 5 document fingerprints on-chain.</span>
              </label>
              <p className="text-chip text-muted">Network: {tx.network}. Test network only; nothing here has legal or monetary effect.</p>
              <div className="flex-1" />
              <Button size="lg" block disabled={!approved} onClick={approve}>Approve and anchor</Button>
              <Link to={path('GP-14')} className="inline-flex min-h-11 items-center justify-center text-small font-medium">Not now</Link>
            </Card>
          )}
          {state === 'pending' && (
            <Card className="flex flex-1 flex-col gap-3.5 md:p-6">
              <Cap>B · Pending</Cap>
              <div className="flex items-center gap-2.5">
                <Loader2 className="size-6 flex-none animate-spin text-warning-ink motion-reduce:animate-none" aria-hidden />
                <h2 className="text-h2">Anchoring in progress</h2>
              </div>
              <Pill tone="warning" className="self-start" icon={<Loader2 className="size-4" />}>Pending</Pill>
              <p className="text-chip text-muted">Waiting for the network to confirm. This usually takes under a minute. You can leave this page.</p>
              <dl className="flex flex-col gap-1.5 rounded-control border border-line bg-canvas px-3.5 py-3">
                <Row k="Transaction" v={txShort} mono /><Row k="Network" v={tx.network} /><Row k="Submitted" v={submitted} />
              </dl>
              <ul className="flex flex-col gap-1.5 text-chip">
                <li className="text-success-ink">✓ 5 fingerprints prepared</li>
                <li className="text-success-ink">✓ Transaction submitted</li>
                <li className="font-semibold">● Waiting for confirmation</li>
              </ul>
              <div className="flex-1" />
              <Button size="lg" block disabled>Anchoring…</Button>
            </Card>
          )}
          {state === 'confirmed' && (
            <Card className="flex flex-1 flex-col gap-3.5 border-chain/30 md:p-6">
              <Cap>C · Confirmed</Cap>
              <div className="md:hidden">
                <VerdictBanner tone="chain" title="Anchored on-chain">Tx {txShort}</VerdictBanner>
              </div>
              <div className="flex items-center gap-2.5 max-md:hidden">
                <span className="flex size-11 items-center justify-center rounded-full bg-chain-tint text-chain-ink"><ShieldCheck className="size-6" aria-hidden /></span>
                <h2 className="text-h2">Anchored on-chain</h2>
              </div>
              <Pill tone="chain" className="self-start" icon={<CheckCircle2 className="size-4" />}>Anchored on-chain</Pill>
              <dl className="flex flex-col gap-1.5 rounded-control border border-line bg-canvas px-3.5 py-3">
                <Row k="Transaction" v={txShort} mono /><Row k="Network" v={tx.network} /><Row k="Confirmed" v={confirmed} />
              </dl>
              <div className="flex flex-wrap items-center gap-3">
                <a href={hash ? `https://sepolia.etherscan.io/tx/${hash}` : 'https://sepolia.etherscan.io/'} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-small font-medium text-chain-ink underline md:min-h-0">View on explorer ↗</a>
                {CopyBtn}
              </div>
              <p className="text-chip text-muted">Your record is now permanently verifiable. Anyone can check a document against these fingerprints.</p>
              <div className="flex-1" />
              <Button size="lg" block to={path('GP-16')}>Go to my Digital Twin</Button>
            </Card>
          )}
          <AuditTrail className="mt-4 p-4" limit={5} />
        </div>
      </div>
    </Screen>
  )
}
