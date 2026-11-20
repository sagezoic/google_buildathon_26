import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { FRAME_FILES, INITIAL_CHECK, KINDS, LAKEVIEW_FILES, SAMEER_FILES, decideVerdict, sizeLabel, type CheckFile, type CheckKind, type CheckState } from '../data/fixtures/f05-check'
import { logAudit } from '../lib/audit'
import { cn } from '../lib/cn'

const MAX_BYTES = 25 * 1024 * 1024
const OK_TYPE = /\.(pdf|jpe?g|png)$/i

/** F05-01 · Pick the kind of property, upload documents (names and progress persist), start the check. */
export default function CheckStart() {
  const [mode] = useDemoState(['live', 'uploading', 'uploaded'] as const)
  const navigate = useNavigate()
  const [check, setCheck] = usePersistentState<CheckState>('f05.check', INITIAL_CHECK)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const files = mode === 'uploading' ? FRAME_FILES : mode === 'uploaded' ? SAMEER_FILES : check.files
  const kind = KINDS.find((k) => k.id === check.kind) ?? KINDS[0]
  const busy = files.some((f) => f.status === 'uploading')

  // Uploads advance on a timer in the live view.
  useEffect(() => {
    if (mode !== 'live' || !busy) return
    const t = setInterval(() => {
      setCheck((c) => ({ ...c, files: c.files.map((f) => (f.status === 'uploading' ? (f.pct + 18 >= 100 ? { ...f, pct: 100, status: 'uploaded' } : { ...f, pct: f.pct + 18 }) : f)) }))
    }, 350)
    return () => clearInterval(t)
  }, [mode, busy, setCheck])

  const setFiles = (next: CheckFile[]) => { setCheck((c) => ({ ...c, files: next })); setError(''); setSaved(false) }
  const add = (list: FileList | File[]) => {
    const picked = Array.from(list)
    const bad = picked.find((f) => !OK_TYPE.test(f.name) || f.size > MAX_BYTES)
    if (bad) {
      setError(!OK_TYPE.test(bad.name) ? `${bad.name} is not a PDF, JPG or PNG.` : `${bad.name} is larger than 25 MB.`)
      return
    }
    const fresh: CheckFile[] = picked.filter((f) => !files.some((x) => x.name === f.name)).map((f) => ({ name: f.name, pages: 0, size: sizeLabel(f.size), status: 'uploading', pct: 0 }))
    setFiles([...files, ...fresh])
  }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }

  const start = () => {
    if (!files.length) return setError('Add at least one document to check.')
    if (busy) return setError('Wait for the uploads to finish.')
    setCheck((c) => ({ ...c, files, pct: 0, verdict: decideVerdict(files) }))
    logAudit('You', `Started a document check (${kind.label}, ${files.length} files)`)
    navigate(path('F05-02'))
  }

  return (
    <Screen id="F05-01" back={path('X-01')} title="Check">
      <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
        <div className="flex w-full max-w-[960px] flex-col gap-3.5 md:gap-5">
          <div className="text-chip text-muted md:text-small">
            <span className="md:hidden">Check documents · property not on Realdha</span>
            <span className="max-md:hidden">Check documents · for a property not on Realdha</span>
          </div>
          <h1 className="text-h2 md:text-h1">What are you checking?</h1>
          <p className="max-w-[760px] text-control leading-[22px] text-muted max-md:hidden">Pick the kind of property. We will ask only for the documents that kind needs.</p>

          <div role="radiogroup" aria-label="Kind of property" className="grid gap-3.5 md:grid-cols-4 md:items-stretch md:gap-3">
            {KINDS.map((k) => {
              const on = k.id === check.kind
              return (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCheck((c) => ({ ...c, kind: k.id as CheckKind }))}
                  className={cn('flex min-h-11 cursor-pointer flex-col gap-1.5 rounded-card text-left max-md:p-3.5 md:p-5', on ? 'border-2 border-primary bg-primary-tint max-md:p-[13px] md:p-[19px]' : 'border border-line-strong bg-surface hover:bg-primary-tint')}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-body font-semibold max-md:text-control">{k.label}</span>
                    {on && <Pill tone="success" icon={<CheckCircle2 className="size-4" />} className="max-md:hidden">Selected</Pill>}
                  </span>
                  <span className="text-chip leading-[19px] text-muted">
                    <span className="md:hidden">{k.descM}</span>
                    <span className="max-md:hidden">{k.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <Card className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-h2 max-md:text-overline max-md:font-semibold max-md:tracking-[0.06em] max-md:text-muted max-md:uppercase">Upload<span className="max-md:hidden"> the documents</span></h2>
              <span className="text-chip text-muted max-md:hidden">Needed for a {kind.label.toLowerCase()}: {kind.needed}</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={cn('flex flex-col items-center gap-1.5 rounded-control border-2 border-dashed border-line-strong p-5 text-center md:p-[26px]', drag ? 'bg-primary-tint' : 'bg-canvas')}
            >
              <div className="text-control font-semibold"><span className="md:hidden">Choose files</span><span className="max-md:hidden">Drag files here, or choose files</span></div>
              <div className="text-chip text-muted"><span className="md:hidden">{kind.needed.replace(/^./, (c) => c.toUpperCase())}</span><span className="max-md:hidden">PDF, JPG or PNG · up to 25 MB each</span></div>
              <input ref={input} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" aria-label="Choose files" tabIndex={-1} onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = '' }} />
              <Button variant="secondary" className="mt-1.5" onClick={() => input.current?.click()}>Choose files</Button>
              <div className="mt-1 flex flex-wrap justify-center gap-2 text-chip text-muted">
                <span>Sample files:</span>
                <button type="button" onClick={() => setFiles(SAMEER_FILES)} className="cursor-pointer text-primary-text underline">Sameer's flat</button>
                <button type="button" onClick={() => setFiles(LAKEVIEW_FILES)} className="cursor-pointer text-primary-text underline">Lake View flat</button>
              </div>
            </div>
            <ul aria-label="Uploaded files">
              {files.map((f) => (
                <li key={f.name} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-3 md:flex-nowrap">
                  <span className="min-w-0 flex-1 text-small font-medium">{f.name}</span>
                  <span className="text-chip text-muted max-md:hidden">{[f.pages ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : '', f.size].filter(Boolean).join(' · ')}</span>
                  {f.status === 'uploaded'
                    ? <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Uploaded</Pill>
                    : <Pill tone="info" icon={<Loader2 className="size-4 animate-spin motion-reduce:animate-none" />}>Uploading {f.pct}%</Pill>}
                  {mode === 'live' && (
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((x) => x.name !== f.name))} className="-mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint md:size-8">
                      <X className="size-4" aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <div role="alert" className="empty:hidden">
            {error && <p className="flex items-center gap-1.5 text-chip text-danger-ink"><AlertCircle className="size-4" aria-hidden />{error}</p>}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-chip text-muted max-md:hidden">Files are fingerprinted, not published. You decide what is shared.</span>
            <div className="flex flex-col gap-2.5 md:flex-row">
              <Button variant="secondary" size="lg" className="max-md:hidden md:h-control md:text-control" onClick={() => { setSaved(true); logAudit('You', 'Saved a document check draft') }}>{saved ? 'Draft saved' : 'Save draft'}</Button>
              <Button size="lg" className="md:h-control md:text-control" onClick={start} aria-disabled={busy || undefined}>Check documents</Button>
            </div>
          </div>
          <span role="status" className="sr-only">{saved ? 'Draft saved' : ''}</span>
        </div>
      </div>
    </Screen>
  )
}
