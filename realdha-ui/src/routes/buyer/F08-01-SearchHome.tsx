import { X } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../app/Shell'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { EMPTY_ERROR, SearchBar, useRecent, useRunSearch, useSearch } from '../parts/search'

const isId = (s: string) => /^RA-/i.test(s)
const TRY = ['Baner', 'Wakad', 'Hinjewadi', 'RA-PUN-001-A-18-04']

/** F08-01 · Search home. The query persists (`f08.search`); recent searches (`f08.recent`) can be run, removed or cleared. */
export default function SearchHome() {
  const [search, setSearch] = useSearch()
  const [recent, setRecent] = useRecent()
  const run = useRunSearch()
  const [error, setError] = useState('')
  const go = (q: string) => (q.trim() ? run(q) : setError(EMPTY_ERROR))

  return (
    <Screen id="F08-01">
      <div className="flex flex-1 justify-center px-4 py-5 md:px-12 md:py-7">
        <div className="flex w-full max-w-[760px] flex-col gap-4 md:gap-5">
          <div className="text-center md:pt-9">
            <h1 className="text-h1 max-md:text-left md:text-[34px] md:leading-[42px]">Find a verified property</h1>
            <p className="mt-2 text-control leading-[22px] text-muted max-md:hidden">Search by Realdha ID, locality or address.</p>
          </div>
          <SearchBar
            size="big" value={search.q} error={error}
            placeholder="Property ID, locality or address"
            onChange={(v) => { setSearch((s) => ({ ...s, q: v })); setError('') }}
            onSubmit={() => go(search.q)}
          />
          <div className="flex flex-wrap items-center gap-2 md:justify-center">
            <span className="text-chip text-muted max-md:hidden">Try:</span>
            {TRY.map((t) => (
              <button key={t} type="button" onClick={() => go(t)} className={isId(t) ? 'max-md:hidden' : ''}>
                <Pill tone="neutral" className="min-h-8 cursor-pointer hover:bg-primary-tint md:min-h-0"><span className={isId(t) ? 'font-mono' : ''}>{t}</span></Pill>
              </button>
            ))}
          </div>

          <Card className="p-4 md:mt-3 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 md:text-h2">Recent searches</h2>
              {recent.length > 0 && <button type="button" onClick={() => setRecent([])} className="min-h-11 cursor-pointer text-chip font-medium text-primary-text md:min-h-0">Clear all</button>}
            </div>
            {recent.length === 0 && <p role="status" className="py-3 text-small text-muted">No recent searches.</p>}
            <ul>
              {recent.map((r, i) => (
                <li key={r} className={`flex items-center justify-between gap-2 border-b border-line last:border-b-0 ${i >= 3 ? 'max-md:hidden' : ''}`}>
                  <button type="button" onClick={() => go(r)} className={`min-h-11 flex-1 cursor-pointer py-3 text-left text-small hover:text-brand ${isId(r) ? 'font-mono' : ''}`}>{r}</button>
                  <button type="button" aria-label={`Remove ${r}`} onClick={() => setRecent((x) => x.filter((y) => y !== r))} className="inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint md:size-9"><X className="size-4" aria-hidden /></button>
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-center text-chip text-muted max-md:hidden">IDs look like RA-CITY-ZONE-TYPE-NUMBER. Sample data.</p>
        </div>
      </div>
    </Screen>
  )
}
