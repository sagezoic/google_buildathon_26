import { CheckCircle2, FileText, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { VerdictBanner } from '../../../components/ui/verdict-banner'
import { results, slots, type Slot, type Upload } from '../../../data/fixtures/resolve'
import { logAudit } from '../../../lib/audit'
import { normalizeResolutions } from '../../../lib/owner-resolutions'
import { useSharedState } from '../../../lib/shared-state'

type Uploads = Record<Slot, Upload | null>
const INITIAL: Uploads = { B: slots[0].initial, A: slots[1].initial }
const EMPTY: unknown = {}
const OWNER = 'Prakash Kulkarni'
const Uploaded = () => <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Uploaded</Pill>
const linkBtn = 'min-h-11 cursor-pointer text-label font-medium text-primary-text underline md:min-h-0'

const sizeOf = (f: File) => (f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`)

/** GP-12 · Resolve findings: uploads, re-check results, Proceed. Uploads and re-check state persist. */
export default function Resolve() {
  const navigate = useNavigate()
  const [uploads, setUploads] = useSharedState<Uploads>('resolve.uploads', INITIAL)
  const [recheck, setRecheck] = useSharedState<'done' | 'stale'>('resolve.recheck', 'done')
  const [findingsRaw] = useSharedState<unknown>('property.findings', EMPTY)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const inputs = useRef<Partial<Record<Slot, HTMLInputElement | null>>>({})
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const skippedC = !!findingsRaw && typeof findingsRaw === 'object' && 'C' in findingsRaw && !normalizeResolutions(findingsRaw).C
  const ok = { A: !!uploads.A, B: !!uploads.B, C: !skippedC }
  const openCount = Object.values(ok).filter((v) => !v).length
  const pending = running || recheck === 'stale'
  const proceed = openCount === 0 && !pending

  const onFile = (slot: Slot, files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    setUploads((u) => ({ ...u, [slot]: { name: f.name, size: sizeOf(f) } }))
    setRecheck('stale')
    logAudit(OWNER, `Uploaded ${f.name} for finding ${slot}`)
    setMessage(`${f.name} uploaded. Run the re-check.`)
  }
  const remove = (slot: Slot) => {
    const name = uploads[slot]?.name
    setUploads((u) => ({ ...u, [slot]: null }))
    setRecheck('stale')
    logAudit(OWNER, `Removed ${name ?? 'upload'} for finding ${slot}`)
    setMessage(`${name} removed.`)
  }
  const runRecheck = () => {
    setRunning(true)
    setMessage('Re-checking the documents…')
    timer.current = window.setTimeout(() => {
      setRunning(false)
      setRecheck('done')
      logAudit('Realdha', openCount ? `Re-check finished: ${openCount} finding(s) still open` : 'Re-check passed: all 8 checks clear')
      setMessage(openCount ? `Re-check finished. ${openCount} still open.` : 'Re-check complete.')
    }, 1600)
  }
  const send = () => {
    logAudit(OWNER, 'Sent the record to a lawyer for review')
    navigate(path('GP-13'))
  }

  return (
    <Screen id="GP-12">
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-12 md:py-7">
        <div>
          <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-md:hidden">Resolve findings</div>
          <h1 className="text-h2 md:mt-0.5 md:text-h1">
            <span className="md:hidden">Resolve the items</span>
            <span className="max-md:hidden">Upload fixes and re-check</span>
          </h1>
        </div>
        <div role="status" aria-live="polite" className="sr-only">{message}</div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-7">
          <Card className="flex flex-col gap-3.5 p-3.5 max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:shadow-none md:w-[520px] md:flex-none md:p-[22px]">
            <h2 className="text-h3 max-md:hidden">1 · Your uploads</h2>
            {slots.map((s) => {
              const u = uploads[s.id]
              const custom = !!u && u.name !== s.initial.name
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 md:rounded-control">
                  <input
                    ref={(el) => { inputs.current[s.id] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    aria-label={`Upload file for finding ${s.id}`}
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => { onFile(s.id, e.target.files); e.target.value = '' }}
                  />
                  <FileText className="size-5 flex-none text-muted max-md:hidden" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-small font-semibold">
                      {u && !custom ? (
                        <>
                          <span className="md:hidden">{s.titleM}</span>
                          <span className="max-md:hidden">{u.name}</span>
                        </>
                      ) : (u ? u.name : s.titleM)}
                    </div>
                    <div className="text-label text-muted">
                      {u ? (custom ? `Fixes finding ${s.id} · ${u.size}` : (<><span className="md:hidden">{s.noteM}</span><span className="max-md:hidden">{s.note}</span></>)) : `Not uploaded · fixes finding ${s.id}`}
                    </div>
                    <div className="mt-0.5 flex gap-3.5">
                      <button type="button" className={linkBtn} onClick={() => inputs.current[s.id]?.click()}>{u ? 'Replace' : 'Upload file'}</button>
                      {u && <button type="button" className={linkBtn} onClick={() => remove(s.id)}>Remove</button>}
                    </div>
                  </div>
                  {u ? <Uploaded /> : <Pill tone="warning" icon={<TriangleAlert className="size-4" />}>Missing</Pill>}
                </div>
              )
            })}
            <div className="rounded-control border border-line bg-canvas px-3.5 py-3 text-chip max-md:hidden">
              <b className="font-semibold">Finding C · surname</b><br />
              {ok.C
                ? 'You confirmed "Kulkarni". Realdha will note the NA order spelling as a recorded variant.'
                : 'Not confirmed yet. Confirm the spelling on the review step so Realdha can record the variant.'}
            </div>
            {pending ? (
              <Button block size="lg" loading={running} onClick={runRecheck}>{running ? 'Re-checking…' : 'Re-check'}</Button>
            ) : (
              <>
                <Button block size="lg" disabled className="max-md:hidden disabled:text-success-ink" icon={<span aria-hidden>✓</span>}>Re-check complete</Button>
                <div className="flex items-center gap-2.5 text-small font-semibold text-success-ink md:hidden">
                  <CheckCircle2 className="size-5" aria-hidden />Re-check complete
                </div>
              </>
            )}
          </Card>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {proceed ? (
              <VerdictBanner
                tone="proceed"
                title={<><span className="md:hidden">Proceed</span><span className="max-md:hidden">Proceed – ready for lawyer review</span></>}
              >
                <span className="md:hidden">Ready for lawyer review. Area now matches at 418 sq m.</span>
                <span className="max-md:hidden">The re-check passed. All 8 checks are clear.</span>
              </VerdictBanner>
            ) : (
              <VerdictBanner tone="clarify" title="Clarify">
                {openCount === 0 ? 'You changed an upload. Run the re-check before sending to a lawyer.' : `${openCount} ${openCount === 1 ? 'item is' : 'items are'} still open. Upload the missing file and re-check.`}
              </VerdictBanner>
            )}

            <Card className="overflow-hidden p-0 max-md:hidden">
              <h2 className="border-b border-line bg-canvas px-[18px] py-3.5 text-chip font-semibold">2 · Re-check results</h2>
              <ul>
                {(['A', 'B', 'C'] as const).map((id) => (
                  <li key={id} className="flex items-center gap-3 border-b border-line px-[18px] py-3.5 text-control last:border-b-0">
                    {ok[id] ? <CheckCircle2 className="size-5 flex-none text-success" aria-hidden /> : <TriangleAlert className="size-5 flex-none text-warning" aria-hidden />}
                    <div className="flex-1">
                      <b className="font-semibold">{results[id].title}</b>
                      <div className="text-label text-muted">{ok[id] ? results[id].ok : results[id].open}</div>
                    </div>
                    {ok[id] ? <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Resolved</Pill> : <Pill tone="warning" icon={<TriangleAlert className="size-4" />}>Open</Pill>}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <span className="max-w-[380px] text-label text-muted max-md:hidden">Re-check updated the report. Download the new PDF from the report page.</span>
              <Button size="lg" disabled={!proceed} onClick={send} className="max-md:w-full">Send to lawyer</Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
