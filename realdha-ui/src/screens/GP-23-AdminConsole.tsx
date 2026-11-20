import { AlertTriangle, Check, ChevronLeft, ChevronRight, Circle, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'
import type { ChainTx } from '../lib/chain'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Drawer } from '../components/ui/drawer'
import { Pill } from '../components/ui/pill'
import { RecordId } from '../components/ui/record-id'
import { ADMIN_TX_ALL, ADMIN_TX_MOBILE, AUDIT_EVENTS, type AdminTx } from '../data/fixtures/market'
import { cn } from '../lib/cn'

const PAGE = 6
const DEFAULT_LOG = '0x77ef…a031'
interface Filters { q: string; type: string; status: string; page: number }
const mono = 'font-mono font-medium'
const field = 'h-control rounded-control border border-line-strong bg-field px-3 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus'

function StatusPill({ s, reason }: { s: AdminTx['status']; reason?: string }) {
  if (s === 'confirmed') return <Pill tone="chain" icon={<Check className="size-3" />}>Confirmed</Pill>
  if (s === 'failed') return <Pill tone="danger" icon={<X className="size-3" />}>Failed{reason ? ` · ${reason}` : ''}</Pill>
  return <Pill tone="warning" icon={<Circle className="size-2 fill-current" />}>Pending</Pill>
}

function Kpi({ label, children, bad, note }: { label: string; children: ReactNode; bad?: boolean; note?: ReactNode }) {
  return (
    <Card className={cn('flex min-h-[116px] flex-1 flex-col gap-2 p-[18px]', bad && 'border-danger bg-danger-tint')}>
      <span className={cn('flex items-center gap-1 text-label', bad ? 'font-medium text-danger-ink' : 'text-muted')}>
        {bad && <X className="size-3" aria-hidden />}{label}
      </span>
      <span className={cn('text-display tabular', bad && 'text-danger-ink')}>{children}</span>
      {note}
    </Card>
  )
}

function auditFor(t: AdminTx) {
  if (t.hash === DEFAULT_LOG) return AUDIT_EVENTS
  const kind = t.type.split(' · ')[0]
  const outcome = t.status === 'failed'
    ? { title: `${kind} failed${t.reason ? ` · ${t.reason}` : ''}`, meta: `${t.time} · system`, bad: true }
    : t.status === 'pending'
      ? { title: 'Waiting for confirmation', meta: `${t.time} · system` }
      : { title: `${kind} confirmed`, meta: `${t.time} · system` }
  return [outcome, { title: `${kind} submitted`, meta: `${t.time} · owner` }, ...AUDIT_EVENTS.slice(2)]
}

/** Page numbers with gaps, e.g. 1 2 3 … 11. */
function pageList(page: number, last: number): (number | '…')[] {
  const want = new Set([1, 2, 3, last, page - 1, page, page + 1].filter((n) => n >= 1 && n <= last))
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of [...want].sort((a, b) => a - b)) { if (n - prev > 1) out.push('…'); out.push(n); prev = n }
  return out
}

