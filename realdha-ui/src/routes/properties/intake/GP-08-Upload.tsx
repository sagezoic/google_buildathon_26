import { Check, CircleAlert, CircleCheck, Trash2, TriangleAlert, Upload as UploadIcon, UploadCloud } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { Stepper } from '../../../components/ui/stepper'
import { NATIVE, STEPS, uploadDocs, type StoredDoc } from '../../../data/fixtures/property-intake'
import { checkFile, fileSize, propertyPlace, TYPE_LABEL, usePropertyDocuments, usePropertyDraft } from '../../../lib/property-store'
import { cn } from '../../../lib/cn'

const ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

const Uploaded = () => <Pill tone="success" icon={<CircleCheck className="size-3.5" />}>Uploaded</Pill>
const Missing = () => <Pill tone="warning" icon={<TriangleAlert className="size-3.5" />}>Missing</Pill>

/** GP-08 · Upload documents. 1440: file rows + drop zone. 834/390: one card per expected document. */
export default function Upload() {
  useDemoState(['default'] as const)
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const target = useRef<string>('extra')
  const [draft, setDraft] = usePropertyDraft()
  const [docs, setDocs] = usePropertyDocuments()
  const [over, setOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const pick = (id: string) => { target.current = id; input.current?.click() }
  const accept = (id: string, files: FileList | null) => {
    if (!files?.length) return
    const bad: string[] = []
    const good: StoredDoc[] = []
    Array.from(id === 'extra' ? files : [files[0]]).forEach((f) => {
      const why = checkFile(f)
      if (why) bad.push(why)
      else good.push({ slot: id, file: f.name, size: fileSize(f.size), status: 'uploaded' })
    })
    setErrors(bad)
    if (good.length) setDocs((d) => (id === 'extra' ? [...d, ...good] : [...d.filter((x) => x.slot !== id), ...good]))
  }
  const onChange = (e: ChangeEvent<HTMLInputElement>) => { accept(target.current, e.target.files); e.target.value = '' }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); accept('extra', e.dataTransfer.files) }
  const removeExtra = (i: number) => setDocs((d) => { const ex = d.filter((x) => x.slot === 'extra'); const gone = ex[i]; return d.filter((x) => x !== gone) })

  const bySlot = (id: string) => docs.find((d) => d.slot === id)
  const extras = docs.filter((d) => d.slot === 'extra')
  const total = uploadDocs.length
  const count = uploadDocs.filter((d) => bySlot(d.id)).length
  const meta = (d: StoredDoc) => (d.pages ? `${d.file} · ${d.pages} page${d.pages > 1 ? 's' : ''} · ${d.size}` : `${d.file} · ${d.size}`)
  const mobileMeta = (d: StoredDoc) => (d.langs ? `${d.langs.join(', ')} detected · ${d.pages} page${d.pages! > 1 ? 's' : ''}` : `${d.file} · ${d.size}`)
  const next = () => {
    if (!docs.length) { setErrors(['Add at least one document to check.']); return }
    setErrors([])
    setDraft((x) => ({ ...x, saved: true, stage: x.stage === 'checked' ? 'checked' : 'documents' }))
    navigate(path('GP-09'))
  }
  const errorList = (
    <div role="alert" className="empty:hidden md:col-span-full">
      {errors.map((m) => <p key={m} className="flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5 flex-none" aria-hidden />{m}</p>)}
    </div>
  )

  return (
    <Screen id="GP-08" noTabs>
      <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1} aria-hidden onChange={onChange} />

      {/* 1440 */}
      <div className="flex flex-1 flex-col gap-5 px-12 py-7 max-xl:hidden">
        <Stepper steps={STEPS} current={2} />
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1">Upload documents</h1>
            <div className="text-small text-muted">{TYPE_LABEL[draft.type]} · Gat {draft.gat} · {propertyPlace(draft)}</div>
          </div>
          <span aria-live="polite">
            <Pill tone={count === total ? 'success' : 'warning'} className="px-3 py-1 text-chip">{count} of {total} uploaded</Pill>
          </span>
        </div>
        <div className="flex min-h-0 flex-1 gap-6">
          <Card className="flex-[1.5] self-start overflow-hidden p-0">
            <ul>
              {uploadDocs.map((d, i) => {
                const p = bySlot(d.id)
                const ok = !!p
                return (
                  <li key={d.id} className={cn('flex items-center gap-3.5 px-[18px] py-3.5', i < uploadDocs.length - 1 + extras.length && 'border-b border-line', !ok && 'bg-warning-tint/40')}>
                    <span className={cn('flex size-9 flex-none items-center justify-center rounded-lg', ok ? 'bg-success-tint text-success-ink' : 'bg-warning-tint text-warning-ink')}>
                      {ok ? <Check className="size-[18px]" aria-hidden /> : <UploadIcon className="size-[18px]" aria-hidden />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-control font-semibold">{d.name}</div>
                      <div className="text-label text-muted">{p ? meta(p) : 'Required · drag a file here or choose one'}</div>
                    </div>
                    {p?.langs && (
                      <span className="inline-flex flex-none items-center rounded-control border border-line-strong bg-primary-tint px-2 text-label text-on-primary-tint">
                        Detected: <span lang="mr" className="ml-1">{p.langs.map((l) => NATIVE[l] ?? l).join(', ')}</span>
                      </span>
                    )}
                    {ok ? <Uploaded /> : <Missing />}
                    <Button size="sm" variant={ok ? 'secondary' : 'primary'} className="h-9 px-3.5" onClick={() => pick(d.id)}>
                      {ok ? 'Replace' : 'Upload'}<span className="sr-only"> {d.name}</span>
                    </Button>
                  </li>
                )
              })}
              {extras.map((f, i) => (
                <li key={`${f.file}-${i}`} className={cn('flex items-center gap-3.5 px-[18px] py-3.5', i < extras.length - 1 && 'border-b border-line', 'border-t border-line')}>
                  <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-success-tint text-success-ink"><Check className="size-[18px]" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-control font-semibold">{f.file}</div>
                    <div className="text-label text-muted">{f.size}</div>
                  </div>
                  <Uploaded />
                  <Button size="sm" variant="ghost" className="h-9 px-3" onClick={() => removeExtra(i)}><Trash2 className="size-4" aria-hidden />Remove<span className="sr-only"> {f.file}</span></Button>
                </li>
              ))}
            </ul>
          </Card>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <button
              type="button"
              onClick={() => pick('extra')}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }}
              onDragLeave={() => setOver(false)}
              onDrop={onDrop}
              className={cn('flex h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border-[1.5px] border-dashed text-center text-text', over ? 'border-primary bg-primary-tint' : 'border-line-strong bg-surface')}
            >
              <UploadCloud className="size-[26px] text-muted" aria-hidden />
              <span className="text-small font-medium">Drop other documents here</span>
              <span className="text-label text-muted">e.g. a draft agreement · PDF, JPG, PNG · 20 MB max</span>
            </button>
            <Card className="flex flex-col gap-2.5 p-[18px] text-small">
              <div className="font-semibold">Language is detected automatically</div>
              <div className="text-muted">Marathi, Hindi and English pages are read as they are. You will see the original text next to an English translation.</div>
            </Card>
            <div className="flex-1" />
            <div className="flex flex-col gap-2">
              {errorList}
              <Button size="lg" block onClick={next}>Check documents</Button>
              <div className="text-center text-label text-muted">You can check now. Missing documents will show up as findings.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 834 and 390 */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:grid md:grid-cols-2 md:content-start md:gap-5 md:px-8 md:py-7 xl:hidden">
        <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase md:col-span-full">Step 2 of 4 · Documents</div>
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8 md:col-span-full">Upload documents</h1>
        {uploadDocs.map((d) => {
          const p = bySlot(d.id)
          const ok = !!p
          return (
            <Card key={d.id} className="flex flex-col gap-3 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-small font-semibold">{d.name}</div>
                {ok ? <Uploaded /> : <Missing />}
              </div>
              <div className="text-label leading-[17px] text-muted">{p ? mobileMeta(p) : d.mobileMeta}</div>
              <Button size="sm" variant="secondary" className="min-h-11 self-start" onClick={() => pick(d.id)}>{ok ? 'Replace' : 'Upload'}<span className="sr-only"> {d.name}</span></Button>
            </Card>
          )
        })}
        {extras.map((f, i) => (
          <Card key={`${f.file}-${i}`} className="flex flex-col gap-3 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-small font-semibold">{f.file}</div>
              <Uploaded />
            </div>
            <div className="flex items-center justify-between text-label text-muted"><span>{f.size}</span><Button size="sm" variant="ghost" className="min-h-11" onClick={() => removeExtra(i)}>Remove<span className="sr-only"> {f.file}</span></Button></div>
          </Card>
        ))}
        <button
          type="button"
          onClick={() => pick('extra')}
          className="cursor-pointer rounded-[10px] border-2 border-dashed border-line-strong bg-surface p-[18px] text-center text-text md:col-span-full"
        >
          <b className="block">Add files</b>
          <span className="text-label font-medium text-muted">PDF, JPG or PNG</span>
        </button>
        {errorList}
        <Button size="lg" block onClick={next} className="md:col-span-full md:max-w-[360px]">Check documents</Button>
      </div>
    </Screen>
  )
}
