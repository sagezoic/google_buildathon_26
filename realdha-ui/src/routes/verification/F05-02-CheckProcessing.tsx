import { AlertCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Meter } from '../../components/ui/meter'
import { Pill } from '../../components/ui/pill'
import { KINDS, SAMEER_FILES, STAGES, STAGE_START } from '../../data/fixtures/f05-check'
import { runCheck } from '../../lib/ai-api'
import { logAudit } from '../../lib/audit'
import { useCheckState } from '../../lib/check-store'
import { cn } from '../../lib/cn'
import { processDocument } from '../../lib/property-api'

/** Reading the documents fills the bar to here; the Gemini check takes it the rest of the way. */
const READ_END = STAGE_START[2]

/** Stage state from the overall percentage. Stage 0 (files received) is always done. */
const stageState = (i: number, pct: number) => (i === 0 ? 'done' : pct >= 100 ? 'done' : pct >= (STAGE_START[i + 1] ?? 101) ? 'done' : pct >= STAGE_START[i] ? 'active' : 'waiting')

/**
 * F05-02 · Check processing. Reads each document (Document AI OCR + translation), then Gemini cross-checks
 * them all and the STOP or PROCEED report opens. `?state=reading` shows the static frame.
 */
export default function CheckProcessing() {
  const [mode] = useDemoState(['live', 'reading'] as const)
  const navigate = useNavigate()
  const [check, setCheck] = useCheckState()
  const [error, setError] = useState('')
  const [reading, setReading] = useState(0)
  const started = useRef(false)
  const abort = useRef<AbortController | null>(null)
  const live = mode === 'live'
  const files = live ? check.files : SAMEER_FILES
  const pct = live ? check.pct : 38
  const done = live && !!check.checkId && !!check.verdict
  const kind = KINDS.find((k) => k.id === check.kind) ?? KINDS[0]

  const run = useCallback(async () => {
    const { propertyId, files: docs } = check
    if (!propertyId || !docs.length) { navigate(path('F05-01')); return }
    const ac = new AbortController()
    abort.current = ac
    setError('')
    setCheck((c) => ({ ...c, pct: 2, verdict: null, checkId: null }))

    // 1 · Read every document. A file Document AI cannot read is still sent to Gemini as a file.
    for (const [i, f] of docs.entries()) {
      if (ac.signal.aborted) return
      setReading(i + 1)
      if (f.id) await processDocument(propertyId, f.id).catch(() => undefined)
      setCheck((c) => ({ ...c, pct: Math.max(c.pct, Math.round(((i + 1) / docs.length) * READ_END)) }))
    }

    // 2 · Gemini cross-checks everything in one request; the bar eases toward 95% while it works.
    const tick = window.setInterval(() => setCheck((c) => ({ ...c, pct: Math.min(95, c.pct + Math.max(1, Math.round((95 - c.pct) * 0.06))) })), 1000)
    try {
      const result = await runCheck(propertyId, check.kind, ac.signal)
      setCheck((c) => ({ ...c, pct: 100, verdict: result.verdict, checkId: result.id }))
      logAudit('You', `Document check finished: ${result.verdict === 'stop' ? 'STOP' : 'PROCEED'}`)
    } catch (e) {
      if (ac.signal.aborted) return
      setCheck((c) => ({ ...c, pct: 0 }))
      setError(e instanceof Error ? e.message : 'The check could not finish. Try again.')
    } finally {
      window.clearInterval(tick)
    }
  }, [check, navigate, setCheck])

  // Start once per visit (the ref also absorbs StrictMode's second effect run).
  useEffect(() => {
    if (!live || started.current || done) return
    started.current = true
    void run()
  }, [live, done, run])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => navigate(path(check.verdict === 'stop' ? 'F05-03' : 'F05-04')), 900)
    return () => clearTimeout(t)
  }, [done, check.verdict, navigate])

  const cancel = () => {
    abort.current?.abort()
    setCheck((c) => ({ ...c, pct: 0, verdict: null, checkId: null }))
    logAudit('You', 'Cancelled a document check')
    navigate(path('F05-01'))
  }

  const total = files.length
  const left = done
    ? 'Your report is ready.'
    : error
      ? 'The check stopped.'
      : !live || pct < READ_END
        ? `Reading document ${Math.min(total, Math.max(1, live ? reading : 2))} of ${total}`
        : 'Gemini is cross-checking your documents'
  const meta = (i: number, st: string) => (i === 0 ? `${total} document${total === 1 ? '' : 's'}` : i === 1 && st === 'active' ? `${Math.min(total, Math.max(1, live ? reading : 2))} of ${total}` : '')

  return (
    <Screen id="F05-02" back={path('F05-01')} title="Checking" noTabs>
      <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
        <div className="flex w-full max-w-[760px] flex-col gap-3.5 md:gap-5">
          <div className="text-small text-muted max-md:hidden">Check documents · {kind.label}</div>
          <h1 className="text-h2 md:text-h1">Checking your documents</h1>
          <div className="text-chip font-medium text-muted md:hidden" role="status" aria-live="polite">{left}.</div>
          <Card className="flex flex-col gap-3.5 p-3.5 md:p-6">
            <div className="flex items-baseline justify-between gap-3 max-md:hidden" role="status" aria-live="polite">
              <span className="text-control font-semibold">{left}</span>
              <span className="text-chip text-muted">Gemini AI is reading. Every finding will quote the page it came from.</span>
            </div>
            <Meter value={pct} label="Check progress" thick className="h-2.5" />
            <ul className="max-md:-my-1">
              {STAGES.map((s, i) => {
                const st = stageState(i, pct)
                const m = meta(i, st)
                return (
                  <li key={s.label} className="flex items-center gap-3 border-b border-line py-2.5 md:py-3.5">
                    <Pill tone={st === 'done' ? 'success' : st === 'active' ? 'info' : 'neutral'} className="w-[90px] justify-center md:w-[92px]">
                      {st === 'done' ? 'Done' : st === 'active' ? 'In progress' : 'Waiting'}
                    </Pill>
                    <span className={cn('flex-1 text-small md:text-control', st === 'active' ? 'font-semibold' : 'font-medium')}>
                      <span className="md:hidden">{s.labelM}</span>
                      <span className="max-md:hidden">{s.label}</span>
                    </span>
                    {m && <span className="text-chip text-muted max-md:hidden">{m}</span>}
                  </li>
                )
              })}
            </ul>
            {error && (
              <div role="alert" className="flex flex-col gap-2.5 rounded-control border border-danger bg-danger-tint px-3.5 py-3 md:flex-row md:items-center md:justify-between">
                <p className="flex items-start gap-2 text-small text-danger-ink"><AlertCircle className="mt-0.5 size-4 flex-none" aria-hidden />{error}</p>
                <Button onClick={() => void run()} className="flex-none">Try again</Button>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 max-md:hidden">
              <span className="text-chip text-muted">Keep this page open. A check usually takes one to three minutes.</span>
              <Button variant="secondary" onClick={cancel}>Cancel check</Button>
            </div>
          </Card>
          <Button variant="secondary" size="lg" block className="md:hidden" onClick={cancel}>Cancel check</Button>
        </div>
      </div>
    </Screen>
  )
}
