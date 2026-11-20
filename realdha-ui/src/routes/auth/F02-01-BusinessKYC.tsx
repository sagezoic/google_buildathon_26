import { AlertCircle, Check, Loader2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { AuthCard } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { ProgressPct } from '../../components/ui/progress-pct'
import { ACCEPT, KYC_SLOTS, UPLOAD_MS, fmtSize, kycFileError, kycSeed, type KycDocs } from '../../data/fixtures/f02-kyc'
import { BIZ, bizRole } from '../../data/fixtures/f01-business'
import { logAudit } from '../../lib/audit'
import { cn } from '../../lib/cn'
import { K } from '../../lib/identity-flow'

const HOME: Record<string, string> = { developer: 'F15-01', broker: 'F16-01', lawyer: 'GP-13', gov: 'F20-01' }

/** F02-01 · Business KYC uploads. Three slots; files are mocked (name/size kept in `f02.businessDocs`). `?state=progress|ready|empty`. */
export default function BusinessKYC() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [role] = usePersistentState<string>(K.businessRole, 'developer')
  const [stored, setStored] = usePersistentState<KycDocs>('f02.businessDocs', {})
  const [, setReview] = usePersistentState<{ status: string; at: number } | null>('f02.businessKyc', null)
  const [seed, setSeed] = useState<KycDocs | null>(() => kycSeed(Date.now())[params.get('state') ?? ''] ?? null)
  const docs = seed ?? stored
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [now, setNow] = useState(() => Date.now())
  const refs = useRef<Record<string, HTMLInputElement | null>>({})
  const [over, setOver] = useState('')
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t) }, [])

  const pctOf = (id: string) => {
    const d = docs[id]
    if (!d) return 0
    if (d.status === 'uploaded') return 100
    return d.fixedPct ?? Math.min(100, ((now - d.startedAt) / UPLOAD_MS) * 100)
  }
  const stateOf = (id: string) => (!docs[id] ? 'missing' : pctOf(id) >= 100 ? 'uploaded' : 'uploading')
  const allDone = KYC_SLOTS.every((s) => stateOf(s.id) === 'uploaded')

  const take = (id: string, f: File | undefined) => {
    if (!f) return
    const err = kycFileError(f)
    setErrs((p) => ({ ...p, [id]: err }))
    if (err) return
    const next = { ...docs, [id]: { name: f.name, size: f.size, startedAt: Date.now(), status: 'uploading' as const } }
    setSeed(null); setStored(next); setNow(Date.now())
  }
  const drop = (id: string) => (e: DragEvent) => { e.preventDefault(); setOver(''); if (stateOf(id) !== 'uploading') take(id, e.dataTransfer.files[0]) }
  const submit = () => {
    setReview({ status: 'submitted', at: Date.now() })
    if (seed) { setStored(seed); setSeed(null) }
    logAudit('Business KYC', 'Submitted documents for review')
    nav(path('F02-03'))
  }

  const form = BIZ[bizRole(role)]
  return (
    <Screen id="F02-01" layout="auth">
      <AuthCard wide className="md:max-w-[640px]">
        <p className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-xl:hidden">Business KYC · {form.title}</p>
        <h1 className="text-h1 font-semibold"><span className="xl:hidden">Business verification</span><span className="max-xl:hidden">Verify your organisation</span></h1>
        <p className="text-body text-muted max-xl:hidden">Upload three documents. A Realdha admin reviews them, usually within one working day.</p>
        <div className="flex flex-col gap-3.5">
          {KYC_SLOTS.map((s) => {
            const st = stateOf(s.id)
            const d = docs[s.id]
            const pct = pctOf(s.id)
            const left = Math.max(1, Math.ceil(((100 - pct) / 100) * (UPLOAD_MS / 1000)))
            return (
              <div key={s.id} onDragOver={(e) => { e.preventDefault(); setOver(s.id) }} onDragLeave={() => setOver('')} onDrop={drop(s.id)} className={cn('rounded-card border bg-surface p-4', st === 'missing' ? 'border-dashed border-line-strong bg-sunken' : 'border-line-strong', over === s.id && 'border-primary bg-primary-tint')}>
                <div className="flex items-center gap-3.5">
                  <span aria-hidden className={cn('flex size-9 flex-none items-center justify-center rounded-[8px]', st === 'uploaded' ? 'bg-success-tint text-success-ink' : st === 'uploading' ? 'bg-info-tint text-info-ink' : 'bg-warning-tint text-warning-ink')}>
                    {st === 'uploaded' ? <Check className="size-5" /> : st === 'uploading' ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" /> : <Upload className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold"><span className="xl:hidden">{'titleM' in s ? s.titleM : s.title}</span><span className="max-xl:hidden">{s.title}</span></p>
                    {st === 'uploading' ? (
                      <ProgressPct pct={pct} label={`${s.title} upload`} className="mt-2 max-w-[376px]" />
                    ) : (
                      <p className="truncate text-label text-muted">
                        {d ? `${d.name} · ${fmtSize(d.size)}` : <><span className="max-xl:hidden">Drag a file here or choose one · PDF, JPG, PNG · 20 MB</span><span className="xl:hidden">{'hintM' in s ? s.hintM : 'PDF, JPG, PNG · 20 MB'}</span></>}
                      </p>
                    )}
                  </div>
                  {st === 'uploading' ? (
                    <span role="status" className="flex-none text-label text-muted">{Math.round(pct)}% · {left} s left</span>
                  ) : (
                    <>
                      {st === 'uploaded' ? <Pill tone="success" icon={<Check className="size-3.5" />} className="max-xl:hidden">Uploaded</Pill> : <Pill tone="warning" icon={<AlertCircle className="size-3.5" />} className="max-xl:hidden">Missing</Pill>}
                      <Button size="sm" variant={st === 'uploaded' ? 'secondary' : 'primary'} onClick={() => refs.current[s.id]?.click()} aria-label={`${st === 'uploaded' ? 'Replace' : 'Upload'} ${s.title}`} className="flex-none">{st === 'uploaded' ? 'Replace' : 'Upload'}</Button>
                    </>
                  )}
                  <input ref={(el) => { refs.current[s.id] = el }} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { take(s.id, e.target.files?.[0]); e.target.value = '' }} />
                </div>
                {st !== 'uploading' && (
                  <p className="mt-2 flex items-center gap-1.5 xl:hidden">{st === 'uploaded' ? <Pill tone="success" icon={<Check className="size-3.5" />}>Uploaded</Pill> : <Pill tone="warning" icon={<AlertCircle className="size-3.5" />}>Missing</Pill>}</p>
                )}
                {errs[s.id] && <p role="alert" className="mt-2 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5 flex-none" aria-hidden />{errs[s.id]}</p>}
              </div>
            )
          })}
        </div>
        <Button size="lg" block disabled={!allDone} onClick={submit}>Submit for review</Button>
        <p className="text-center text-label text-muted">
          <span className="max-xl:hidden">Submit activates when all three documents are uploaded. </span>
          <button type="button" onClick={() => nav(path(HOME[bizRole(role)] ?? 'X-01'))} className="inline-flex min-h-11 cursor-pointer items-center text-brand underline">Do this later</button>
        </p>
      </AuthCard>
    </Screen>
  )
}
