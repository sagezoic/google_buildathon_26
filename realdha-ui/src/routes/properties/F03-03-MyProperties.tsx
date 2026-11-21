import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDot,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import {
  SEED_ROWS,
  SIGNED_STATUSES,
  STATUS_LABEL,
  type PropRow,
  type PropStatus,
} from '../../data/fixtures/f03-properties'
import { getPropertyThumbnail } from '../../data/property-images'
import { cn } from '../../lib/cn'
import { LIST_DEFAULT, useDrafts, useListUi, type ListUi } from '../../lib/f03-store'
import { usePropertyDraft } from '../../lib/property-store'
import { useSharedState } from '../../lib/shared-state'

const PAGE = 8

const TONE: Record<PropStatus, { tone: 'chain' | 'success' | 'info' | 'warning' | 'neutral'; Icon: LucideIcon }> = {
  anchored: { tone: 'chain', Icon: ShieldCheck },
  signed: { tone: 'success', Icon: CircleCheck },
  review: { tone: 'info', Icon: CircleDot },
  clarify: { tone: 'warning', Icon: TriangleAlert },
  checked: { tone: 'info', Icon: CircleCheck },
  draft: { tone: 'neutral', Icon: Pencil },
}

const ANCHORED = /anchor|signed|confirm|done|complete|minted/i

