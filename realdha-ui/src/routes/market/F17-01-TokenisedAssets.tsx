import { useEffect } from 'react'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { RecordId } from '../../components/ui/record-id'
import { MINT_RECORD, inr, readStructure, type MintStatus, type MintTx } from '../../lib/chain'
import { logAudit } from '../../lib/audit'
import { Page, Resp } from '../parts/f-bits'
import { TokPill } from '../parts/f17-bits'
import { plotState, type TokState } from '../parts/f17-lib'

const KOTHRUD_RETRY_MS = 3000

/** F17-01 · My tokenised assets. Reads mint.status, mint.tx, tokenise.structure; keys f17.kothrud. */
export default function TokenisedAssets() {
  const [mint] = usePersistentState<MintStatus>('mint.status', 'review')
  const [tx] = usePersistentState<MintTx | null>('mint.tx', null)
  const [raw] = usePersistentState<unknown>('tokenise.structure', null)
  const [koth, setKoth] = usePersistentState<{ state: TokState; since: number }>('f17.kothrud', { state: 'failed', since: 0 })
  const st = readStructure(raw)
  const units = tx?.units ?? st?.units ?? 1000
  const price = st?.unitPrice ?? 5000
  const plot = plotState(mint)

  useEffect(() => {
    if (koth.state !== 'pending') return
    const t = setTimeout(() => setKoth({ state: 'minted', since: Date.now() }), Math.max(0, koth.since + KOTHRUD_RETRY_MS - Date.now()))
    return () => clearTimeout(t)
  }, [koth, setKoth])

  const retryKothrud = () => { setKoth({ state: 'pending', since: Date.now() }); logAudit('Prakash Kulkarni', 'Retried mint for RA-PUN-011-C-02-03') }
  const rows = [
    { id: MINT_RECORD, name: 'Kusgaon NA plot', supply: `${units.toLocaleString('en-IN')} units`, price: `₹${inr(price, 0)}`, s: plot, open: `${path('F17-02')}?record=${MINT_RECORD}`, retry: path('GP-20') },
    { id: 'RA-PUN-001-A-18-04', name: 'A-1804 · 3 BHK', supply: '500 units', price: '₹28,000', s: 'pending' as TokState, open: `${path('F17-02')}?record=RA-PUN-001-A-18-04` },
    { id: 'RA-PUN-011-C-02-03', name: 'Kothrud shop', supply: koth.state === 'minted' ? '200 units' : '—', price: koth.state === 'minted' ? '₹10,000' : '—', s: koth.state, open: `${path('F17-02')}?record=RA-PUN-011-C-02-03`, onRetry: retryKothrud },
  ]

  return (
    <Screen id="F17-01" noTabs={false}>
      <Page>
        <p className="rounded-[10px] border border-demo-line bg-demo p-2.5 text-chip font-semibold text-demo-ink">
          <Resp d="Sample data. Nothing here can be bought or sold." m="Sample data." />
        </p>
        <h1 className="text-h1"><Resp d="My tokenised assets" m="Tokenised assets" /></h1>
        <p className="text-small text-muted xl:hidden">View only. You cannot buy or sell here.</p>

        <Card className="overflow-hidden p-0 max-xl:hidden">
          <table className="w-full border-collapse text-small">
            <thead>
              <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                {['Record', 'Name', 'Supply', 'Unit price', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}
                <th scope="col" className="px-4 py-2.5"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3"><RecordId id={r.id} /></td><td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.supply}</td><td className="px-4 py-3">{r.price}</td><td className="px-4 py-3"><TokPill s={r.s} /></td>
                  <td className="px-4 py-3">
                    {r.s === 'failed' ? (r.onRetry ? <Button size="sm" variant="secondary" onClick={r.onRetry}>Retry</Button> : <Button size="sm" variant="secondary" to={r.retry}>Retry</Button>)
                      : <Button size="sm" variant="secondary" to={r.open}>Open</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <ul className="flex flex-col gap-2.5 xl:hidden">
          {rows.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-1.5 p-3.5">
                <RecordId id={r.id} className="self-start text-label" />
                <div className="text-small font-semibold">{r.name}</div>
                <div className="text-label text-muted">{r.supply} · Unit price {r.price}</div>
                <div className="flex items-center gap-2"><TokPill s={r.s} /></div>
                {r.s === 'failed' ? (r.onRetry ? <Button size="sm" variant="secondary" onClick={r.onRetry} className="min-h-11 self-start">Retry</Button> : <Button size="sm" variant="secondary" to={r.retry} className="min-h-11 self-start">Retry</Button>)
                  : <Button size="sm" variant="secondary" to={r.open} className="min-h-11 self-start">Open</Button>}
              </Card>
            </li>
          ))}
        </ul>
        <p className="text-label text-muted"><Resp d="View only. Registers on Sepolia testnet. Sample data." m="The official land register remains the legal record." /></p>
      </Page>
    </Screen>
  )
}
