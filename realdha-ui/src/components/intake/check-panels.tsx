import { Circle, CircleCheck, Lock, Loader2, ScanSearch } from 'lucide-react'
import { Card } from '../ui/card'
import { cn } from '../../lib/cn'
import type { ExtractedFields } from '../../lib/property-api'

const spin = 'animate-spin motion-reduce:animate-none'

export interface FoundField { k: string; v: string }
export interface FoundGroup { doc: string; items: FoundField[] }
export type StageState = 'done' | 'active' | 'waiting'
export interface Stage { label: string; hint: string; state: StageState }

/** Labelled values worth showing from a server extraction. Empty fields are left out. */
export function fieldsToFound(f: ExtractedFields | null | undefined): FoundField[] {
  if (!f) return []
  const out: FoundField[] = []
  const owner = f.ownerEn ?? f.owner
  if (owner) out.push({ k: 'Owner', v: owner })
  if (f.gat) out.push({ k: 'Gat', v: [f.gat, f.village].filter(Boolean).join(' · ') })
  if (f.areaSqm != null) out.push({ k: 'Area', v: `${f.areaSqm} sq m` })
  if (f.landUse) out.push({ k: 'Land use', v: f.landUse })
  if (f.mutationNos.length) out.push({ k: 'Mutation no.', v: f.mutationNos.join(', ') })
  return out
}

/** Pipeline strip: what the check does, and which part is running now. Horizontal from md up, stacked on phones. */
export function StageStrip({ stages }: { stages: Stage[] }) {
  return (
    <ol aria-label="Check stages" className="grid gap-2 md:grid-cols-3">
      {stages.map((s, i) => (
        <li
          key={s.label}
          aria-current={s.state === 'active' ? 'step' : undefined}
          className={cn('flex items-start gap-3 rounded-card border p-3.5', s.state === 'active' ? 'border-primary bg-primary-tint' : 'border-line bg-surface')}
        >
          <span className="mt-0.5 flex-none">
            {s.state === 'done' && <CircleCheck className="size-[18px] text-success-ink" aria-hidden />}
            {s.state === 'active' && <Loader2 className={cn('size-[18px] text-primary-text', spin)} aria-hidden />}
            {s.state === 'waiting' && <Circle className="size-[18px] text-muted" aria-hidden />}
          </span>
          <span className="min-w-0">
            <span className={cn('block text-control leading-5', s.state === 'waiting' ? 'text-muted' : 'font-semibold')}>
              <span className="text-muted">{i + 1} · </span>{s.label}
              <span className="sr-only">{s.state === 'done' ? ', done' : s.state === 'active' ? ', in progress' : ', waiting'}</span>
            </span>
            <span className="block text-label text-muted">{s.hint}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Details read so far, grouped by document. Fills in as each document finishes. */
export function FoundPanel({ groups, waiting }: { groups: FoundGroup[]; waiting: boolean }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <ScanSearch className="size-[18px] text-primary-text" aria-hidden />
        <h2 className="text-h3">What we have read so far</h2>
      </div>
      {groups.length === 0 ? (
        <p className="text-label text-muted">{waiting ? 'Owner, area, gat number and other details show up here as each document is read.' : 'No details could be read yet.'}</p>
      ) : (
        <div className="flex flex-col gap-3" aria-live="polite">
          {groups.map((g) => (
            <div key={g.doc}>
              <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase">{g.doc}</div>
              <dl className="mt-1 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-control leading-[22px]">
                {g.items.map((it) => (
                  <div key={it.k} className="col-span-2 grid grid-cols-subgrid">
                    <dt className="text-muted">{it.k}</dt>
                    <dd className="font-medium">{it.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/** Reassurance line under the screen. */
export function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 text-label text-muted">
      <Lock className="mt-0.5 size-3.5 flex-none" aria-hidden />
      Your documents stay private to you and your lawyer. Nothing is shared until you choose to share it.
    </p>
  )
}