const ago = (ts: number | null) => {
  if (ts === null) return '5 d ago'
  const m = Math.round((Date.now() - ts) / 60000)
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`
}

function StatusPill({ s }: { s: PropStatus }) {
  const { tone, Icon } = TONE[s] ?? { tone: 'neutral', Icon: CircleDot }
  return (
    <Pill tone={tone} icon={<Icon className="size-3.5" />}>
      {STATUS_LABEL[s] ?? s}
    </Pill>
  )
}

/** F03-03 · My properties. Distilled registry view: high-density table on desktop, scannable list on mobile. */
export default function MyProperties() {
  useDemoState(['all'] as const)
  const [ui, setUi] = useListUi()
  const [draft] = usePropertyDraft()
  const [drafts] = useDrafts()
  const [anchor] = useSharedState<string | null>('anchor.status', null)
  const [signed] = useSharedState<unknown>('lawyer.signedOff', null)
  const patch = (p: Partial<ListUi>) => setUi((u) => ({ ...u, ...p }))

  const rows = useMemo<PropRow[]>(() => {
    const [plot, ...rest] = SEED_ROWS
    let status: PropStatus = 'anchored'
    let action = { label: 'Open', to: path('GP-16', { id: 'RA-LON-004-P-112-2' }) }

    if (draft.saved) {
      if (anchor && ANCHORED.test(anchor)) status = 'anchored'
      else if (signed) status = 'signed'
      else if (draft.stage === 'checked') {
        status = 'review'
      } else {
        status = 'draft'
        action = { label: 'Resume', to: path(draft.stage === 'details' ? 'GP-07' : 'GP-08') }
      }
    }

    const place = draft.village || 'Kusgaon'
    const mine: PropRow = {
      ...plot,
      title: `NA plot, Gat ${draft.gat || plot.title.split('Gat ')[1]}`,
      mTitle: `NA plot, Gat ${draft.gat || '112/2'}`,
      sub: `${place}, Lonavala`,
      mSub: `${place}, Lonavala`,
      status,
      action,
    }

    const formattedRest = rest.map((r) => {
      let resolvedTo = r.action.to
      if (r.id === 'a1804') resolvedTo = path('F04-01', { id: r.recordId ?? 'RA-PUN-001-A-18-04' })
      else if (r.id === 'alibag') resolvedTo = path('GP-12')
      else if (r.recordId) resolvedTo = path('GP-16', { id: r.recordId })
      return {
        ...r,
        action: {
          ...r.action,
          to: resolvedTo,
        },
      }
    })

    const drs: PropRow[] = drafts.map((d, i) => ({
      id: d.id,
      title: d.title,
      mTitle: d.mTitle,
      sub: d.sub,
      mSub: d.sub.replace(/ · .*/, ''),
      recordId: null,
      type: d.kind === 'plot' ? 'Plot' : d.kind === 'apartment' ? 'Apartment' : 'Commercial',
      status: 'draft',
      updated: ago(d.savedAt),
      rank: d.savedAt === null ? 50 : 200 + i,
      action: { label: 'Resume', to: path('F03-04') },
    }))

    return [mine, ...formattedRest, ...drs]
  }, [draft, drafts, anchor, signed])

  const inTab = (r: PropRow) =>
    ui.tab === 'all' || (ui.tab === 'signed' ? SIGNED_STATUSES.includes(r.status) : !SIGNED_STATUSES.includes(r.status))

  const q = ui.q.trim().toLowerCase()
  const filtered = rows
    .filter(inTab)
    .filter(
      (r) =>
        !q ||
        `${r.title} ${r.sub} ${r.recordId ?? ''} ${r.type} ${STATUS_LABEL[r.status]}`.toLowerCase().includes(q)
    )
    .sort((a, b) => b.rank - a.rank)

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const page = Math.min(ui.page, pages)
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE)

  const signedCount = rows.filter((r) => SIGNED_STATUSES.includes(r.status)).length

  const tabs = [
    { id: 'all', label: `All · ${rows.length}`, m: `All (${rows.length})` },
    { id: 'signed', label: `Signed off · ${signedCount}`, m: `Signed (${signedCount})` },
    { id: 'progress', label: `In progress · ${rows.length - signedCount}`, m: `In progress (${rows.length - signedCount})` },
  ] as const

  return (
    <Screen id="F03-03" role="owner">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-8 xl:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">My properties</h1>
            <p className="text-small text-muted">
              Permanent title records and on-chain verification for your properties.
            </p>
          </div>

          <Button to={path('GP-07')} size="md" icon={<Plus className="size-4" />}>
            Add property
          </Button>
        </div>

        {/* Toolbar: Scannable Tabs + Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Filter properties by status" className="flex border-b border-line sm:border-b-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={ui.tab === t.id}
                onClick={() => patch({ tab: t.id, page: 1 })}
                className={cn(
                  'cursor-pointer border-b-2 px-3.5 pb-2 text-small whitespace-nowrap transition-colors sm:rounded-control sm:border-0 sm:py-1.5 sm:text-chip',
                  ui.tab === t.id
                    ? 'border-primary font-semibold text-brand sm:bg-primary-tint sm:text-on-primary-tint'
                    : 'border-transparent font-medium text-muted hover:text-text sm:hover:bg-canvas'
                )}
              >
                <span className="sm:hidden">{t.m}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-72">
            <label htmlFor="prop-search" className="sr-only">
              Search properties
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="prop-search"
              type="search"
              placeholder="Search properties or ID..."
              value={ui.q}
              onChange={(e) => patch({ q: e.target.value, page: 1 })}
              className="h-9 w-full rounded-control border border-line bg-surface pr-8 pl-9 text-small text-text outline-none placeholder:text-muted focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]"
            />
            {ui.q && (
              <button
                type="button"
                onClick={() => patch({ q: '', page: 1 })}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-text"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Content: Registry Table on Desktop/Tablet, Responsive List on Mobile */}
        {shown.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center shadow-e1">
            <div className="flex size-12 items-center justify-center rounded-full bg-skeleton text-muted">
              <CircleAlert className="size-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-text">No properties found</h2>
              <p className="mt-1 text-small text-muted">
                {ui.q ? 'No records match your search query.' : 'There are no properties in this view.'}
              </p>
            </div>
            {ui.q ? (
              <Button variant="secondary" size="sm" onClick={() => setUi(LIST_DEFAULT)}>
                Clear search
              </Button>
            ) : (
              <Button to={path('GP-07')} size="sm" icon={<Plus className="size-4" />}>
                Add property
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden p-0 shadow-e1">
            {/* Desktop & Tablet Table (>=640px) */}
            <div className="hidden sm:block">
              <table className="w-full border-collapse text-small">
                <thead>
                  <tr className="border-b border-line bg-sunken text-left text-label font-semibold text-muted">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Property
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Record ID
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Updated
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => {
                    const thumb = getPropertyThumbnail(r.id, r.type)
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-canvas/50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={thumb}
                              alt=""
                              loading="lazy"
                              className="size-11 rounded-control object-cover bg-sunken shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={r.action.to}
                                className="font-semibold text-text hover:text-brand transition-colors line-clamp-1"
                              >
                                {r.title}
                              </Link>
                              <div className="text-chip text-muted">{r.sub}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {r.recordId ? (
                            <RecordId id={r.recordId} className="text-chip font-mono" />
                          ) : (
                            <span className="font-mono text-chip text-muted">Draft</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusPill s={r.status} />
                        </td>
                        <td className="px-4 py-3.5 text-chip text-muted whitespace-nowrap">{r.updated}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant={r.action.primary ? 'primary' : 'secondary'}
                            to={r.action.to}
                          >
                            {r.action.label}
                            <span className="sr-only"> {r.title}</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List (<640px) */}
            <div className="divide-y divide-line sm:hidden">
              {shown.map((r) => {
                const thumb = getPropertyThumbnail(r.id, r.type)
                return (
                  <div key={r.id} className="flex items-center gap-3.5 p-3.5">
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      className="size-14 rounded-control object-cover bg-sunken shrink-0"
                    />
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <Link
                          to={r.action.to}
                          className="text-body font-semibold text-text hover:text-brand transition-colors line-clamp-1"
                        >
                          {r.mTitle}
                        </Link>
                        <div className="text-chip text-muted truncate">{r.mSub}</div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <StatusPill s={r.status} />
                        <Button
                          size="sm"
                          variant={r.action.primary ? 'primary' : 'secondary'}
                          to={r.action.to}
                          className="h-8 px-3 text-chip"
                        >
                          {r.action.label}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Pagination Bar (only when multiple pages exist) */}
        {pages > 1 && (
          <nav aria-label="Properties pagination" className="flex items-center justify-between text-chip text-muted pt-2 border-t border-line">
            <span>
              Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => patch({ page: page - 1 })}
                icon={<ChevronLeft className="size-4" aria-hidden />}
              >
                Previous
              </Button>
              <span aria-current="page" className="font-medium text-text px-2">
                {page} of {pages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= pages}
                onClick={() => patch({ page: page + 1 })}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </nav>
        )}
      </div>
    </Screen>
  )
}
