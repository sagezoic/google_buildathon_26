import { Check, ExternalLink, Loader2, X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { TOKENISE } from '../data/fixtures/twin'
import { MINT_DURATION_MS, MINT_RECORD, clock, inr, randomHash, readStructure, stamp, type ChainTx, type MintStatus, type MintTx } from '../lib/chain'
import { Button } from '../components/ui/button'
import { Pill } from '../components/ui/pill'
import { cn } from '../lib/cn'

const STATES = ['review', 'pending', 'confirmed', 'failed'] as const
type MintState = MintStatus

const CAPTION: Record<MintState, string> = {
  review: 'A · Review',
  pending: 'B · Pending',
  confirmed: 'C · Confirmed',
  failed: 'D · Failed, retry',
}

/** Copy that differs between the 1440 frame and the 834 / 390 frames. */
function Resp({ d, m }: { d: ReactNode; m: ReactNode }) {
  return (
    <>
      <span className="xl:hidden">{m}</span>
      <span className="max-xl:hidden">{d}</span>
    </>
  )
}

function Row({ k, children, last, first }: { k: string; children: ReactNode; last?: boolean; first?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 text-small', !last && 'border-b border-line', first && 'pt-0', last && 'pb-0')}>
      <span className="text-label text-muted">{k}</span>
      <span>{children}</span>
    </div>
  )
}

const mono = 'font-mono font-medium'

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[10px] border border-line bg-sunken px-3.5 py-3', className)}>{children}</div>
}

function StateHead({ icon, tone, children }: { icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className={cn('flex size-10 flex-none items-center justify-center rounded-full', tone)}>{icon}</span>
      <h2 className="text-h2">{children}</h2>
    </div>
  )
}

