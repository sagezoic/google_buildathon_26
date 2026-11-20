import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Pencil, Search, ShieldCheck, TriangleAlert, CircleDot, type LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { SelectField } from '../../components/ui/select-field'
import { SEED_ROWS, SIGNED_STATUSES, STATUS_LABEL, type PropRow, type PropStatus } from '../../data/fixtures/f03-properties'
import { cn } from '../../lib/cn'
import { LIST_DEFAULT, useDrafts, useListUi, type ListUi } from '../../lib/f03-store'
import { usePropertyDraft } from '../../lib/property-store'
import { useSharedState } from '../../lib/shared-state'

const PAGE = 5
const TONE: Record<PropStatus, { tone: 'chain' | 'success' | 'info' | 'warning' | 'neutral'; Icon: LucideIcon }> = {
  anchored: { tone: 'chain', Icon: ShieldCheck },
  signed: { tone: 'success', Icon: CircleCheck },
  review: { tone: 'info', Icon: CircleDot },
  clarify: { tone: 'warning', Icon: TriangleAlert },
  checked: { tone: 'info', Icon: CircleCheck },
  draft: { tone: 'neutral', Icon: Pencil },
}
const TYPES = ['All types', 'Plot', 'Apartment', 'Commercial'] as const
const SORTS = [{ v: 'recent', l: 'Recently updated' }, { v: 'title', l: 'Name A to Z' }] as const
const ANCHORED = /anchor|signed|confirm|done|complete|minted/i
const ago = (ts: number | null) => {
  if (ts === null) return '5 d ago'
  const m = Math.round((Date.now() - ts) / 60000)
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`
}

function StatusPill({ s }: { s: PropStatus }) {
  const { tone, Icon } = TONE[s]
  return <Pill tone={tone} icon={<Icon className="size-3.5" />}>{STATUS_LABEL[s]}</Pill>
}

/** F03-03 · My properties. Lists the GP-07 plot (property.draft), A-1804, the sample rows and saved drafts. Tabs, search, type filter, sort, pagination. */
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
    let action = plot.action
    if (draft.saved) {
      if (anchor && ANCHORED.test(anchor)) status = 'anchored'
      else if (signed) status = 'signed'
      else if (draft.stage === 'checked') { status = 'review' }
      else { status = 'draft'; action = { label: 'Resume', to: path(draft.stage === 'details' ? 'GP-07' : 'GP-08') } }
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
    return [mine, ...rest, ...drs]
  }, [draft, drafts, anchor, signed])

  const inTab = (r: PropRow) => ui.tab === 'all' || (ui.tab === 'signed') === SIGNED_STATUSES.includes(r.status)
  const q = ui.q.trim().toLowerCase()
  const filtered = rows
    .filter(inTab)
    .filter((r) => ui.type === 'All types' || r.type === ui.type)
    .filter((r) => !q || `${r.title} ${r.sub} ${r.recordId ?? ''} ${r.type} ${STATUS_LABEL[r.status]}`.toLowerCase().includes(q))
    .sort((a, b) => (ui.sort === 'title' ? a.title.localeCompare(b.title) : b.rank - a.rank))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const page = Math.min(ui.page, pages)
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE)
  const signedCount = rows.filter((r) => SIGNED_STATUSES.includes(r.status)).length
  const tabs = [
    { id: 'all', label: `All · ${rows.length}`, m: `All · ${rows.length}` },
    { id: 'progress', label: `In progress · ${rows.length - signedCount}`, m: 'Progress' },
    { id: 'signed', label: `Signed off · ${signedCount}`, m: 'Signed' },
  ] as const
  const filtering = !!q || ui.type !== 'All types'

  return (
    <Screen id="F03-03" role="owner">
      <div className="flex flex-1 flex-col gap-4 px-4 py-5 md:px-8 xl:px-12 xl:py-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-h1 max-md:text-[24px] max-md:leading-8">My properties</h1>
          <Button to={path('GP-07')} size="md" className="max-md:h-11 max-md:px-3.5">
            <span className="md:hidden">+ Add</span>
            <span className="max-md:hidden">+ Add property</span>
          </Button>
        </div>

        <div role="tablist" aria-label="Properties" className="flex overflow-x-auto border-b border-line">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={ui.tab === t.id} onClick={() => patch({ tab: t.id, page: 1 })} className={cn('-mb-px min-h-11 cursor-pointer border-b-[3px] px-3.5 text-small whitespace-nowrap', ui.tab === t.id ? 'border-primary font-semibold text-brand' : 'border-transparent font-medium text-muted hover:text-text')}>
              <span className="xl:hidden">{t.m}</span>
              <span className="max-xl:hidden">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative min-w-0 flex-1 md:max-w-[360px]">
            <label htmlFor="prop-search" className="sr-only">Search properties</label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input id="prop-search" type="search" placeholder="Search name, record ID or status" value={ui.q} onChange={(e) => patch({ q: e.target.value, page: 1 })} className="h-control w-full rounded-control border border-line-strong bg-field pr-3 pl-9 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]" />
          </form>
          <SelectField className="w-40" label="Type" options={TYPES} value={ui.type} onChange={(e) => patch({ type: e.target.value, page: 1 })} />
          <SelectField className="w-48" label="Sort by" options={SORTS.map((s) => s.l)} value={SORTS.find((s) => s.v === ui.sort)!.l} onChange={(e) => patch({ sort: SORTS.find((s) => s.l === e.target.value)!.v })} />
          {(filtering || ui.tab !== 'all') && <Button variant="ghost" onClick={() => setUi(LIST_DEFAULT)}>Clear filters</Button>}
        </div>

        <div aria-live="polite" className="sr-only">{filtered.length} properties</div>

        {shown.length === 0 ? (
          <Card className="flex items-center gap-2 text-small text-muted"><CircleAlert className="size-4" aria-hidden />No properties match. Clear the filters to see all.</Card>
        ) : (
          <>
            {/* 1440 table */}
            <Card className="overflow-hidden p-0 max-xl:hidden">
              <table className="w-full border-collapse text-small">
                <thead>
                  <tr className="border-b border-line bg-sunken text-left text-label font-semibold text-muted">
                    {['Property', 'Record ID', 'Type', 'Status', 'Updated'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}
                    <th scope="col" className="px-4 py-2.5"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3"><b className="font-semibold">{r.title}</b><div className="text-label text-muted">{r.sub}</div></td>
                      <td className={cn('px-4 py-3 font-mono text-chip', !r.recordId && 'text-muted')}>{r.recordId ?? 'RA-———'}</td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3"><StatusPill s={r.status} /></td>
                      <td className="px-4 py-3 text-muted">{r.updated}</td>
                      <td className="px-4 py-3 text-right"><Button size="sm" variant={r.action.primary ? 'primary' : 'secondary'} to={r.action.to}>{r.action.label}<span className="sr-only"> {r.title}</span></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* 834 and 390 cards */}
            <ul className="flex flex-col gap-3 md:grid md:grid-cols-2 xl:hidden">
              {shown.map((r) => (
                <li key={r.id}>
                  <Card className="flex flex-col gap-1.5 p-3.5">
                    <div className="text-body font-semibold">{r.mTitle}</div>
                    <div className="text-label text-muted">{r.mSub}</div>
                    {r.recordId ? <RecordId id={r.recordId} className="self-start text-label" /> : <span className="font-mono text-label text-muted">RA-———</span>}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <StatusPill s={r.status} />
                      <Button size="sm" variant={r.action.primary ? 'primary' : 'secondary'} className="max-xl:min-h-11" to={r.action.to}>{r.action.label}<span className="sr-only"> {r.mTitle}</span></Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}

        <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-chip text-muted">
          <span>{filtered.length === 0 ? '0 properties' : `Showing ${(page - 1) * PAGE + 1}–${(page - 1) * PAGE + shown.length} of ${filtered.length}`}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="max-md:min-h-11" disabled={page <= 1} onClick={() => patch({ page: page - 1 })} icon={<ChevronLeft className="size-4" aria-hidden />}>Previous</Button>
            <span aria-current="page">Page {page} of {pages}</span>
            <Button size="sm" variant="secondary" className="max-md:min-h-11" disabled={page >= pages} onClick={() => patch({ page: page + 1 })}>Next<ChevronRight className="size-4" aria-hidden /></Button>
          </div>
        </nav>
        <div className="flex items-center gap-2 text-label text-muted"><SampleData />Pills always carry an icon and a word.</div>
      </div>
    </Screen>
  )
}
