import { FileText, Loader2, Search, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../../../app/persist'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Drawer } from '../../../components/ui/drawer'
import { ASK, answerFor, missingText, type Answer } from '../../../data/fixtures/twin'
import { useTwinRecord } from '../../../lib/twin-store'
import { TwinPage } from '../../parts/TwinPage'

const STATES = ['cited', 'missing'] as const
interface Turn { id: string; q: string }

function Chip({ children, onGo }: { children: string; onGo: () => void }) {
  return (
    <button type="button" onClick={onGo} className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-control border border-line-strong bg-primary-tint px-2 py-0.5 text-label font-medium text-on-primary-tint md:min-h-0">
      <FileText className="size-3.5" aria-hidden />{children}
    </button>
  )
}

function Question({ q }: { q: string }) {
  return <div className="max-w-[80%] self-end rounded-[12px_12px_2px_12px] bg-primary px-3.5 py-2.5 text-small text-on-primary">{q}</div>
}

function Reply({ q, a, onCite }: { q: string; a: Answer; onCite: () => void }) {
  if (a.kind === 'cited') {
    const [pre, post] = a.text.split('{b}')
    return (
      <div className="flex max-w-[92%] flex-col gap-2.5 rounded-[12px_12px_12px_2px] border border-line bg-surface px-4 py-3.5">
        <p className="text-small leading-[22px]">{pre}<b className="font-semibold">{a.bold}</b>{post}</p>
        <div className="flex flex-wrap gap-2">{a.cites.map((c) => <Chip key={c} onGo={onCite}>{c}</Chip>)}</div>
        {a.marathi && (
          <div lang="mr" className="rounded-control border border-line bg-sunken px-2.5 py-2 text-chip leading-[22px]">
            फेरफार क्र. २२९१ — विक्री <span lang="en" className="text-label text-muted">(Mutation 2291 — sale)</span>
          </div>
        )}
        <p className="text-label text-muted">AI-generated from the documents above. Not legal advice.</p>
      </div>
    )
  }
  return (
    <div className="flex max-w-[92%] gap-2.5 rounded-[12px_12px_12px_2px] border border-dashed border-muted bg-surface px-4 py-3.5">
      <Search className="mt-0.5 size-5 flex-none text-muted" aria-hidden />
      <div className="flex flex-col gap-1.5">
        <div className="text-small font-semibold">I can't find this in the documents</div>
        <p className="text-chip leading-5 text-muted">{missingText(q)}</p>
        <a href={path('GP-08')} className="text-chip font-medium text-primary-text">Upload a document</a>
      </div>
    </div>
  )
}

/** GP-18 · Ask AI drawer (480) over the Twin. Questions persist in twin.chat; answers are recomputed from the fixtures. `?state=cited|missing` shows the drawn frame conversation. */
export default function AskAI() {
  const [params, setParams] = useSearchParams()
  const forced = params.get('state') as (typeof STATES)[number] | null
  const [chat, setChat, clear] = usePersistentState<Turn[]>('twin.chat', [])
  const { plot } = useTwinRecord()
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState<string>()
  const end = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const frame = forced && STATES.includes(forced) ? ASK[forced] : undefined
  const turns: Turn[] = [...(frame ? [{ id: 'frame', q: frame.question }] : []), ...chat]
  const lastKind = turns.length ? answerFor(turns[turns.length - 1].q).kind : undefined
  const suggestions = frame ? frame.suggestions : lastKind === 'missing' ? ASK.missing.suggestions : turns.length ? ASK.cited.suggestions : [ASK.cited.question, ...ASK.cited.suggestions]

  useEffect(() => { end.current?.scrollIntoView?.({ block: 'end' }) }, [turns.length, thinking])

  const ask = (q: string) => {
    const v = q.trim()
    if (!v || thinking) return
    const id = `${Date.now()}`
    if (frame) setParams((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
    setChat((c) => [...(frame ? [{ id: 'f' + id, q: frame.question }] : []), ...c, { id, q: v }])
    setThinking(id)
    setText('')
    setTimeout(() => setThinking(undefined), 700)
  }
  const goCite = () => {
    void navigate(path('GP-16'))
    setTimeout(() => document.getElementById('documents')?.scrollIntoView(), 50)
  }

  return (
    <Screen id="GP-18">
      <TwinPage />
      <Drawer
        open
        wide
        onOpenChange={(o) => !o && void navigate(path('GP-16'))}
        title="Ask AI"
        subtitle={`${plot.recordId} · answers only from verified documents`}
      >
        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-sunken px-5 py-4.5">
          {turns.map((t) => (
            <Fragment key={t.id}>
              <Question q={t.q} />
              {t.id === thinking ? (
                <div role="status" className="flex max-w-[92%] items-center gap-2 text-chip text-muted"><Loader2 className="size-4 animate-spin" aria-hidden />Searching the verified documents…</div>
              ) : (
                <div role="status" aria-live="polite" className="contents"><Reply q={t.q} a={answerFor(t.q)} onCite={goCite} /></div>
              )}
            </Fragment>
          ))}
          <div className="flex flex-wrap items-center gap-1.5">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} className="min-h-11 cursor-pointer rounded-pill border border-line-strong bg-surface px-3 text-label font-medium text-primary-text hover:bg-primary-tint md:min-h-0 md:py-1">{s}</button>
            ))}
            {chat.length > 0 && (
              <button type="button" onClick={() => { clear(); setThinking(undefined) }} className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-1 px-2 text-label font-medium text-muted hover:text-text md:min-h-0"><Trash2 className="size-3.5" aria-hidden />Clear</button>
            )}
          </div>
          <div ref={end} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(text) }} className="flex gap-2 border-t border-line p-4">
          <input
            aria-label="Ask about this property"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={ASK.placeholder}
            className="h-control min-w-0 flex-1 rounded-control border border-line-strong bg-field px-3 text-small outline-none placeholder:text-muted focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]"
          />
          <Button type="submit" disabled={!text.trim() || !!thinking}>Send</Button>
        </form>
      </Drawer>
    </Screen>
  )
}
