import { SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { SampleData } from '../../components/ui/record-id'
import { FRAME_FILTERS, activeFilters, dropFilter, inr, runSearch, priceShort, type Property } from '../../data/fixtures/f08-search'
import { cn } from '../../lib/cn'
import { FilterDrawer } from '../parts/FilterPanel'
import { EMPTY_ERROR, Pager, PropertyCard, SearchBar, Seg, StatusPills, useRecent, useSearch } from '../parts/search'
import OsmMap from '../../components/map/OsmMap'
import OsmMarker from '../../components/map/OsmMarker'

const PAGE = 5
const MAP_PINS = 30

const LOCALITY_COORDS: Record<string, [number, number]> = {
  Baner: [73.7868, 18.5590],
  Balewadi: [73.7707, 18.5789],
  Wakad: [73.7631, 18.5987],
  Hinjewadi: [73.7299, 18.5913],
  Aundh: [73.8055, 18.5580],
  Kothrud: [73.8118, 18.5074],
  Kusgaon: [73.4062, 18.7546],
}

function propertyCoord(p: Property, index: number): [number, number] {
  const base = LOCALITY_COORDS[p.locality] ?? [73.8567, 18.5204]
  const angle = (index * 137.5 * Math.PI) / 180
  const r = 0.0035 * Math.sqrt((index % 6) + 1)
  return [base[0] + r * Math.cos(angle), base[1] + r * Math.sin(angle) * 0.8]
}

/** F08-02 · Results. 1440: list + map, filters drawer. 834/390: list or map toggle, filters sheet. Filters really narrow the sample dataset. */
export default function Results() {
  const [mode, setMode] = useDemoState(['list', 'filtered', 'filters'] as const)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useSearch()
  const [, setRecent] = useRecent()
  const paramQ = searchParams.get('q')
  const [draft, setDraft] = useState(paramQ ?? search.q)
  const [error, setError] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(mode === 'filters')

  // Synchronize URL search param `?q=` if present
  useEffect(() => {
    if (paramQ && paramQ !== search.q) {
      setSearch((s) => ({ ...s, q: paramQ }))
      setDraft(paramQ)
    }
  }, [paramQ, search.q, setSearch])

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

  const [selectedPropId, setSelectedPropId] = useState<string | null>(null)
  const selectedProp = useMemo(() => results.find((p) => p.id === selectedPropId), [results, selectedPropId])

  // Stable positions and handlers: the marker layer only rebuilds when the result set changes, not on every keystroke.
  const pins = useMemo(() => results.slice(0, MAP_PINS).map((p, i) => ({ p, coord: propertyCoord(p, i), select: () => setSelectedPropId(p.id) })), [results])
  const closePreview = useCallback(() => setSelectedPropId(null), [])
  useEffect(() => {
    if (!selectedPropId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePreview() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPropId, closePreview])

  const map = (
    <div className={cn('relative min-h-[380px] overflow-hidden rounded-card border border-line bg-sunken xl:min-h-full xl:rounded-none xl:border-0 xl:border-l', view === 'list' && 'max-xl:hidden')}>
      <OsmMap center={[73.7868, 18.5590]} zoom={13} showThemeToggle className="size-full">
        <div className="absolute top-3 left-3 z-10 rounded-control border border-line bg-surface px-2.5 py-1 text-label font-medium text-text shadow-e1 xl:top-4 xl:left-4">
          {pins.length < results.length ? `Map shows ${pins.length} of ${results.length} properties` : `${results.length} propert${results.length === 1 ? 'y' : 'ies'} on map`}
        </div>

        {/* Property markers */}
        {pins.map(({ p, coord, select }) => {
          const isSelected = selectedPropId === p.id
          return (
            <OsmMarker key={p.id} position={coord} onClick={select} ariaLabel={`${p.label}, ${inr(p.price)}`}>
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-pill border-2 px-2.5 py-1 text-chip font-semibold shadow-e2 transition-transform duration-[var(--rd-dur-fast)] motion-reduce:transition-none',
                  isSelected
                    ? 'scale-110 border-primary bg-primary text-on-primary'
                    : 'border-surface bg-surface text-text hover:scale-105 hover:border-primary'
                )}
              >
                <span className={cn('size-1.5 rounded-full', isSelected ? 'bg-on-primary' : 'bg-primary')} aria-hidden />
                <span className="tabular">{priceShort(p.price)}</span>
              </div>
            </OsmMarker>
          )
        })}

        {/* Selected Property Popup Card */}
        {selectedProp && (
          <div role="dialog" aria-label="Property preview" className="absolute right-4 bottom-4 left-4 z-20 mx-auto max-w-sm rounded-card border border-line bg-surface p-4 shadow-e2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-chip text-muted">{selectedProp.locality}, {selectedProp.city}</div>
                <div className="text-small font-semibold text-text">{selectedProp.unit} · {selectedProp.project}</div>
                <div className="tabular mt-1 text-chip font-semibold text-primary-text">{inr(selectedProp.price)} · {selectedProp.label}</div>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="-mt-1.5 -mr-1.5 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint hover:text-text md:size-9"
                aria-label="Close preview"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              <div className="flex flex-wrap gap-1.5"><StatusPills p={selectedProp} short /></div>
              <Button to={`${path('F09-03')}?id=${selectedProp.id}`} size="sm" className="shrink-0 max-md:h-11">View property</Button>
            </div>
          </div>
        )}
      </OsmMap>
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
        <ul aria-label="Active filters" className="flex flex-wrap gap-2 max-md:hidden">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" aria-label={`Remove filter ${c.label}`} onClick={() => apply(dropFilter(search.filters, c.key))} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-pill bg-skeleton py-0.5 pr-2 pl-3 text-label font-medium text-muted hover:bg-primary-tint">
                {c.label}<X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div role="status" className="flex items-center gap-2 text-chip text-muted xl:ml-auto"><span className="tabular">{results.length} result{results.length === 1 ? '' : 's'}</span> · <SampleData /></div>
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
