import { CircleAlert, CircleCheck, FileText, Info, Minus, Plus, TriangleAlert } from 'lucide-react'
import { useRef, useState } from 'react'
import { usePersistentState } from '../../../app/persist'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field } from '../../../components/ui/field'
import { Pill } from '../../../components/ui/pill'
import { checkFile, fileSize, usePropertyDocuments, usePropertyDraft, usePropertyFindings } from '../../../lib/property-store'
import { findings as fixtureFindings, settledFields as fixtureSettled, type ActionKind, type Finding, type Resolution, type ReviewAction, type StoredDoc } from '../../../data/fixtures/property-intake'
import { cn } from '../../../lib/cn'
import { deriveFindings, deriveSettled, docLabel, langLabel, useDocDetails, type SettledField } from '../../../lib/property-findings'
import type { ServerDocDetail } from '../../../lib/property-api'
import { uploadDocument } from '../../../lib/property-api'

type Filter = 'all' | 'attention' | 'confirmed'
const ZOOM = ['scale-90', 'scale-100', 'scale-110', 'scale-125'] as const
/** Fields shown in the demo (3 flagged + 5 read cleanly). Real reviews count what was actually read. */
const DEMO_TOTAL = 8

const RESOLVED: Record<Resolution, string> = { confirmed: 'Confirmed', corrected: 'Corrected', uploaded: 'Uploaded', skipped: 'Not provided' }
const ResolvedPill = ({ r }: { r: Resolution }) => (
  <Pill tone={r === 'skipped' ? 'neutral' : 'success'} icon={<CircleCheck className="size-3.5" />}>{RESOLVED[r]}</Pill>
)
const SeverityPill = ({ tone, children }: { tone: Finding['tone']; children: string }) => (
  <Pill tone={tone} icon={tone === 'danger' ? <CircleAlert className="size-3.5" /> : <TriangleAlert className="size-3.5" />}>{children}</Pill>
)