/** GP-23 · Admin blockchain console. States: list (default), drawer (audit log open). */
export default function AdminConsole() {
  const [params, setParams] = useSearchParams()
  const [f, setF] = usePersistentState<Filters>('admin.filters', { q: '', type: '', status: '', page: 1 })
  const [added] = usePersistentState<ChainTx[]>('admin.transactions', [])
  const [asked, setAsked] = usePersistentState<string[]>('admin.reapprove', [])
  const [logHash, setLogHash] = useState<string | null>(null)
  const forcedDrawer = params.get('state') === 'drawer'
  const { q, type, status } = f
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, page: 1, ...patch }))

  const all: AdminTx[] = [...added, ...ADMIN_TX_ALL]
  const rows = all.filter((t) =>
    (!type || t.type.startsWith(type)) && (!status || t.status === status) &&
    (!q || (t.record + t.hash).toLowerCase().includes(q.toLowerCase())))
  const last = Math.max(1, Math.ceil(rows.length / PAGE))
  const page = Math.min(Math.max(1, f.page), last)
  const first = (page - 1) * PAGE
  const pageRows = rows.slice(first, first + PAGE)
  const goto = (n: number) => setF((x) => ({ ...x, page: Math.min(Math.max(1, n), last) }))

  const logTx = all.find((t) => t.hash === (logHash ?? (forcedDrawer ? DEFAULT_LOG : ''))) ?? null
  const open = logTx !== null
  const showLog = (hash: string) => setLogHash(hash)
  const closeLog = () => {
    setLogHash(null)
    if (forcedDrawer) setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
  }
  const ask = (hash: string) => setAsked((a) => (a.includes(hash) ? a : [...a, hash]))
  const askButton = (hash: string, size?: 'sm' | 'lg', className?: string) =>
    asked.includes(hash)
      ? <Pill tone="info" icon={<Check className="size-3" />} className={className}>Owner asked to re-approve</Pill>
      : <Button size={size ?? 'sm'} variant="secondary" onClick={() => ask(hash)} className={className}>Ask owner to re-approve</Button>

  const mints = added.filter((t) => t.type.startsWith('Mint')).length
  const fails = added.filter((t) => t.status === 'failed').length
  const mobileRows = [
    ...added.map((t) => ({ record: t.record, status: t.status, kind: t.type.split(' · ')[0], time: t.time, hash: t.hash })),
    ...ADMIN_TX_MOBILE,
  ].filter((t) => (!q || (t.record + t.hash).toLowerCase().includes(q.toLowerCase())) && (!type || t.kind === type) && (!status || t.status === status))

  return (
    <Screen id="GP-23" role="admin">
      <div className="flex flex-col gap-4 px-4 py-4 xl:gap-[18px] xl:px-12 xl:py-6">
        <div className="rounded-[10px] border border-demo-line bg-demo p-2.5 text-chip font-semibold text-demo-ink xl:hidden">
          Sample data. View only.
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-h1">
              <span className="xl:hidden">Blockchain console</span>
              <span className="max-xl:hidden">Blockchain and tokenisation</span>
            </h1>
            <p className="text-small text-muted max-xl:hidden">Sepolia testnet · updated 14:46 IST</p>
          </div>
          <Button to={path('F19-03')} className="max-xl:hidden">Open audit log</Button>
        </div>

        {/* 1440 KPIs */}
        <div className="flex gap-3.5 max-xl:hidden">
          <Kpi label="Anchored fingerprints">248</Kpi>
          <Kpi label="Contracts">12</Kpi>
          <Kpi label="Mints today">{3 + mints}</Kpi>
          <Kpi label="Failed transactions" bad>{2 + fails}</Kpi>
          <Kpi
            label="Wallet · gas balance"
            note={<span className="flex items-center gap-1 text-label font-semibold text-warning-ink"><AlertTriangle className="size-3" aria-hidden />Low · refill soon</span>}
          >
            0.042 <span className="text-small font-medium">SepoliaETH</span>
          </Kpi>
        </div>
        {/* 834 / 390 KPIs */}
        <div className="grid grid-cols-2 gap-2.5 xl:hidden">
          {[['Anchored fingerprints', '1,284'], ['Contracts', '6'], ['Mints today', String(3 + mints)], ['Failed tx', String(1 + fails)], ['Wallet / gas', '0.84 ETH']].map(([k, v]) => (
            <Card key={k} className="flex flex-col gap-0.5 p-3">
              <div className="text-label text-muted">{k}</div>
              <div className="text-h2 tabular">{v}</div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input aria-label="Search record ID or transaction hash" placeholder="Search record ID or tx hash" value={q} onChange={(e) => set({ q: e.target.value })} className={cn(field, 'w-full xl:w-[380px]')} />
          <select aria-label="Type" value={type} onChange={(e) => set({ type: e.target.value })} className={cn(field, 'cursor-pointer')}>
            <option value="">Type: All</option>
            <option value="Mint">Mint</option>
            <option value="Anchor">Anchor</option>
          </select>
          <select aria-label="Status" value={status} onChange={(e) => set({ status: e.target.value })} className={cn(field, 'cursor-pointer')}>
            <option value="">Status: All</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* 1440 table */}
        <Card className="overflow-hidden p-0 max-xl:hidden">
          <table className="w-full border-collapse text-small">
            <thead>
              <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                {['Record ID', 'Type', 'Transaction hash', 'Status', 'Time'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}
                <th scope="col" className="px-4 py-2.5"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.hash} className={cn('border-b border-line last:border-0', t.status === 'failed' && 'bg-danger-tint/40')}>
                  <td className={cn('px-4 py-3', mono)}>{t.record}</td>
                  <td className="px-4 py-3">{t.type}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => showLog(t.hash)} aria-label={`Open audit log for ${t.hash}`} className={cn(mono, 'cursor-pointer text-chain-ink underline underline-offset-2')}>{t.hash}</button>
                  </td>
                  <td className="px-4 py-3"><StatusPill s={t.status} reason={t.reason} /></td>
                  <td className="px-4 py-3">{t.time}</td>
                  <td className="px-4 py-3">{t.status === 'failed' && askButton(t.hash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p role="status" className="px-4 py-6 text-small text-muted">Nothing matches these filters.</p>}
          <div className="flex items-center justify-between px-3.5 py-3 text-label text-muted">
            <span aria-live="polite">{rows.length === 0 ? 'Showing 0 of 0' : `Showing ${first + 1} to ${first + pageRows.length} of ${rows.length}`}</span>
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => goto(page - 1)} className="inline-flex size-8 cursor-pointer items-center justify-center rounded-control hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" aria-hidden /></button>
              {pageList(page, last).map((n, i) => n === '…'
                ? <span key={`gap${i}`} aria-hidden className="px-1">…</span>
                : <button key={n} type="button" aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} onClick={() => goto(n)} className={cn('inline-flex size-8 cursor-pointer items-center justify-center rounded-control text-chip', n === page ? 'bg-primary font-semibold text-on-primary' : 'hover:bg-primary-tint')}>{n}</button>)}
              <button type="button" aria-label="Next page" disabled={page >= last} onClick={() => goto(page + 1)} className="inline-flex size-8 cursor-pointer items-center justify-center rounded-control hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" aria-hidden /></button>
            </nav>
          </div>
        </Card>

        {/* 834 / 390 cards */}
        <ul className="flex flex-col gap-2.5 xl:hidden">
          {mobileRows.map((t) => (
            <li key={t.hash}>
              <Card className="flex flex-col gap-2 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <RecordId id={t.record} className="text-label" />
                  <StatusPill s={t.status} />
                </div>
                <div className="flex gap-2 text-label text-muted"><span>{t.kind}</span><span aria-hidden>·</span><span>{t.time}</span></div>
                <button type="button" onClick={() => showLog(t.hash)} aria-label={`Open audit log for ${t.hash}`} className={cn(mono, 'min-h-11 cursor-pointer self-start text-label text-chain-ink underline')}>{t.hash}</button>
                {t.status === 'failed' && askButton(t.hash, 'sm', 'min-h-11 self-start')}
              </Card>
            </li>
          ))}
        </ul>
        {mobileRows.length === 0 && <p role="status" className="text-small text-muted xl:hidden">Nothing matches these filters.</p>}
        <Button variant="secondary" to={path('F19-03')} className="xl:hidden">Open audit log</Button>
      </div>

      <Drawer
        open={open}
        onOpenChange={(o) => { if (!o) closeLog() }}
        title="Audit log"
        subtitle={logTx && <span className={cn(mono, 'text-chain-ink')}>{logTx.hash} · {logTx.record}</span>}
        className="md:w-[400px]"
      >
        <ol className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 text-chip leading-[18px]">
          {(logTx ? auditFor(logTx) : []).map((e) => (
            <li key={e.title} className={cn('border-l-2 pl-2.5', 'bad' in e && e.bad ? 'border-danger' : 'border-line')}>
              <b className="font-semibold">{e.title}</b><br /><span className="text-label text-muted">{e.meta}</span>
            </li>
          ))}
        </ol>
        <div className="p-5">
          {logTx && logTx.status === 'failed' ? askButton(logTx.hash, 'lg', 'w-full justify-center') : <Button size="lg" block variant="secondary" onClick={closeLog}>Close</Button>}
        </div>
      </Drawer>
    </Screen>
  )
}
