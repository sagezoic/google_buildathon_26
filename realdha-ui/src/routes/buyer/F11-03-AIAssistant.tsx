import { FileText, Loader2, MapPin, Trash2, TriangleAlert } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { RecordId } from '../../components/ui/record-id'
import { ASSISTANT_DISCLAIMER, ASSISTANT_NOTE, PROJECT, SEED_CHAT, TRY_ASKING, assistantReply, type Reply, type Turn } from '../../data/fixtures/f11-buyer'
import { BK } from '../../lib/buyer-store'
import { usePlace, type Place } from '../../lib/places'
import OsmMap from '../../components/map/OsmMap'
import OsmMarker from '../../components/map/OsmMarker'
import { INITIAL_SEARCH, runSearch } from '../../data/fixtures/f08-search'

const FORCED: Record<string, Turn[]> = { answer: SEED_CHAT.slice(0, 1), missing: SEED_CHAT.slice(1) }

function Bubble({ r }: { r: Reply }) {
  if (r.kind === 'refuse') {
    return <div className="flex max-w-[92%] items-start gap-2 rounded-card border border-warning bg-warning-tint px-4 py-3.5 text-small text-warning-ink"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />{r.text}</div>
  }
  return (
    <div className="flex max-w-[92%] flex-col gap-2 rounded-card border border-line bg-surface px-4 py-3 text-small xl:max-w-[85%]">
      <p>{r.text}</p>
      {r.kind === 'cited' && <div className="flex flex-wrap gap-1.5">{r.cites.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-control border border-line-strong bg-primary-tint px-2 py-0.5 text-label font-medium text-on-primary-tint"><FileText className="size-3" aria-hidden />{c}</span>)}</div>}
      {r.kind === 'missing' && <p className="text-label text-muted">{r.note}</p>}
    </div>
  )
}

/** Map pinned on the place the buyer searched for. */
function PlaceMap({ place, className }: { place: Place; className?: string }) {
  const center = useMemo<[number, number]>(() => [place.lng, place.lat], [place])
  return (
    <div className={`relative overflow-hidden rounded-card border border-line bg-sunken ${className ?? ''}`}>
      <OsmMap center={center} zoom={14} className="size-full">
        <OsmMarker position={center} ariaLabel={`${place.name} on the map`}>
          <div className="flex items-center gap-1.5 rounded-pill border-2 border-primary bg-primary px-2.5 py-1 text-chip font-semibold text-on-primary shadow-e2">
            <MapPin className="size-3.5" aria-hidden />{place.name}
          </div>
        </OsmMarker>
      </OsmMap>
    </div>
  )
}

/** F11-03 · Full-page AI assistant for a project. History persists in `f11.chat`. */
export default function AIAssistant() {
  const [params] = useSearchParams()
  const forced = FORCED[params.get('state') ?? '']
  const [saved, setChat] = usePersistentState<Turn[]>(BK.chat, SEED_CHAT)
  const chat = forced ?? saved
  const [place] = usePlace()
  const area = place ? { name: place.name, records: runSearch(place.name, INITIAL_SEARCH.filters).results.length } : undefined
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [thinking, setThinking] = useState<string>()
  const end = useRef<HTMLDivElement>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }) }, [chat.length, thinking])

  const ask = (q: string) => {
    const t = q.trim()
    if (!t) { setErr('Type a question about this project.'); return }
    if (thinking) return
    const id = `t${Date.now()}`
    setErr(''); setText(''); setThinking(id)
    setChat((c) => [...c, { id, q: t, a: assistantReply(t, area) }])
    timer.current = window.setTimeout(() => setThinking(undefined), 800)
  }
  const asks = place ? [`What is verified near ${place.name}?`, ...TRY_ASKING] : TRY_ASKING
  const chips = (
    <>{asks.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="min-h-11 cursor-pointer rounded-control border border-line-strong bg-surface px-3 py-2 text-left text-chip font-medium text-primary-text hover:bg-primary-tint xl:min-h-9 xl:py-1.5">{s}</button>)}</>
  )

  return (
    <Screen id="F11-03" back={path('F11-02')} title="Ask AI">
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 xl:grid xl:grid-cols-[300px_1fr] xl:items-start xl:gap-6 xl:px-12 xl:py-6">
        <div className="flex flex-col gap-4 max-xl:hidden">
          <Card className="flex flex-col gap-2 p-6">
            <div className="text-label font-semibold tracking-[0.04em] text-muted uppercase">Project</div>
            <b className="text-h3">{PROJECT.name}</b>
            <RecordId id={PROJECT.id} className="self-stretch" />
            <p className="text-label font-medium text-muted">{ASSISTANT_NOTE}</p>
            {place && <span className="inline-flex items-center gap-1.5 self-start rounded-control border border-line bg-primary-tint px-2 py-0.5 text-chip font-medium"><MapPin className="size-3.5 text-primary-text" aria-hidden />{place.name}{place.area && <span className="font-normal text-muted">{place.area}</span>}</span>}
          </Card>
          {place && <PlaceMap place={place} className="h-56" />}
          <Card className="flex flex-col gap-2 p-6"><b className="text-h3">Try asking</b>{chips}</Card>
        </div>
        <div className="xl:hidden">
          <h1 className="text-h2 font-semibold">Ask about this property</h1>
          <p className="mt-2 text-chip font-medium text-muted">AI can explain what the documents say. It does not state legal title or value.</p>
        </div>
        {place && <PlaceMap place={place} className="h-40 xl:hidden" />}
        <Card className="flex flex-1 flex-col gap-0 p-0 xl:min-h-[calc(100dvh-170px)]">
          <div className="flex flex-1 flex-col gap-3.5 p-4 xl:p-6">
            {chat.length === 0 && <p className="text-small text-muted">Ask about this project. {ASSISTANT_NOTE}</p>}
            {chat.map((t) => (
              <Fragment key={t.id}>
                <div className="max-w-[80%] self-end rounded-card bg-primary-tint px-4 py-2.5 text-small text-on-primary-tint">{t.q}</div>
                {t.id === thinking
                  ? <div role="status" className="flex items-center gap-2 text-chip text-muted"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />Searching the documents…</div>
                  : <div aria-live="polite" className="contents"><Bubble r={t.a} /></div>}
              </Fragment>
            ))}
            <div className="flex flex-wrap items-center gap-2 xl:hidden">{chips}</div>
            <div ref={end} />
          </div>
          <form noValidate onSubmit={(e) => { e.preventDefault(); ask(text) }} className="flex flex-col gap-2 p-4 pt-0 xl:px-6">
            <div className="flex flex-col gap-2 xl:flex-row">
              <input aria-label="Ask about this project" aria-invalid={err ? true : undefined} value={text} onChange={(e) => { setText(e.target.value); setErr('') }} placeholder="Ask about this project" className="h-control min-w-0 flex-1 rounded-control border border-line-strong bg-field px-3 text-small outline-none placeholder:text-muted focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)] max-xl:h-12" />
              <Button type="submit" loading={!!thinking} size="lg" className="xl:h-control">Send</Button>
            </div>
            {err && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><TriangleAlert className="size-3.5" aria-hidden />{err}</p>}
            <div className="flex items-center justify-between gap-2">
              <p className="text-label font-medium text-muted">{ASSISTANT_DISCLAIMER}</p>
              {saved.length > 0 && !forced && <button type="button" onClick={() => { setChat([]); setThinking(undefined) }} className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1 text-label font-medium text-muted hover:text-text xl:min-h-0"><Trash2 className="size-3.5" aria-hidden />Clear</button>}
            </div>
          </form>
        </Card>
      </div>
    </Screen>
  )
}
