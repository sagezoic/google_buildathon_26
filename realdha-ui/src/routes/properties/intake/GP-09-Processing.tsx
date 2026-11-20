import { Circle, CircleAlert, CircleCheck, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistentState } from '../../../app/persist'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Meter } from '../../../components/ui/meter'
import { processingCards, processingRows, SHORT, slotLabel, type StoredDoc } from '../../../data/fixtures/property-intake'
import { languageName, processDocument } from '../../../lib/property-api'
import { usePropertyDocuments, usePropertyDraft } from '../../../lib/property-store'
import { cn } from '../../../lib/cn'

const spin = 'animate-spin motion-reduce:animate-none'
const TOTAL_SECONDS = 150
const TICK_MS = 400
const STEP = 4

interface Row { name: string; state: 'done' | 'active' | 'waiting' | 'failed'; pct: number; meta: string; page: string; status: string; headline: string; error?: string }

const docName = (d: StoredDoc) => (d.slot === 'extra' ? d.file : slotLabel(d.slot))
const plural = (n: number) => `${n} page${n === 1 ? '' : 's'}`

/** Per-document progress derived from the overall percentage: documents are read one after another. */
function liveRows(docs: StoredDoc[], pct: number): Row[] {
  const n = Math.max(1, docs.length)
  const seg = 100 / n
  const idx = Math.min(n - 1, Math.floor(pct / seg))
  return docs.map((d, i) => {
    const mine = pct >= 100 || i < idx ? 100 : i > idx ? 0 : ((pct - i * seg) / seg) * 100
    const state = mine >= 100 ? 'done' : mine > 0 || i === idx ? 'active' : 'waiting'
    const lang = d.langs?.join(', ')
    const page = d.pages ? `Page ${Math.min(d.pages, Math.floor((mine / 100) * d.pages) + 1)} of ${d.pages}` : ''
    const name = docName(d)
    return {
      name, state, pct: mine, page,
      meta: [lang, d.pages ? plural(d.pages) : d.size].filter(Boolean).join(' · '),
      status: state === 'done' ? 'Done' : state === 'waiting' ? 'Queued' : ['Reading', lang, page.toLowerCase()].filter(Boolean).join(' · '),
      headline: ['Reading ' + (SHORT[d.slot] ?? name), lang, page.toLowerCase()].filter(Boolean).join(' – '),
    }
  })
}

/** Rows for documents that live on the server: state comes from each document's real processing status. */
function serverRows(docs: StoredDoc[]): Row[] {
  return docs.map((d) => {
    const name = docName(d)
    const lang = d.langs?.join(', ')
    const state: Row['state'] = d.status === 'processed' ? 'done' : d.status === 'processing' ? 'active' : d.status === 'failed' ? 'failed' : 'waiting'
    return {
      name, state, pct: state === 'done' ? 100 : state === 'active' ? 50 : 0, page: '', error: d.error,
      meta: [lang, d.pages ? plural(d.pages) : d.size].filter(Boolean).join(' · '),
      status: state === 'done' ? 'Done' : state === 'waiting' ? 'Queued' : state === 'failed' ? (d.error ?? 'Could not read this file') : 'Reading and translating',
      headline: state === 'failed' ? `Could not read ${SHORT[d.slot] ?? name}` : 'Reading ' + (SHORT[d.slot] ?? name),
    }
  })
}

const frozenRows = (): Row[] => processingRows.map((r) => ({ name: r.name, state: r.state, pct: r.state === 'done' ? 100 : r.state === 'active' ? 50 : 0, meta: 'meta' in r ? r.meta : '', page: 'page' in r ? r.page : '', status: '', headline: '' }))

const mins = (sec: number) => (sec >= 60 ? `${Math.floor(sec / 60)} min ${sec % 60} s` : `${sec} s`)