/** Area, mutation number and surname each have their own shape; null means valid. */
function validateFix(id: Finding['id'], v: string): string | null {
  const t = v.trim()
  if (!t) return 'Enter a value, or cancel.'
  if (id === 'A' && !/^\d+(\.\d+)?\s*(sq\.?\s?m|sqm|ha|hectares?)?$/i.test(t)) return 'Enter an area like 418 sq m or 0.0418 ha.'
  if (id === 'B' && !/^\d{1,6}$/.test(t)) return 'Enter the mutation number, digits only.'
  if (id === 'C' && !/^[\p{L}][\p{L} .'-]*$/u.test(t)) return 'Use letters only, like Kulkarni.'
  return null
}

function useResolutions(propertyId?: string) {
  const [stored, setStored] = usePropertyFindings()
  const [, setDocs] = usePropertyDocuments()
  const [editing, setEditing] = useState<Finding['id'] | null>(null)
  const [uploadError, setUploadError] = useState<{ id: Finding['id']; msg: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const pending = useRef<Finding['id']>('A')
  const res = Object.fromEntries(Object.entries(stored).map(([k, v]) => [k, v.decision])) as Partial<Record<Finding['id'], Resolution>>
  const fixed = Object.fromEntries(Object.entries(stored).filter(([, v]) => v.value).map(([k, v]) => [k, v.value])) as Partial<Record<Finding['id'], string>>
  const decide = (id: Finding['id'], decision: Resolution, value?: string) => setStored((x) => ({ ...x, [id]: { decision, ...(value ? { value } : {}) } }))
  const act = (f: Finding, kind: ActionKind) => {
    setUploadError(null)
    if (kind === 'confirm') decide(f.id, 'confirmed')
    if (kind === 'skip') decide(f.id, 'skipped')
    if (kind === 'correct') setEditing(f.id)
    if (kind === 'upload') { pending.current = f.id; file.current?.click() }
  }
  const saveFix = (f: Finding, value: string) => { decide(f.id, 'corrected', value.trim()); setEditing(null) }
  const undo = (f: Finding) => { setUploadError(null); setStored((x) => { const n = { ...x }; delete n[f.id]; return n }) }
  const onFile = async (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    const id = pending.current
    const why = checkFile(f)
    if (why) { setUploadError({ id, msg: why }); return }
    setUploadError(null)
    const slot = id === 'B' ? 'mutation' : 'agreement'
    let stored: StoredDoc = { slot, file: f.name, size: fileSize(f.size), status: 'uploaded' }
    if (propertyId) {
      try {
        const d = await uploadDocument(propertyId, slot, f)
        stored = { ...stored, file: d.filename, id: d.id }
      } catch (e) { setUploadError({ id, msg: e instanceof Error ? e.message : 'Upload failed.' }); return }
    }
    setDocs((d) => [...d.filter((x) => x.slot !== slot), stored])
    decide(id, 'uploaded')
  }
  return { res, editing, setEditing, fixed, act, saveFix, undo, file, onFile, uploadError }
}

function CorrectForm({ f, onSave, onCancel, mobile }: { f: Finding; onSave: (v: string) => void; onCancel: () => void; mobile?: boolean }) {
  const [v, setV] = useState(f.value)
  const [error, setError] = useState<string>()
  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(e) => { e.preventDefault(); const why = validateFix(f.id, v); if (why) setError(why); else onSave(v) }}
    >
      <Field label={mobile ? f.mobileTitle : f.title} value={v} error={error} onChange={(e) => { setV(e.target.value); setError(undefined) }} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="primary" className={mobile ? 'h-11' : undefined}>Confirm</Button>
        <Button type="button" size="sm" variant="secondary" className={mobile ? 'h-11' : undefined} onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

function Actions({ f, actions, act, mobile }: { f: Finding; actions: ReviewAction[]; act: (f: Finding, k: ActionKind) => void; mobile?: boolean }) {
  return (
    <div className={cn('flex gap-2', mobile && 'flex-wrap')}>
      {actions.map((a) => (
        <Button
          key={a.label}
          size="sm"
          variant={a.primary ? 'primary' : mobile && a.kind === 'skip' ? 'ghost' : 'secondary'}
          className={cn(mobile && 'h-11', mobile && (a.kind === 'skip' || a.kind === 'upload' || actions.length === 1) && 'w-full', mobile && a.kind === 'skip' && 'text-muted')}
          onClick={() => act(f, a.kind)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  )
}

function Viewer({ className }: { className?: string }) {
  const [both, setBoth] = useState(true)
  const [zoom, setZoom] = useState(1)
  const chip = 'cursor-pointer rounded-control px-2.5 py-1 text-label'
  return (
    <Card className={cn('flex min-w-0 flex-col overflow-hidden p-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas px-[18px] py-3">
        <div className="flex items-center gap-2 text-small font-semibold"><FileText className="size-[18px] text-muted" aria-hidden />7/12 extract · page 1 of 2</div>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-pressed={!both} onClick={() => setBoth(false)} className={cn(chip, 'font-medium', !both ? 'border border-primary bg-primary-tint font-semibold' : 'border border-line-strong bg-surface')}>Original</button>
          <button type="button" aria-pressed={both} onClick={() => setBoth(true)} className={cn(chip, both ? 'border border-primary bg-primary-tint font-semibold' : 'border border-line-strong bg-surface font-medium')}>Original + English</button>
          <Button size="sm" variant="secondary" aria-label="Zoom out" className="w-9 px-0" disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)}><Minus className="size-4" aria-hidden /></Button>
          <Button size="sm" variant="secondary" aria-label="Zoom in" className="w-9 px-0" disabled={zoom === ZOOM.length - 1} onClick={() => setZoom((z) => z + 1)}><Plus className="size-4" aria-hidden /></Button>
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-auto bg-sunken p-6">
        <article lang="mr" className={cn('flex h-max w-[560px] max-w-full origin-top flex-col gap-3 border border-line-strong bg-surface px-9 py-8 text-control leading-7 shadow-e2 max-md:px-5', ZOOM[zoom])}>
          <div className="text-center text-body leading-[26px] font-semibold">गाव नमुना सात – अधिकार अभिलेख पत्रक</div>
          {both && <div lang="en" className="text-center text-label text-muted">Village Form 7 – Record of Rights</div>}
          <div className="flex justify-between border-y border-text py-2"><span>मौजे: कुसगाव</span><span>तालुका: मावळ</span><span>जिल्हा: पुणे</span></div>
          <div>भूमापन क्रमांक व उपविभाग: <b>गट नं. ११२/२</b></div>
          <div className="rounded bg-warning-tint px-2 py-1.5">
            एकूण क्षेत्र: <span className="rounded-sm bg-warning-tint px-1 ring-2 ring-warning">०.०४१८ हे.आर</span>
            {both && <span lang="en" className="ml-2 text-label text-warning-ink">= Total area: 0.0418 hectare</span>}
          </div>
          <div>भोगवटादाराचे नाव: <b>प्रकाश कुलकर्णी</b></div>
          <div>वापर: बिनशेती</div>
          {both && <div lang="en" className="border-t border-dashed border-line-strong pt-2 text-label leading-[18px] text-muted">Page 2 lists mutation entries including <span lang="mr">फेरफार क्र. २२९१</span> (no. 2291).</div>}
        </article>
      </div>
      <div className="flex justify-between border-t border-line px-[18px] py-2.5 text-label text-muted"><span>Highlighted line = source of finding A</span><span>Page 1 · 2</span></div>
    </Card>
  )
}

/** The real source viewer: the selected document's text as Document AI read it, with its English translation beneath. */
function DocumentViewer({ docs, loading, error, className }: { docs: ServerDocDetail[]; loading: boolean; error?: string; className?: string }) {
  const [sel, setSel] = useState(0)
  const [both, setBoth] = useState(true)
  const [zoom, setZoom] = useState(1)
  const doc = docs[Math.min(sel, docs.length - 1)]
  const chip = 'cursor-pointer rounded-control px-2.5 py-1 text-label'
  const translated = !!doc?.translatedText
  return (
    <Card className={cn('flex min-w-0 flex-col overflow-hidden p-0', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas px-[18px] py-3">
        <div className="flex min-w-0 items-center gap-2 text-small font-semibold">
          <FileText className="size-[18px] flex-none text-muted" aria-hidden />
          {docs.length > 1 ? (
            <select aria-label="Document" value={Math.min(sel, docs.length - 1)} onChange={(e) => setSel(Number(e.target.value))} className="min-h-9 max-w-[220px] cursor-pointer rounded-control border border-line-strong bg-field px-2 text-small text-text">
              {docs.map((d, i) => <option key={d.id} value={i}>{docLabel(d)}</option>)}
            </select>
          ) : <span className="truncate">{doc ? docLabel(doc) : 'Document'}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {translated && (
            <>
              <button type="button" aria-pressed={!both} onClick={() => setBoth(false)} className={cn(chip, 'font-medium', !both ? 'border border-primary bg-primary-tint font-semibold' : 'border border-line-strong bg-surface')}>Original</button>
              <button type="button" aria-pressed={both} onClick={() => setBoth(true)} className={cn(chip, both ? 'border border-primary bg-primary-tint font-semibold' : 'border border-line-strong bg-surface font-medium')}>Original + English</button>
            </>
          )}
          <Button size="sm" variant="secondary" aria-label="Zoom out" className="w-9 px-0" disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)}><Minus className="size-4" aria-hidden /></Button>
          <Button size="sm" variant="secondary" aria-label="Zoom in" className="w-9 px-0" disabled={zoom === ZOOM.length - 1} onClick={() => setZoom((z) => z + 1)}><Plus className="size-4" aria-hidden /></Button>
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-auto bg-sunken p-6">
        {error ? <p role="alert" className="text-small text-danger-ink">{error}</p>
          : loading || !doc ? <p role="status" className="text-small text-muted">{loading ? 'Loading the documents…' : 'No documents have been read yet.'}</p>
          : (
            <article className={cn('flex h-max w-[560px] max-w-full origin-top flex-col gap-3 border border-line-strong bg-surface px-9 py-8 text-control leading-7 shadow-e2 max-md:px-5', ZOOM[zoom])}>
              <div lang={doc.lang && doc.lang !== 'und' ? doc.lang : undefined} className="whitespace-pre-wrap">{doc.originalText}</div>
              {translated && both && (
                <div lang="en" className="border-t border-dashed border-line-strong pt-3 text-label leading-[20px] whitespace-pre-wrap text-muted">{doc.translatedText}</div>
              )}
            </article>
          )}
      </div>
      <div className="flex justify-between border-t border-line px-[18px] py-2.5 text-label text-muted">
        <span>{doc ? `${langLabel(doc.lang)} detected${translated ? ' · translated to English' : ''}` : ''}</span>
        <span>{doc?.pages ? `${doc.pages} page${doc.pages === 1 ? '' : 's'}` : ''}</span>
      </div>
    </Card>
  )
}

/** GP-10 · Extraction review. 1440: field list + source viewer. 834/390: field cards, with a Fields / Document switch. */
export default function Review() {
  const [view, setView] = useDemoState(['review', 'document'] as const)
  const [filter, setFilter] = usePersistentState<Filter>('property.findings.filter', 'all')
  const [draft] = usePropertyDraft()
  const [docs] = usePropertyDocuments()
  /** Real review: every document is on the server and was read. Otherwise the demo fixtures show. */
  const real = !!draft.id && docs.length > 0 && docs.every((d) => d.id)
  const { loading, details, error } = useDocDetails(real ? draft.id : undefined, docs)
  const { res, editing, setEditing, fixed, act, saveFix, undo, file, onFile, uploadError } = useResolutions(real ? draft.id : undefined)
  // A mutation entry that was uploaded to resolve finding B must keep showing B as resolved.
  const findings: Finding[] = real
    ? deriveFindings(details, { area: draft.area, areaUnit: draft.areaUnit }, docs.some((d) => d.slot === 'mutation') && !res.B)
    : fixtureFindings
  const settledFields: SettledField[] = real
    ? deriveSettled(details, draft, findings.some((f) => f.id === 'A'))
    : fixtureSettled.map((s) => ({ k: s.k, v: s.k.startsWith('Gat') ? `${draft.gat} · ${draft.village}` : s.v, confirmed: s.confirmed, source: 'NA order' }))
  const open = findings.filter((f) => !res[f.id])
  const resolvedCount = findings.length - open.length
  const confirmedCount = settledFields.filter((s) => s.confirmed).length + resolvedCount
  const TOTAL = real ? findings.length + settledFields.length : DEMO_TOTAL
  const show = (resolved: boolean, kind: 'finding' | 'confirmed' | 'other') =>
    filter === 'all' || (filter === 'attention' ? kind === 'finding' && !resolved : kind === 'confirmed' || (kind === 'finding' && resolved))
  const viewer = (className: string) => (real ? <DocumentViewer docs={details} loading={loading} error={error} className={className} /> : <Viewer className={className} />)
  const nothingRead = real && !loading && !error && TOTAL === 0

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: `All ${TOTAL}` },
    { id: 'attention', label: `Needs attention ${open.length}` },
    { id: 'confirmed', label: `Confirmed ${confirmedCount}` },
  ]

  return (
    <Screen id="GP-10" noTabs>
      <input ref={file} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { void onFile(e.target.files); e.target.value = '' }} />

      {/* 1440 */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-12 py-6 max-xl:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase">Step 3 of 4 · Review what we read</div>
            <h1 className="mt-0.5 text-h1">Review extracted details</h1>
          </div>
          <div className="flex items-center gap-3">
            <span aria-live="polite">
              <Pill tone={open.length ? 'warning' : 'success'} icon={open.length ? <TriangleAlert className="size-3.5" /> : <CircleCheck className="size-3.5" />} className="px-3 py-1 text-chip">{open.length} need your attention</Pill>
            </span>
            <Button to={path('GP-11')}>See verification report</Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-6">
          <Card className="flex w-[640px] flex-none flex-col overflow-hidden p-0">
            <div role="group" aria-label="Filter fields" className="flex gap-1.5 border-b border-line bg-canvas px-[18px] py-3 text-chip font-medium">
              {tabs.map((t) => (
                <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(t.id)} className={cn('cursor-pointer rounded-control px-2.5 py-1', filter === t.id ? 'bg-primary text-on-primary' : 'border border-line-strong bg-surface')}>{t.label}</button>
              ))}
            </div>
            <ul>
              {nothingRead && <li role="status" className="px-[18px] py-4 text-small text-muted">We could not read any fields from these documents. Check the text on the right, or upload a clearer copy.</li>}
              {findings.map((f) => {
                const r = res[f.id]
                if (!show(!!r, 'finding')) return null
                if (r) {
                  return (
                    <li key={f.id} className="flex items-center justify-between border-b border-line px-[18px] py-4">
                      <div><div className="text-label text-muted">{f.title}</div><div className="text-control font-semibold">{fixed[f.id] ?? (f.compare?.[0].v ?? f.single)}</div></div>
                      <div className="flex items-center gap-2"><ResolvedPill r={r} /><Button size="sm" variant="ghost" onClick={() => undo(f)}>Change<span className="sr-only"> {f.title}</span></Button></div>
                    </li>
                  )
                }
                return (
                  <li key={f.id} className="flex flex-col gap-2 border-b border-line border-l-4 border-l-warning bg-warning-tint/40 py-4 pr-[18px] pl-3.5">
                    <div className="flex items-center justify-between"><span className="text-label text-muted">{f.title}</span><SeverityPill tone={f.tone}>{f.badge}</SeverityPill></div>
                    {f.compare ? (
                      <div className="flex gap-5">{f.compare.map((c) => <div key={c.k}><div className="text-label text-muted">{c.k}</div><div className="text-body font-semibold">{c.v}</div></div>)}</div>
                    ) : <div className="text-body font-semibold">{f.single}</div>}
                    <div className="text-label text-muted">{f.source}</div>
                    {editing === f.id ? <CorrectForm f={f} onSave={(v) => saveFix(f, v)} onCancel={() => setEditing(null)} /> : <Actions f={f} actions={f.actions} act={act} />}
                    {uploadError?.id === f.id && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5" aria-hidden />{uploadError.msg}</p>}
                  </li>
                )
              })}
              {settledFields.map((s, i) => show(false, s.confirmed ? 'confirmed' : 'other') && (
                <li key={s.k} className={cn('flex items-center justify-between px-[18px] py-4', i < settledFields.length - 1 && 'border-b border-line')}>
                  <div><div className="text-label text-muted">{s.k}</div><div className="text-control font-semibold">{s.v}</div></div>
                  {s.confirmed ? <Pill tone="success" icon={<CircleCheck className="size-3.5" />}>Confirmed</Pill> : <Pill tone="info" icon={<Info className="size-3.5" />}>Read from {s.source}</Pill>}
                </li>
              ))}
            </ul>
          </Card>
          {viewer('flex-1')}
        </div>
      </div>

      {/* 834 and 390 */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 md:grid md:grid-cols-2 md:content-start md:gap-5 md:px-8 md:py-7 xl:hidden">
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8 md:col-span-full">Review extracted fields</h1>
        <div role="tablist" aria-label="View" className="flex self-start overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-medium md:col-span-full">
          {([['review', 'Fields'], ['document', 'Document']] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cn('min-h-11 cursor-pointer px-3', view === id ? 'bg-primary text-on-primary' : 'text-text')}>{label}</button>
          ))}
        </div>
        {view === 'document' ? (
          viewer('md:col-span-full')
        ) : (
          <>
            {findings.map((f) => {
              const r = res[f.id]
              return (
                <Card key={f.id} className="flex flex-col gap-3 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-small">{f.mobileTitle}</b>
                    {r ? <ResolvedPill r={r} /> : <SeverityPill tone={f.tone}>{f.mobileBadge}</SeverityPill>}
                  </div>
                  <div className="text-control leading-[22px] font-semibold">{fixed[f.id] ?? f.mobile.value}</div>
                  {!r && <div className="text-label leading-[17px] font-medium text-muted">{f.mobile.note}</div>}
                  {!r && f.mobile.source && <div className="rounded-lg border border-line bg-canvas p-3"><span className="text-label font-medium text-muted">{f.mobile.source}</span></div>}
                  {r && <Button size="sm" variant="ghost" className="min-h-11 self-start" onClick={() => undo(f)}>Change<span className="sr-only"> {f.mobileTitle}</span></Button>}
                  {uploadError?.id === f.id && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5" aria-hidden />{uploadError.msg}</p>}
                  {!r && (editing === f.id ? <CorrectForm f={f} mobile onSave={(v) => saveFix(f, v)} onCancel={() => setEditing(null)} /> : <Actions f={f} actions={f.mobile.actions} act={act} mobile />)}
                </Card>
              )
            })}
            {settledFields.map((s) => (
              <Card key={s.k} className="flex flex-col gap-3 p-3.5">
                <b className="text-small">{s.k}</b>
                <div className="text-control leading-[22px] font-semibold">{s.v}</div>
                {s.confirmed ? <Pill tone="success" icon={<CircleCheck className="size-3.5" />} className="self-start">Confirmed</Pill> : <Pill tone="info" icon={<Info className="size-3.5" />} className="self-start">Read from {s.source}</Pill>}
              </Card>
            ))}
            {nothingRead && <p role="status" className="text-small text-muted md:col-span-full">We could not read any fields from these documents. Check the text in Document view, or upload a clearer copy.</p>}
          </>
        )}
        <Button size="lg" block to={path('GP-11')} className="md:col-span-full md:max-w-[360px]">See verification report</Button>
      </div>
    </Screen>
  )
}
