import { History } from 'lucide-react'
import { stamp, useAudit } from '../../lib/audit'
import { Card } from './card'

/** Persisted audit trail (`audit.log`): who did what and when, newest first. */
export function AuditTrail({ limit = 6, className }: { limit?: number; className?: string }) {
  const log = useAudit()
  const rows = [...log].reverse().slice(0, limit)
  return (
    <Card className={className}>
      <h2 className="flex items-center gap-2 text-body leading-6 font-semibold"><History className="size-[18px] text-muted" aria-hidden />Audit trail</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-label text-muted">Nothing recorded yet. Every decision, comment and sign-off is logged here with a time.</p>
      ) : (
        <ol className="mt-2.5 flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.ts + r.action} className="flex flex-col text-chip">
              <span>{r.action}</span>
              <span className="text-label text-muted">{r.actor} · {stamp(r.ts)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