/** GP-09 · Gemini processing. 1440: overall card + per-document rows. 834/390: one progress card per document. Advances on a timer, then opens GP-10. */
export default function Processing() {
  const [mode] = useDemoState(['live', 'reading'] as const)
  const navigate = useNavigate()
  const [docs, setDocs] = usePropertyDocuments()
  const [draft, setDraft] = usePropertyDraft()
  const [check, setCheck] = usePersistentState('property.check', { pct: 0 })
  /** A finished check (100) from an earlier visit starts over; an interrupted one resumes. */
  const [stale, setStale] = useState(check.pct >= 100)
  const live = mode === 'live'
  /** Real check: every document is on the server, so Document AI and Translation do the reading. Otherwise the timer simulates it. */
  const real = live && !!draft.id && docs.length > 0 && docs.every((d) => d.id)
  const sRows = real ? serverRows(docs) : []
  const sDone = sRows.filter((r) => r.state === 'done').length
  const sActive = sRows.some((r) => r.state === 'active')
  const pct = real ? ((sDone + (sActive ? 0.5 : 0)) / sRows.length) * 100 : live ? (stale ? 0 : check.pct) : 34
  const done = real ? sDone === sRows.length : live && !stale && check.pct >= 100

  // Reads the documents one after another. The ref keeps React StrictMode's second effect run from starting a duplicate pass; Retry bumps `attempt`.
  const [attempt, setAttempt] = useState(0)
  const running = useRef(false)
  useEffect(() => {
    if (!real || !draft.id || running.current) return
    const propertyId = draft.id
    const patch = (id: string, p: Partial<StoredDoc>) => setDocs((ds) => ds.map((d) => (d.id === id ? { ...d, ...p } : d)))
    running.current = true
    void (async () => {
      try {
        for (const d of docs.filter((x) => x.status !== 'processed')) {
          patch(d.id!, { status: 'processing', error: undefined })
          try {
            const r = await processDocument(propertyId, d.id!)
            patch(d.id!, { status: 'processed', error: undefined, pages: r.pages ?? undefined, langs: r.lang && r.lang !== 'und' ? [languageName(r.lang)] : undefined })
          } catch (e) {
            patch(d.id!, { status: 'failed', error: e instanceof Error ? e.message : 'Could not read this file.' })
          }
        }
      } finally {
        running.current = false
      }
    })()
    // `docs` is read once per pass on purpose: patching it must not restart the pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [real, attempt])

  useEffect(() => {
    if (!live || done || real) return
    const t = setInterval(() => {
      setCheck((c) => ({ pct: Math.min(100, (stale ? 0 : c.pct) + STEP) }))
      setStale(false)
    }, TICK_MS)
    return () => clearInterval(t)
  }, [live, done, real, stale, setCheck])
  useEffect(() => {
    if (!done) return
    setDraft((d) => ({ ...d, saved: true, stage: 'checked' }))
    const t = setTimeout(() => navigate(path('GP-10')), 900)
    return () => clearTimeout(t)
  }, [done, navigate, setDraft])

  const rows = real ? sRows : live ? liveRows(docs, pct) : frozenRows()
  const cards = live ? rows.map((r) => ({ name: r.name, status: r.status, value: r.pct })) : processingCards.map((c) => ({ ...c }))
  const active = rows.find((r) => r.state === 'active')
  const failed = rows.find((r) => r.state === 'failed')
  const activeIdx = Math.max(0, rows.findIndex((r) => r.state === 'active'))
  const seconds = Math.round(((100 - pct) / 100) * TOTAL_SECONDS)
  const headline = !live ? 'Reading 7/12 – Marathi – page 1 of 2' : done ? 'Check complete. Opening your review.' : (failed && !active ? failed.headline : active?.headline ?? 'Starting')
  const overall = !live ? 'Document 2 of 5 · 34% overall' : done ? `All ${rows.length} documents read · 100% overall` : `Document ${activeIdx + 1} of ${rows.length} · ${Math.round(pct)}% overall`
  const left = done ? 'Done' : !live ? 'About 1 min 20 s left' : real ? (failed && !active ? 'Needs attention' : 'Working') : `About ${mins(seconds)} left`
  const mobileLeft = done ? 'Check complete.' : !live ? 'About 3 minutes left. You can leave this page.' : real ? (failed && !active ? 'One document could not be read.' : 'Reading your documents. This can take a minute.') : `About ${Math.max(1, Math.ceil(seconds / 60))} minute${seconds > 60 ? 's' : ''} left. You can leave this page.`
  const retry = () => setAttempt((a) => a + 1)
  const retryBtn = failed && !active && (
    <div className="flex flex-wrap items-center gap-2 md:col-span-full">
      <Button size="sm" onClick={retry} className="min-h-11">Try again</Button>
      <Button size="sm" variant="secondary" to={path('GP-08')} className="min-h-11">Replace the document</Button>
    </div>
  )

  return (
    <Screen id="GP-09" noTabs>
      {/* 1440 */}
      <div className="flex flex-1 justify-center pt-10 max-xl:hidden">
        <div className="flex w-[760px] flex-col gap-5">
          <div>
            <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase">Step 3 of 4 · Check</div>
            <h1 className="mt-1 text-h1">Checking your documents</h1>
            <p className="text-control leading-[22px] text-muted">We read each document, translate it to English where needed, and comparing the details. You can leave this page; we'll notify you.</p>
          </div>
          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              {done ? <CircleCheck className="size-[22px] text-success-ink" aria-hidden /> : failed && !active ? <CircleAlert className="size-[22px] text-danger-ink" aria-hidden /> : <Loader2 className={cn('size-[22px] text-primary-text', spin)} aria-hidden />}
              <div className="text-h3">{headline}</div>
            </div>
            <Meter value={pct} label="Overall progress" thick />
            <div className="flex justify-between text-label text-muted">
              <span>{overall}</span>
              <span className="font-semibold text-text">{left}</span>
            </div>
          </Card>
          <Card className="overflow-hidden p-0">
            <ul>
              {rows.map((r, i) => (
                <li key={r.name} className={cn('flex items-center gap-3.5 px-5 py-3.5 text-control leading-[22px]', i < rows.length - 1 && 'border-b border-line', r.state === 'active' && 'bg-primary-tint')}>
                  {r.state === 'done' && <CircleCheck className="size-[18px] text-success-ink" aria-hidden />}
                  {r.state === 'active' && <Loader2 className={cn('size-[18px] text-primary-text', spin)} aria-hidden />}
                  {r.state === 'waiting' && <Circle className="size-[18px] text-muted" aria-hidden />}
                  {r.state === 'failed' && <CircleAlert className="size-[18px] text-danger-ink" aria-hidden />}
                  <span className={cn('flex-1', r.state === 'active' && 'font-semibold', r.state === 'waiting' && 'text-muted', r.state === 'done' && 'font-medium', r.state === 'failed' && 'font-semibold')}>{r.name}</span>
                  {r.state === 'failed' && <span role="alert" className="max-w-[260px] text-right text-label text-danger-ink">{r.error ?? 'Could not read this file.'}</span>}
                  {r.state === 'done' && <span className="text-label text-muted">{r.meta}</span>}
                  {r.state === 'active' && <Meter value={r.pct} label={`${r.name} progress`} className="w-40" />}
                  {r.state === 'waiting' && <span className="text-label text-muted">Waiting</span>}
                  <span className={cn('w-[70px] text-right text-chip', r.state === 'done' && 'font-medium text-success-ink', r.state === 'active' && 'font-semibold')}>
                    {r.state === 'done' ? 'Done' : r.state === 'active' ? r.page : ''}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          {retryBtn}
          <div className="flex flex-col gap-1.5 text-label text-muted">
            <span>Then: compare fields across documents → check mismatches → build report.</span>
            <span>If this takes longer than expected, your documents stay safe and the check resumes automatically.</span>
          </div>
        </div>
      </div>

      {/* 834 and 390 */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:grid md:grid-cols-2 md:content-start md:gap-5 md:px-8 md:py-7 xl:hidden">
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8 md:col-span-full">Checking your documents</h1>
        <div className="text-label leading-[17px] font-medium text-muted md:col-span-full">{mobileLeft}</div>
        {cards.map((c) => (
          <Card key={c.name} className="flex flex-col gap-3 p-3.5">
            <div className="text-small font-semibold">{c.name}</div>
            <div className="text-label leading-[17px] font-medium text-muted" aria-live="off">{c.status}</div>
            <Meter value={c.value} label={`${c.name} progress`} thick />
          </Card>
        ))}
        {retryBtn}
      </div>
    </Screen>
  )
}
