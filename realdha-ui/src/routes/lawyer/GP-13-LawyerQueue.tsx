import { ChevronLeft, ChevronRight, CircleCheck, Clock, OctagonAlert, Undo2 } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { SampleData } from '../../components/ui/record-id'
import { cn } from '../../lib/cn'
import { dayStamp } from '../../lib/audit'
import { useSharedState } from '../../lib/shared-state'
import { lawyer, queue, sentBackArchive, signedArchive, type QueueRow, type SentBack, type SignedOff } from '../../data/fixtures/lawyer'

type Tab = 'awaiting' | 'sent-back' | 'signed-off'
const TABS: Tab[] = ['awaiting', 'sent-back', 'signed-off']
const PAGE = 4
interface Ui { tab: Tab; q: string; oldest: boolean; page: number }
const UI0: Ui = { tab: 'awaiting', q: '', oldest: true, page: 1 }

const StatusPill = ({ r }: { r: QueueRow }) =>
  r.status === 'aged' ? <Pill tone="danger" icon={<OctagonAlert className="size-4" />}>{r.statusLabel}</Pill>
  : r.status === 'signed' ? <Pill tone="success" icon={<CircleCheck className="size-4" />}>{r.statusLabel}</Pill>
  : r.status === 'sent-back' ? <Pill tone="warning" icon={<Undo2 className="size-4" />}>{r.statusLabel}</Pill>
  : <Pill tone="brand" icon={<Clock className="size-4" />}>{r.statusLabel}</Pill>