/** GP-20 · Tokenise review and mint. States: review, pending, confirmed, failed. */
export default function TokeniseMint() {
  const [params, setParams] = useSearchParams()
  const forcedRaw = params.get('state') as MintState | null
  const forced = forcedRaw && STATES.includes(forcedRaw) ? forcedRaw : null
  const [saved, setSaved] = usePersistentState<MintState>('mint.status', 'review')
  const [tx, setTx] = usePersistentState<MintTx | null>('mint.tx', null)
  const [, setTxs] = usePersistentState<ChainTx[]>('admin.transactions', [])
  const [acked, setAcked] = usePersistentState('mint.ack', false)
  const [rawStructure] = usePersistentState<unknown>('tokenise.structure', null)
  const state = forced ?? saved
  const ackId = useId()

  const structure = readStructure(rawStructure)
  const units = structure?.units ?? 1000
  const unitsText = units.toLocaleString('en-IN')
  const unitPriceText = structure ? inr(structure.unitPrice) : TOKENISE.unitPrice
  const totalText = structure ? `₹ ${inr(structure.units * structure.unitPrice)}` : TOKENISE.totalValue
  const fundPartner = structure?.fundPartner || TOKENISE.fundPartner
  // Sample hashes from the frames when the visitor has not minted yet (forced ?state= review).
  const hash = tx?.hash ?? (state === 'failed' ? '0x77ef…a031' : '0xc4a1…19d2')
  const submitted = tx ? stamp(tx.submittedAt) : '20 Nov 2026, 14:44'
  const confirmed = tx?.settledAt ? stamp(tx.settledAt) : '20 Nov 2026, 14:45'

  const settle = (outcome: 'confirmed' | 'failed', t: MintTx) => {
    setSaved(outcome)
    setTx({ ...t, settledAt: Date.now() })
    setTxs((list) => list.map((x) => (x.hash === t.hash ? { ...x, status: outcome, reason: outcome === 'failed' ? 'gas low' : undefined, time: clock(Date.now()) } : x)))
  }

  // A mint the visitor started settles after a few seconds. Survives reload: the deadline is saved.
  useEffect(() => {
    if (forced || saved !== 'pending') return
    if (!tx) { setSaved('review'); return }
    const t = setTimeout(() => settle(tx.fail ? 'failed' : 'confirmed', tx), Math.max(0, tx.submittedAt + MINT_DURATION_MS - Date.now()))
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced, saved, tx?.hash])

  const start = () => {
    const now = Date.now()
    const retry = state === 'failed' && !!tx
    const next: MintTx = { hash: randomHash(), submittedAt: now, units, attempt: retry ? tx.attempt + 1 : 1, fail: !retry && params.has('fail') }
    setTx(next)
    setTxs((list) => [{ record: MINT_RECORD, type: `Mint · ${unitsText} units`, hash: next.hash, status: 'pending', time: clock(now), ts: now }, ...list])
    setSaved('pending')
    setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
  }

  return (
    <Screen id="GP-20" noTabs>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-10 xl:gap-3 xl:px-12 xl:pt-5">
        <div className="rounded-[10px] border border-demo-line bg-demo p-2.5 text-chip font-semibold text-demo-ink xl:hidden">
          Sample data.
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase">Step 2 of 2 · Review and mint</div>
            <h1 className="mt-0.5 text-h1">Tokenise · Plot, Gat 112/2</h1>
          </div>
        </div>

        <section
          aria-label={CAPTION[state]}
          className={cn(
            'flex w-full max-w-[520px] flex-col gap-4 rounded-card border bg-surface p-6 shadow-e1 max-xl:p-4 xl:min-h-[560px]',
            state === 'failed' ? 'border-danger' : state === 'confirmed' ? 'border-chain-tint' : 'border-line',
          )}
        >
          <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-xl:hidden">{CAPTION[state]}</div>

          {state === 'review' && (
            <>
              <div className="grid grid-cols-2 gap-3 xl:hidden">
                <div><div className="text-label text-muted">Units</div><div className="text-small font-semibold">{unitsText}</div></div>
                <div><div className="text-label text-muted">Price</div><div className="text-small font-semibold">{structure ? `₹${inr(structure.unitPrice)}` : '₹5,000'}</div></div>
              </div>
              <div className="max-xl:hidden">
                <Row k="Record" first><span className={mono}>{MINT_RECORD}</span></Row>
                <Row k="Total units"><b className="font-semibold">{unitsText}</b></Row>
                <Row k="Unit price"><b className="font-semibold">₹ {unitPriceText}</b></Row>
                <Row k="Total value"><b className="font-semibold">{totalText}</b></Row>
                <Row k="Fund partner">{fundPartner}</Row>
                <Row k="Payout">Not applicable</Row>
                <Row k="Network" last>Sepolia testnet</Row>
              </div>
              <div className="flex flex-col gap-1.5 rounded-control border border-warning bg-warning-tint px-3.5 py-3 max-xl:hidden">
                <b className="text-chip text-warning-ink">Risks</b>
                <p className="text-label text-text">Test tokens only. The value shown is a sample. Nothing here is an offer, advice or a security.</p>
              </div>
              <div className="flex items-start gap-3">
                <input id={ackId} type="checkbox" checked={acked} onChange={(e) => setAcked(e.target.checked)} className="mt-0.5 size-6 flex-none cursor-pointer" />
                <label htmlFor={ackId} className="cursor-pointer text-chip leading-[19px] xl:text-small xl:leading-5">
                  <Resp
                    d="I understand this is a demo on a test network and not an offer to sell or buy anything."
                    m="I understand this is a testnet demo, not an offer, and carries risk."
                  />
                </label>
              </div>
              <div className="flex-1" />
              <Button size="lg" block disabled={!acked} onClick={start}>Mint on Sepolia</Button>
              <Button size="lg" block variant="secondary" to={path('GP-19')} className="max-xl:hidden">Back</Button>
            </>
          )}

          {state === 'pending' && (
            <div aria-live="polite" className="flex flex-1 flex-col gap-4">
              <div className="flex items-center gap-2.5 max-xl:rounded-card max-xl:border max-xl:border-info max-xl:bg-info-tint max-xl:p-3.5 max-xl:text-info-ink">
                <Loader2 aria-hidden className="size-8 flex-none animate-spin text-info motion-reduce:animate-none xl:size-10" />
                <div>
                  <h2 className="text-h2 max-xl:text-h3">Minting…</h2>
                  <p className="text-small text-text xl:hidden">Waiting for confirmation.</p>
                </div>
              </div>
              <Pill tone="warning" icon={<Loader2 className="size-3" />} className="self-start max-xl:hidden">Pending</Pill>
              <p className="text-label text-muted max-xl:hidden">Waiting for Sepolia to confirm. Don't close this page if you can help it; the mint continues if you do.</p>
              <Panel className="max-xl:hidden">
                <Row k="Transaction" first><span className={mono}>{hash}</span></Row>
                <Row k="Submitted" last>{submitted}</Row>
              </Panel>
              <ul className="flex flex-col gap-1.5 text-chip max-xl:hidden">
                <li className="flex items-center gap-1.5 text-success-ink"><Check aria-hidden className="size-3.5" />Contract prepared</li>
                <li className="flex items-center gap-1.5 text-success-ink"><Check aria-hidden className="size-3.5" />Transaction submitted</li>
                <li className="flex items-center gap-1.5 font-semibold"><span aria-hidden>●</span>Waiting for confirmation</li>
              </ul>
              <div className="flex-1" />
              <Button size="lg" block disabled className="max-xl:hidden">Minting…</Button>
            </div>
          )}

          {state === 'confirmed' && (
            <div aria-live="polite" className="flex flex-1 flex-col gap-4">
              <StateHead tone="bg-chain-tint text-chain-ink" icon={<Check className="size-5" />}>
                <Resp d="Minted on Sepolia" m="Minted" />
              </StateHead>
              <Pill tone="chain" icon={<Check className="size-3" />} className="self-start max-xl:hidden">Confirmed on-chain</Pill>
              <p className="text-small xl:hidden">Tx <span className={mono}>{hash}</span></p>
              <Panel className="max-xl:hidden">
                <Row k="Transaction hash" first><span className={mono}>{hash}</span></Row>
                <Row k="Units minted"><b className="font-semibold">{unitsText} test units</b></Row>
                <Row k="Confirmed" last>{confirmed}</Row>
              </Panel>
              <a href="https://sepolia.etherscan.io/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-small font-medium text-chain-ink max-xl:hidden">View on explorer <ExternalLink aria-hidden className="size-3.5" /></a>
              <div className="flex-1" />
              <Button size="lg" block to={path('GP-21')}>View in Market</Button>
              <Button size="lg" block variant="secondary" to={path('GP-16')}>Back to Digital Twin</Button>
            </div>
          )}

          {state === 'failed' && (
            <div role="alert" className="flex flex-1 flex-col gap-4">
              <StateHead tone="bg-danger-tint text-danger-ink" icon={<X className="size-5" />}>
                <Resp d="Mint failed" m="Failed" />
              </StateHead>
              <Pill tone="danger" icon={<X className="size-3" />} className="self-start max-xl:hidden">Failed</Pill>
              <p className="rounded-control border border-danger bg-danger-tint px-3.5 py-3 text-chip leading-[19px] text-danger-ink">
                <Resp
                  d="The network rejected the transaction: gas balance too low. No units were created and nothing was charged."
                  m="Reverted: gas limit too low (sample)."
                />
              </p>
              <Panel className="max-xl:hidden"><Row k="Attempt" first last><span className={mono}>{hash}</span></Row></Panel>
              <p className="text-label text-muted max-xl:hidden">This is a problem on our side. An admin has been notified.</p>
              <div className="flex-1" />
              <Button size="lg" block onClick={start}>Retry mint</Button>
              <Button size="lg" block variant="secondary" to={path('GP-19')} className="max-xl:hidden">Back</Button>
            </div>
          )}
        </section>
      </div>
    </Screen>
  )
}
