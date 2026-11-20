import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { SampleData } from '../components/ui/record-id'
import { FRAME_FILTERS, activeFilters, dropFilter, runSearch } from '../data/fixtures/f08-search'
import { cn } from '../lib/cn'
import { FilterDrawer } from './parts/FilterPanel'
import { EMPTY_ERROR, Pager, PropertyCard, SearchBar, Seg, useRecent, useSearch } from './parts/search'

const PAGE = 5
const PINS = ['left-[22%] top-[26%]', 'left-[48%] top-[44%]', 'left-[66%] top-[22%]', 'left-[30%] top-[66%]', 'left-[72%] top-[70%]', 'left-[12%] top-[48%]']

/** F08-02 · Results. 1440: list + map, filters drawer. 834/390: list or map toggle, filters sheet. Filters really narrow the sample dataset. */
export default function Results() {
  const [mode, setMode] = useDemoState(['list', 'filtered', 'filters'] as const)
  const navigate = useNavigate()
  const [search, setSearch] = useSearch()
  const [, setRecent] = useRecent()
  const [draft, setDraft] = useState(search.q)
  const [error, setError] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(mode === 'filters')

  // The drawn states load the frame's query and filters once, so every control then works from them.
  useEffect(() => {
    if (mode === 'list') return
    setSearch((s) => ({ q: s.q || 'Baner, Pune', filters: FRAME_FILTERS }))
    setDraft((d) => d || 'Baner, Pune')
    setOpen(mode === 'filters')
  }, [mode, setSearch])

  const { parsed, results } = useMemo(() => runSearch(search.q, search.filters), [search])
  const chips = activeFilters(search.filters)
  const pages = Math.max(1, Math.ceil(results.length / PAGE))
  const cur = Math.min(page, pages)
  const shown = results.slice((cur - 1) * PAGE, cur * PAGE)
  const localities = Array.from(new Set(results.map((p) => p.locality)))
  const sub = (p: (typeof results)[number]) => `${p.locality}, ${p.city}`

  // A query that is an ID, or that finds nothing at all, belongs on the F08-03 / F08-04 screens.
  const submit = () => {
    if (!draft.trim() && !search.q) return setError(EMPTY_ERROR)
    setError(''); setPage(1)
    const q = draft.trim()
    setSearch((s) => ({ ...s, q }))
    if (q) setRecent((r) => [q, ...r.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6))
    const r = runSearch(q, search.filters)
    if (r.parsed.kind === 'id-hit') navigate(path('F08-04'))
    else if (r.parsed.kind === 'id-invalid') navigate(`${path('F08-03')}?state=invalid`)
    else if (!r.results.length) navigate(`${path('F08-03')}?state=none`)
  }
  const apply = (f: typeof search.filters) => { setSearch((s) => ({ ...s, filters: f })); setPage(1) }
  const setFilters = (f: typeof search.filters) => { apply(f); if (mode !== 'list') setMode('list') }

  const map = (
    <div className={cn('relative min-h-[320px] overflow-hidden rounded-card border border-line bg-sunken xl:min-h-full xl:rounded-none xl:border-0 xl:border-l', view === 'list' && 'max-xl:hidden')}>
      <div className="absolute top-3 left-3 rounded-control border border-line bg-surface px-2.5 py-1 text-label xl:top-4 xl:left-4">Map placeholder · {results.length} results · pins for {localities.join(', ') || 'no area'}</div>
      {localities.slice(0, PINS.length).map((l, i) => (
        <Link key={l} to={`${path('F09-01')}?area=${l}`} aria-label={`Open ${l} on the area map`} className={cn('absolute flex min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border-2 border-white bg-primary px-2 text-label font-semibold text-on-primary no-underline', PINS[i])}>
          {results.filter((p) => p.locality === l).length}
        </Link>
      ))}
    </div>
  )

  const filterButton = (
    <Button variant="secondary" size="sm" className={cn('max-md:h-11', chips.length && 'border-primary')} icon={<SlidersHorizontal className="size-4" aria-hidden />} onClick={() => setOpen(true)}>
      <span className="md:hidden">Filters{chips.length ? ` · ${chips.length}` : ''}</span>
      <span className="max-md:hidden">Filters{chips.length ? ` · ${chips.length} active` : ''}</span>
    </Button>
  )

  return (
    <Screen id="F08-02" back={path('F08-01')} title="Results">
      <div className="flex flex-col gap-3 border-b-line bg-surface px-4 py-3.5 max-xl:bg-canvas xl:flex-row xl:flex-wrap xl:items-center xl:border-b xl:px-12">
        <SearchBar value={draft} error={error} label="Search properties" size="md" onChange={(v) => { setDraft(v); setError('') }} onSubmit={submit} className="xl:w-[520px] [&_button]:max-xl:hidden xl:[&_input]:border xl:[&_input]:border-line-strong xl:[&_input]:h-control" />
        <div className="flex items-center justify-between gap-2 xl:contents">
          <Seg<'list' | 'map'> label="Results view" value={view} onChange={setView} className="xl:hidden" options={[{ id: 'list', label: 'List' }, { id: 'map', label: 'Map' }]} />
          {filterButton}
        </div>
        <ul aria-label="Active filters" className="flex flex-wrap gap-2 max-xl:hidden">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" aria-label={`Remove filter ${c.label}`} onClick={() => apply(dropFilter(search.filters, c.key))} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-pill bg-skeleton py-0.5 pr-2 pl-3 text-label font-medium text-muted hover:bg-primary-tint">
                {c.label}<X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div role="status" className="flex items-center gap-2 text-chip text-muted xl:ml-auto">{results.length} result{results.length === 1 ? '' : 's'} · <SampleData /></div>
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-canvas p-4 xl:grid xl:grid-cols-[460px_1fr] xl:gap-0 xl:p-0">
        <div className={cn('flex flex-col gap-3 xl:p-4', view === 'map' && 'max-xl:hidden')}>
          {shown.map((p) => <PropertyCard key={p.id} p={p} sub={sub(p)} note shortPills />)}
          {!results.length && (
            <div role="status" className="rounded-card border border-line bg-surface p-5 text-small">
              Nothing matches {parsed.q ? `"${parsed.q}"` : 'these filters'}. <Link to={`${path('F08-03')}?state=none`} className="font-medium text-primary-text">See how to widen it</Link>
            </div>
          )}
          <Pager page={cur} pages={pages} onPage={setPage} />
        </div>
        {map}
      </div>

      <FilterDrawer open={open} onOpenChange={(o) => { setOpen(o); if (!o && mode === 'filters') setMode('list') }} filters={search.filters} onChange={setFilters} count={results.length} />
    </Screen>
  )
}