/** GP-13 · Lawyer review queue (role: lawyer). Table at 834+, cards at 390. Search, sort, tabs and pages persist. */
export default function LawyerQueue() {
  const [params] = useSearchParams()
  const [ui, setUi] = useSharedState<Ui>('lawyer.queue.ui', UI0)
  const [signed] = useSharedState<SignedOff | null>('lawyer.signedOff', null)
  const [sentBack] = useSharedState<SentBack | null>('lawyer.sentBack', null)
  const forced = params.get('state') as Tab | null
  const tab: Tab = forced && TABS.includes(forced) ? forced : ui.tab
  const patch = (p: Partial<Ui>) => setUi((u) => ({ ...u, ...p }))

  // The Kusgaon file moves to Signed off / Sent back once the lawyer acts on it in GP-14.
  const plotRow = queue[0]
  const decided = !!signed || !!sentBack
  const lists: Record<Tab, QueueRow[]> = {
    awaiting: decided ? queue.slice(1) : queue,
    'sent-back': [...(sentBack ? [{ ...plotRow, status: 'sent-back' as const, statusLabel: 'Sent back', ageLabel: dayStamp(sentBack.at), ageHours: 0, flags: `${sentBack.comments.length} comment${sentBack.comments.length === 1 ? '' : 's'}` }] : []), ...sentBackArchive],
    'signed-off': [...(signed ? [{ ...plotRow, status: 'signed' as const, statusLabel: 'Signed off', ageLabel: dayStamp(signed.at), ageHours: 0, flags: '0 open' }] : []), ...signedArchive],
  }
  const labels: Record<Tab, string> = { awaiting: 'Awaiting review', 'sent-back': 'Sent back', 'signed-off': 'Signed off' }

  const needle = ui.q.trim().toLowerCase()
  const base = lists[tab].filter((r) => `${r.recordId} ${r.owner} ${r.property}`.toLowerCase().includes(needle))
  const sorted = [...base].sort((a, b) => (ui.oldest ? b.ageHours - a.ageHours : a.ageHours - b.ageHours))
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE))
  const page = Math.min(ui.page, pages)
  const rows = sorted.slice((page - 1) * PAGE, page * PAGE)
  const from = sorted.length ? (page - 1) * PAGE + 1 : 0
  const ctl = 'h-10 rounded-control border border-line-strong bg-field px-3 text-small'
  const openTo = path('GP-14')
  const total = lists[tab].length
  const empty = (
    <Card className="text-small text-muted">{needle ? `No files match "${ui.q.trim()}".` : `No files in "${labels[tab]}".`}</Card>
  )

  return (
    <Screen id="GP-13" role="lawyer">
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-[18px] md:px-12 md:py-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase md:hidden">{lawyer.name} (sample)</div>
            <h1 className="text-h2 md:text-h1"><span className="md:hidden">Review queue · {lists.awaiting.length}</span><span className="max-md:hidden">Review queue</span></h1>
            <div className="flex items-center gap-2 text-small text-muted max-md:hidden">{lawyer.name} · {lawyer.city} · <SampleData /></div>
          </div>
          <div className="flex gap-2.5">
            <label className="flex-1 md:flex-none">
              <span className="sr-only">Search record ID or owner</span>
              <input type="search" value={ui.q} onChange={(e) => patch({ q: e.target.value, page: 1 })} placeholder="Search record ID or owner" className={cn(ctl, 'w-full text-text placeholder:text-muted md:w-[280px]')} />
            </label>
            <label>
              <span className="sr-only">Sort</span>
              <select value={ui.oldest ? 'old' : 'new'} onChange={(e) => patch({ oldest: e.target.value === 'old', page: 1 })} className={cn(ctl, 'max-md:w-11 max-md:px-1')}>
                <option value="old">Sort: Oldest first</option>
                <option value="new">Sort: Newest first</option>
              </select>
            </label>
          </div>
        </div>

        <div role="tablist" aria-label="Queue" className="flex overflow-x-auto border-b border-line">
          {TABS.map((t) => (
            <button key={t} role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="queue-panel" onClick={() => patch({ tab: t, page: 1 })} className={cn('-mb-px min-h-11 cursor-pointer border-b-[3px] px-3.5 py-2 text-small whitespace-nowrap md:min-h-0', tab === t ? 'border-primary font-semibold text-brand' : 'border-transparent font-medium text-muted')}>{labels[t]} · {lists[t].length}</button>
          ))}
        </div>

        <div id="queue-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} aria-live="polite" className="flex flex-col gap-4 md:gap-[18px]">
          {rows.length === 0 ? empty : (
            <>
              <Card className="overflow-hidden p-0 max-md:hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-label font-semibold text-muted">
                      {['Record', 'Property', 'Owner', 'Status', tab === 'awaiting' ? 'Age' : 'When', 'Flags'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}
                      <th scope="col" className="px-4 py-2.5"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody className="text-small">
                    {rows.map((r) => (
                      <tr key={r.recordId} className={cn('border-b border-line last:border-b-0', r.recordId === plotRow.recordId && tab === 'awaiting' && 'bg-primary-tint')}>
                        <td className="px-4 py-3.5 font-mono text-chip font-medium">{r.recordId}</td>
                        <td className="px-4 py-3.5">{r.property}</td>
                        <td className="px-4 py-3.5">{r.owner}</td>
                        <td className="px-4 py-3.5"><StatusPill r={r} /></td>
                        <td className="px-4 py-3.5">{r.ageLabel}</td>
                        <td className="px-4 py-3.5">{r.flags}</td>
                        <td className="px-4 py-3.5"><Button size="sm" variant={r.recordId === plotRow.recordId && tab === 'awaiting' ? 'primary' : 'secondary'} to={openTo}>Open file</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <ul className="flex flex-col gap-3 md:hidden">
                {rows.map((r) => (
                  <li key={r.recordId}>
                    <Card className="flex flex-col gap-2 p-3.5">
                      <div className="flex items-center justify-between gap-2"><span className="font-mono text-chip font-medium">{r.recordId}</span><StatusPill r={r} /></div>
                      <div className="text-small font-semibold">{r.owner}</div>
                      <div className="text-small text-muted">{r.property}</div>
                      <div className="flex gap-2.5 text-label text-muted"><span>{tab === 'awaiting' ? 'Age ' : ''}{r.ageLabel}</span><span aria-hidden>·</span><span>{r.flags}</span></div>
                      <Button size="sm" variant="secondary" block className="min-h-11" to={openTo}>Open file</Button>
                    </Card>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-label text-muted">
              Showing {from}–{from ? from + rows.length - 1 : 0} of {sorted.length}{needle && sorted.length !== total ? ` (${total} in tab)` : ''}
            </p>
            {pages > 1 && (
              <nav aria-label="Pagination" className="flex items-center gap-1.5">
                <Button size="sm" variant="secondary" className="min-h-11 md:min-h-0" aria-label="Previous page" disabled={page === 1} onClick={() => patch({ page: page - 1 })}><ChevronLeft className="size-4" aria-hidden /></Button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Button key={n} size="sm" variant={n === page ? 'primary' : 'secondary'} className="min-h-11 min-w-11 md:min-h-0 md:min-w-0" aria-current={n === page ? 'page' : undefined} onClick={() => patch({ page: n })}>{n}</Button>
                ))}
                <Button size="sm" variant="secondary" className="min-h-11 md:min-h-0" aria-label="Next page" disabled={page === pages} onClick={() => patch({ page: page + 1 })}><ChevronRight className="size-4" aria-hidden /></Button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </Screen>
  )
}
