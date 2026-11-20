import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Meter } from '../components/ui/meter'
import { Pill } from '../components/ui/pill'
import { INITIAL_CHECK, KINDS, SAMEER_FILES, STAGES, STAGE_START, decideVerdict, type CheckState } from '../data/fixtures/f05-check'
import { logAudit } from '../lib/audit'
import { cn } from '../lib/cn'

const TICK_MS = 400
const STEP = 4

/** Stage state from the overall percentage. Stage 0 (files received) is always done. */
const stageState = (i: number, pct: number) => (i === 0 ? 'done' : pct >= 100 ? 'done' : pct >= (STAGE_START[i + 1] ?? 101) ? 'done' : pct >= STAGE_START[i] ? 'active' : 'waiting')

/** F05-02 · Check processing. Advances on a timer, then opens the STOP or PROCEED report chosen on F05-01. */
export default function CheckProcessing() {
  const [mode] = useDemoState(['live', 'reading'] as const)
  const navigate = useNavigate()
  const [check, setCheck] = usePersistentState<CheckState>('f05.check', INITIAL_CHECK)
  const live = mode === 'live'
  const pct = live ? check.pct : 38
  const done = live && check.pct >= 100
  const files = check.files.length ? check.files : SAMEER_FILES
  const verdict = check.verdict ?? decideVerdict(files)
  const kind = KINDS.find((k) => k.id === check.kind) ?? KINDS[0]
  const totalPages = Math.max(1, files.reduce((n, f) => n + (f.pages || 1), 0))

  useEffect(() => {
    if (!live || done) return
    const t = setInterval(() => setCheck((c) => ({ ...c, verdict: c.verdict ?? verdict, pct: Math.min(100, c.pct + STEP) })), TICK_MS)
    return () => clearInterval(t)
  }, [live, done, verdict, setCheck])
  useEffect(() => {
    if (!done) return
    logAudit('You', `Document check finished: ${verdict === 'stop' ? 'STOP' : 'PROCEED'}`)
    const t = setTimeout(() => navigate(path(verdict === 'stop' ? 'F05-03' : 'F05-04')), 900)
    return () => clearTimeout(t)
  }, [done, verdict, navigate])

  const cancel = () => { setCheck((c) => ({ ...c, pct: 0, verdict: null })); logAudit('You', 'Cancelled a document check'); navigate(path('F05-01')) }
  const minutes = Math.max(1, Math.ceil(((100 - pct) * 3) / 100))
  const left = done ? 'Your report is ready.' : `About ${minutes} minute${minutes === 1 ? '' : 's'} left`
  const page = !live ? 'Page 14 of 22' : `Page ${Math.min(totalPages, Math.max(1, Math.ceil((Math.min(pct, 50) / 50) * totalPages)))} of ${totalPages}`
  const meta = (i: number, st: string) => (i === 0 ? `${files.length} documents` : i === 1 && st === 'active' ? page : '')

  return (
    <Screen id="F05-02" back={path('F05-01')} title="Checking" noTabs>
      <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
        <div className="flex w-full max-w-[760px] flex-col gap-3.5 md:gap-5">
          <div className="text-small text-muted max-md:hidden">Check documents · {kind.label}</div>
          <h1 className="text-h2 md:text-h1">Checking your documents</h1>
          <div className="text-chip font-medium text-muted md:hidden" role="status" aria-live="polite">{left}. We will notify you.</div>
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
            <div className="flex items-center justify-between gap-3 max-md:hidden">
              <span className="text-chip text-muted">You can leave this page. We will notify you when the report is ready.</span>
              <Button variant="secondary" onClick={cancel}>Cancel check</Button>
            </div>
          </Card>
          <Button variant="secondary" size="lg" block className="md:hidden" onClick={cancel}>Cancel check</Button>
        </div>
      </div>
    </Screen>
  )
}
