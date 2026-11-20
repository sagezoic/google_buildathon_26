import { AlertCircle, Check, Circle, ExternalLink, X } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Drawer } from '../components/ui/drawer'
import { Pill } from '../components/ui/pill'
import { FAILED_HASH, TX_ROWS, type TxRow } from '../data/fixtures/f19-admin'
import type { ChainTx } from '../lib/chain'
import { stamp } from '../lib/chain'
import { logAudit } from '../lib/audit'
import { AdminGate } from './parts/AdminGate'
import { Page, Resp } from './parts/f-bits'
import { mono } from './parts/f-lib'
import { cn } from '../lib/cn'

function StatusPill({ s }: { s: TxRow['status'] }) {
  if (s === 'confirmed') return <Pill tone="chain" icon={<Check className="size-3" />}>Confirmed</Pill>
  if (s === 'failed') return <Pill tone="danger" icon={<X className="size-3" />}>Failed</Pill>
  return <Pill tone="warning" icon={<Circle className="size-2 fill-current" />}>Pending</Pill>
}
const gas = (h: string) => `0.00${10 + (h.charCodeAt(3) % 20)} ETH (testnet)`

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-line py-3 text-small"><span className="text-label text-muted">{k}</span><span>{children}</span></div>
}

/** F19-01 · Transactions with the detail drawer. States: drawer (default, failed tx open), list. Reads admin.transactions; writes admin.reapprove. */
export default function TxDrawer() {
  const [params, setParams] = useSearchParams()
  const [added] = usePersistentState<ChainTx[]>('admin.transactions', [])
  const [asked, setAsked] = usePersistentState<string[]>('admin.reapprove', [])
  const rows: TxRow[] = [
    ...added.map((t) => ({ record: t.record, kind: t.type.split(' · ')[0], hash: t.hash, status: t.status, time: t.time, reason: t.reason, attempts: 1, submitted: stamp(t.ts) })),
    ...TX_ROWS,
  ]
  const closed = params.get('state') === 'list'
  const sel = closed ? null : rows.find((r) => r.hash === (params.get('tx') ?? FAILED_HASH)) ?? null
  const patch = (fn: (n: URLSearchParams) => void) => setParams((p) => { const n = new URLSearchParams(p); fn(n); return n }, { replace: true })
  const open = (hash: string) => patch((n) => { n.set('state', 'drawer'); n.set('tx', hash) })
  const close = () => patch((n) => { n.set('state', 'list'); n.delete('tx') })
  const ask = (t: TxRow) => { setAsked((a) => (a.includes(t.hash) ? a : [...a, t.hash])); logAudit('Admin', `Asked owner to re-approve ${t.kind.toLowerCase()} ${t.hash}`) }
  const isAsked = sel ? asked.includes(sel.hash) : false

  return (
    <AdminGate>
      <Screen id="F19-01" role="admin" back={path('GP-23')} title="Transactions">
        <Page className="xl:max-w-[1100px]">
          <h1 className="text-h1">Transactions</h1>
          <Card className="overflow-hidden p-0">
            <table className="w-full border-collapse text-small">
              <thead><tr className="border-b border-line bg-sunken text-left text-label text-muted">
                {['Record', 'Type', 'Transaction', 'Status', 'Time'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold max-md:last:hidden">{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.hash} className={cn('border-b border-line last:border-0', t.hash === sel?.hash && 'bg-primary-tint')}>
                    <td className="px-4 py-3">{t.record}</td><td className="px-4 py-3">{t.kind}</td>
                    <td className="px-4 py-3"><button type="button" onClick={() => open(t.hash)} aria-label={`Open details for ${t.hash}`} className={cn(mono, 'min-h-11 cursor-pointer text-chain-ink underline underline-offset-2')}>{t.hash}</button></td>
                    <td className="px-4 py-3"><StatusPill s={t.status} /></td><td className="px-4 py-3 max-md:hidden">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Page>

        <Drawer open={!!sel} onOpenChange={(o) => { if (!o) close() }} title="Transaction detail" wide className="md:w-[480px]">
          {sel && (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
              <div className="flex gap-2"><StatusPill s={sel.status} /><Pill tone="chain" className="xl:hidden">Sepolia testnet</Pill></div>
              <div className="max-xl:hidden">
                <Row k="Record">{sel.record}</Row><Row k="Type">{sel.kind}</Row><Row k="Network">Sepolia testnet</Row>
                <Row k="Submitted">{sel.submitted}</Row><Row k="Gas used">{sel.status === 'pending' ? '—' : gas(sel.hash)}</Row>
                <Row k="Attempts">{sel.attempts ?? 1}</Row><Row k="Hash"><span className={cn(mono, 'text-chain-ink')}>{sel.hash}</span></Row>
              </div>
              <div className="xl:hidden">
                <Row k="Record">{sel.record}</Row><Row k="Approved by">Owner, 18 Nov 2026</Row><Row k="Tx"><span className={mono}>{sel.hash}</span></Row>
                <Row k="Attempts">{sel.attempts ?? 1}</Row><Row k="Last tried">{sel.submitted}</Row>
              </div>
              {sel.status === 'failed' && (
                <>
                  <p role="alert" className="flex items-start gap-2 rounded-control border border-danger bg-danger-tint px-3 py-2.5 text-chip text-danger-ink">
                    <AlertCircle className="mt-0.5 size-4 flex-none" aria-hidden />
                    <span><Resp d={`Reverted: ${sel.reason ?? 'gas limit too low'} (sample).`} m="Out of gas on Sepolia testnet." /></span>
                  </p>
                  <p className="text-label text-muted"><b className="font-semibold xl:hidden">Admins cannot resend this. </b>{'The owner must approve again before anything goes on-chain.'}<span className="max-xl:hidden">{' '}Admins cannot resend this.</span></p>
                </>
              )}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {sel.status === 'failed' && (isAsked
                  ? <Pill tone="info" icon={<Check className="size-3" />}>Owner asked to re-approve</Pill>
                  : <Button onClick={() => ask(sel)}>Ask owner to re-approve</Button>)}
                <a href="https://sepolia.etherscan.io/" target="_blank" rel="noreferrer" className="inline-flex h-control items-center gap-1 rounded-control border border-line-strong bg-surface px-5 text-control font-medium text-primary-text no-underline hover:bg-primary-tint max-xl:hidden">View on explorer <ExternalLink aria-hidden className="size-3.5" /></a>
                <Button variant="secondary" to={path('F19-03')} className="max-xl:hidden">Audit log</Button>
                <Button variant="secondary" onClick={close} className="xl:hidden">Close</Button>
              </div>
            </div>
          )}
        </Drawer>
      </Screen>
    </AdminGate>
  )
}
