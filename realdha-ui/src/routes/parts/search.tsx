import { AlertCircle, CheckCircle2, Link2, Search, TriangleAlert } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { INITIAL_RECENT, INITIAL_SEARCH, parseQuery, runSearch, priceShort, type Property, type SearchState } from '../../data/fixtures/f08-search'
import { getPropertyThumbnail } from '../../data/property-images'
import { useSharedState } from '../../lib/shared-state'
import { cn } from '../../lib/cn'

/** Persisted query and filters (`f08.search`) and recent searches (`f08.recent`). */
export const useSearch = () => useSharedState<SearchState>('f08.search', INITIAL_SEARCH)
export const useRecent = () => useSharedState<string[]>('f08.recent', INITIAL_RECENT)

/** Save the query, remember it, and open the screen that fits: direct hit, invalid ID, no results or results. */
export function useRunSearch() {
  const navigate = useNavigate()
  const [, setSearch] = useSearch()
  const [, setRecent] = useRecent()
  return (raw: string) => {
    const q = raw.trim()
    setSearch((s) => ({ ...s, q }))
    setRecent((r) => [q, ...r.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6))
    const { parsed, results } = runSearch(q, INITIAL_SEARCH.filters)
    if (parsed.kind === 'id-hit') return navigate(path('F08-04'))
    if (parsed.kind === 'id-invalid') return navigate(`${path('F08-03')}?state=invalid`)
    return navigate(results.length ? path('F08-02') : `${path('F08-03')}?state=none`)
  }
}
export { parseQuery }

export const EMPTY_ERROR = 'Enter a property ID, locality or address.'

/** Search input with a Search button. `size` big = the 56px home field. */
export function SearchBar({ value, onChange, onSubmit, error, size = 'md', mono, placeholder, label = 'Search properties', className }: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  error?: string
  size?: 'big' | 'md'
  mono?: boolean
  placeholder?: string
  label?: string
  className?: string
}) {
  const id = useId()
  return (
    <form role="search" className={cn('flex flex-col', className)} onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className={cn('flex gap-2.5', size === 'big' && 'max-md:flex-col')}>
        <input
          id={id} aria-label={label} value={value} placeholder={placeholder} autoComplete="off" spellCheck={false}
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'min-w-0 flex-1 rounded-control border-2 bg-field px-3.5 text-text outline-none placeholder:text-muted focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]',
            size === 'big' ? 'h-12 text-body md:h-14' : 'h-11 text-control md:h-12',
            mono && 'font-mono text-small',
            error ? 'border-danger-ink' : 'border-primary',
          )}
        />
        <Button type="submit" size="lg" className={cn(size === 'big' && 'md:h-14 md:px-7 md:text-body')} icon={<Search className="size-4" aria-hidden />}>Search</Button>
      </div>
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-chip font-semibold text-danger-ink"><AlertCircle className="size-4" aria-hidden />{error}</p>}
    </form>
  )
}

/** Verification pills for a property (never colour alone: icon + word). */
export function StatusPills({ p, short }: { p: Property; short?: boolean }) {
  return (
    <>
      {p.newLaunch && <Pill tone="neutral">New launch</Pill>}
      {p.status === 'signed-off'
        ? <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Signed off</Pill>
        : <Pill tone="warning" icon={<TriangleAlert className="size-4" />}>Lawyer review</Pill>}
      {p.onChain && <Pill tone="chain" icon={<Link2 className="size-4" />}>{short ? 'On-chain' : 'Anchored on-chain'}</Pill>}
    </>
  )
}

export const idChip = 'rounded-control border border-line bg-sunken px-1.5 py-0.5 font-mono text-label font-medium'

/** Result card (F08-02, F09-01 mobile). Opens the full record. */
export function PropertyCard({ p, sub, note, shortPills }: { p: Property; sub: string; note?: boolean; shortPills?: boolean }) {
  const thumb = getPropertyThumbnail(p.id, p.type)
  return (
    <Link
      to={`${path('F09-03')}?id=${p.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface text-text no-underline shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
        <img
          src={thumb}
          alt={p.label}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-1.5">
          <span className="rounded-control bg-surface/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-text shadow-e1 backdrop-blur-xs">
            {p.id}
          </span>
          <span className="rounded-control bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary shadow-e1">
            {priceShort(p.price)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5 md:p-4">
        <div className="text-control font-semibold text-text group-hover:text-brand md:text-body">
          {p.label}
        </div>
        <div className="text-chip text-muted">{sub}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <StatusPills p={p} short={shortPills} />
        </div>
        {note && <div className="mt-1 text-chip text-muted max-md:hidden">{p.note}</div>}
      </div>
    </Link>
  )
}

export function Pager({ page, pages, onPage, className }: { page: number; pages: number; onPage: (p: number) => void; className?: string }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-3', className)}>
      <span className="text-chip text-muted">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="max-md:h-11" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="secondary" size="sm" className="max-md:h-11" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </nav>
  )
}

/** Segmented two-option switch (Map / List, Projects / Properties). */
export function Seg<T extends string>({ value, options, onChange, label, className }: { value: T; options: { id: T; label: ReactNode }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex self-start overflow-hidden rounded-control border border-line-strong bg-surface text-chip', className)}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)} className={cn('min-h-11 cursor-pointer px-3.5 md:min-h-9', value === o.id ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
