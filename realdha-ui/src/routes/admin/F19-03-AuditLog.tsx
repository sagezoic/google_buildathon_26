import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { AUDIT_BASE, AUDIT_ACTORS, AUDIT_DAYS } from '../../data/fixtures/f19-admin'
import { downloadBlob } from '../../lib/mini-pdf'
import { AdminGate } from '../parts/AdminGate'
import { Page, Resp } from '../parts/f-bits'
import { inputCls, mono, toCsv } from '../parts/f-lib'
import { cn } from '../../lib/cn'

const PAGE_SIZE = 4

export default function AuditLog() {
  const [q, setQ] = usePersistentState('f19.audit.q', '')
  const [actor, setActor] = usePersistentState('f19.audit.actor', 'all')
  const [day, setDay] = usePersistentState('f19.audit.day', 'all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return AUDIT_BASE.filter((e) => {
      if (actor !== 'all' && e.actor !== actor) return false
      if (day !== 'all' && e.day !== day) return false
      if (q.trim()) {
        const query = q.trim().toLowerCase()
        const matchRecord = e.record.toLowerCase().includes(query)
        const matchTx = e.tx.toLowerCase().includes(query)
        const matchAction = e.action.toLowerCase().includes(query)
        const matchActor = e.actor.toLowerCase().includes(query)
        if (!matchRecord && !matchTx && !matchAction && !matchActor) return false
      }
      return true
    })
  }, [q, actor, day])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, filtered.length)
  const rows = filtered.slice(startIdx, endIdx)

  const exportCsv = () => {
    const csvContent = toCsv([
      ['Time', 'Actor', 'Action', 'Record', 'Transaction'],
      ...filtered.map((e) => [`${e.day} ${e.time}`, e.actor, e.action, e.record, e.tx]),
    ])
    downloadBlob(new Blob([csvContent], { type: 'text/csv' }), 'realdha-audit-log.csv')
  }

  return (
    <AdminGate>
      <Screen id="F19-03" role="admin" back={path('GP-23')} title="Audit Log">
        <Page className="xl:max-w-[1100px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-h1"><Resp d="Audit log" m="Audit log" /></h1>
            <Button variant="secondary" onClick={exportCsv} icon={<Download className="size-4" />}>
              Export CSV
            </Button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder="Search record ID or transaction hash"
                aria-label="Search audit records"
                className={cn(inputCls, 'pl-9 text-small')}
              />
            </div>

            <select
              value={actor}
              onChange={(e) => { setActor(e.target.value); setPage(1) }}
              aria-label="Filter by actor"
              className={cn(inputCls, 'w-auto min-w-[120px] cursor-pointer text-small')}
            >
              <option value="all">Actor ▾ (All)</option>
              {AUDIT_ACTORS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <select
              value={day}
              onChange={(e) => { setDay(e.target.value); setPage(1) }}
              aria-label="Filter by date"
              className={cn(inputCls, 'w-auto min-w-[140px] cursor-pointer text-small')}
            >
              <option value="all">Date ▾ (All)</option>
              {AUDIT_DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Table (Desktop/Tablet) */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <table className="w-full border-collapse text-small">
              <thead>
                <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Time</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Actor</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Action</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Record</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">No audit events match your filters.</td>
                  </tr>
                ) : (
                  rows.map((e) => (
                    <tr key={e.id} className="border-b border-line last:border-0 hover:bg-canvas">
                      <td className="px-4 py-3 whitespace-nowrap">{e.day} {e.time}</td>
                      <td className="px-4 py-3">{e.actor}</td>
                      <td className="px-4 py-3 font-medium">{e.action}</td>
                      <td className="px-4 py-3">{e.record}</td>
                      <td className="px-4 py-3">
                        {e.tx !== '—' ? (
                          <span className={cn(mono, 'text-chain-ink')}>{e.tx}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Mobile Card List */}
          <div className="flex flex-col gap-3 md:hidden">
            {rows.length === 0 ? (
              <Card className="p-6 text-center text-muted">No audit events match your filters.</Card>
            ) : (
              rows.map((e) => (
                <Card key={e.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between text-small">
                    <span className="font-semibold text-text">{e.action}</span>
                    <span className="text-label text-muted">{e.day} {e.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-small">
                    <span className="text-label text-muted">Actor</span>
                    <span>{e.actor}</span>
                  </div>
                  <div className="flex items-center justify-between text-small">
                    <span className="text-label text-muted">Record</span>
                    <span className="font-mono text-label">{e.record}</span>
                  </div>
                  {e.tx !== '—' && (
                    <div className="flex items-center justify-between text-small">
                      <span className="text-label text-muted">Tx</span>
                      <span className={cn(mono, 'text-chain-ink')}>{e.tx}</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-small text-muted">
              {filtered.length === 0 ? '0 of 0' : `${startIdx + 1} to ${endIdx} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                icon={<ChevronLeft className="size-4" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                icon={<ChevronRight className="size-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </Page>
      </Screen>
    </AdminGate>
  )
}
