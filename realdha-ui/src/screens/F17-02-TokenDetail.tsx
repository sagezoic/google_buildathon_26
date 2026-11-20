import { ExternalLink } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { RecordId, SampleData } from '../components/ui/record-id'
import { MINT_RECORD, inr, readStructure, stamp, type MintStatus, type MintTx } from '../lib/chain'
import { Page, Resp } from './parts/f-bits'
import { mono } from './parts/f-lib'
import { TokPill } from './parts/f17-bits'
import { plotState } from './parts/f17-lib'

/** F17-02 · Token detail. Reads mint.status, mint.tx, tokenise.structure; ?record= picks the token. */
export default function TokenDetail() {
  const [params] = useSearchParams()
  const record = params.get('record') ?? MINT_RECORD
  const [mint] = usePersistentState<MintStatus>('mint.status', 'review')
  const [tx] = usePersistentState<MintTx | null>('mint.tx', null)
  const [raw] = usePersistentState<unknown>('tokenise.structure', null)
  const st = readStructure(raw)
  const plot = record === MINT_RECORD
  const units = plot ? (tx?.units ?? st?.units ?? 1000) : 500
  const price = plot ? (st?.unitPrice ?? 5000) : 28000
  const state = plot ? plotState(mint) : 'pending'
  const name = plot ? 'Kusgaon NA plot' : 'A-1804 · 3 BHK'
  const hash = plot && tx ? tx.hash : '0x5b7d…e904'
  const events = plot
    ? [
        { time: tx?.settledAt ? stamp(tx.settledAt) : '20 Nov 2026, 15:12', event: 'Minted', amount: `${units.toLocaleString('en-IN')} units`, hash },
        { time: tx ? stamp(tx.submittedAt) : '20 Nov 2026, 15:10', event: 'Contract deployed', amount: '—', hash: '0x91aa…3c02' },
      ].filter((_e, i) => i === 1 || state === 'minted')
    : [{ time: '20 Nov 2026, 15:10', event: 'Contract deployed', amount: '—', hash: '0x1d05…77ab' }]

  return (
    <Screen id="F17-02" back={path('F17-01')} title="Token">
      <Page>
        <p className="rounded-[10px] border border-demo-line bg-demo p-2.5 text-chip font-semibold text-demo-ink">
          <Resp d="Sample data. Nothing here can be bought or sold." m="Sample data." />
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3"><RecordId id={record} /><SampleData /></div>
            <h1 className="text-h1"><Resp d={`${name} · Token detail`} m={plot ? 'NA plot, Kusgaon' : name} /></h1>
          </div>
          <TokPill s={state} />
        </div>

        <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            ['Total supply', units.toLocaleString('en-IN'), 'units', 'Supply'],
            ['Unit price', `₹${inr(price, 0)}`, 'set by owner', 'Unit price*'],
            ['Network', 'Sepolia', 'testnet', 'Network'],
            ['Fund partner', 'Sample Fund Co', 'placeholder', 'Set by'],
          ].map(([k, v, n, mk], i) => (
            <Card key={k} className="flex flex-col gap-0.5 p-4">
              <dt className="text-label text-muted"><Resp d={k} m={mk} /></dt>
              <dd className="text-h2 tabular"><Resp d={v} m={i === 3 ? 'Owner' : v} /></dd>
              <dd className="text-label text-muted max-xl:hidden">{n}</dd>
            </Card>
          ))}
        </dl>
        <p className="text-label text-muted xl:hidden">*Indicative, set by the owner. Not an offer.</p>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-h3"><Resp d="Contract" m="On-chain proof" /></h2>
          <div className="flex justify-between gap-3 text-small max-xl:hidden"><span className="text-muted">Contract address</span><span className={mono}>{plot ? '0x4c2e8b1f…a91f' : '0x1d05…77ab'}</span></div>
          <div className="flex justify-between gap-3 text-small max-xl:hidden"><span className="text-muted">Standard</span><span>ERC-20 (sample)</span></div>
          <span className={`${mono} xl:hidden`}>{hash}</span>
          <p className="text-label text-muted xl:hidden">Minted after owner approval · 18 Nov 2026</p>
          <a href="https://sepolia.etherscan.io/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-small font-medium text-chain-ink">View on explorer <ExternalLink aria-hidden className="size-3.5" /></a>
        </Card>

        <Card className="flex flex-col gap-3 p-5 max-xl:hidden">
          <h2 className="text-h3">Mint events</h2>
          <table className="w-full border-collapse text-small">
            <thead><tr className="border-b border-line text-left text-label text-muted">{['Time', 'Event', 'Amount', 'Transaction'].map((h) => <th key={h} scope="col" className="py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{events.map((e) => (
              <tr key={e.event} className="border-b border-line last:border-0"><td className="py-2.5">{e.time}</td><td>{e.event}</td><td>{e.amount}</td><td className={`${mono} text-chain-ink`}>{e.hash}</td></tr>
            ))}</tbody>
          </table>
        </Card>
        <Card className="flex flex-col gap-1 p-4 xl:hidden"><b>View only</b><p className="text-label text-muted">Trading is not available in this demo.</p></Card>
        <p className="text-label text-muted"><Resp d="No personal data is stored on-chain." m="No personal data is on-chain." /></p>
        <p className="text-label text-muted xl:hidden">The official land register remains the legal record.</p>
        <Button variant="secondary" to={path('F17-01')} className="self-start max-xl:hidden">Back to tokenised assets</Button>
      </Page>
    </Screen>
  )
}
