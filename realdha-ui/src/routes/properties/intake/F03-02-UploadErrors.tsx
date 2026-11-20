import { Check, CircleAlert, Copy, TriangleAlert } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { ISSUES, type Issue, type IssueId } from '../../../data/fixtures/f03-properties'
import { cn } from '../../../lib/cn'
import { logAudit } from '../../../lib/audit'
import { useIssueResults } from '../../../lib/f03-store'
import { checkFile, usePropertyDocuments } from '../../../lib/property-store'

const ICON = { unsupported: CircleAlert, unreadable: TriangleAlert, 'wrong-type': TriangleAlert, duplicate: Copy }

interface Act { label: string; primary?: boolean; run: () => void }

/** F03-02 · Upload errors. States: all (default), unsupported, unreadable, wrong-type, duplicate. */
export default function UploadErrors() {
  const [state] = useDemoState(['all', 'unsupported', 'unreadable', 'wrong-type', 'duplicate'] as const)
  const [results, setResults] = useIssueResults()
  const [, setDocs] = usePropertyDocuments()
  const [pickErr, setPickErr] = useState<Partial<Record<IssueId, string>>>({})
  const input = useRef<HTMLInputElement>(null)
  const target = useRef<{ id: IssueId; how: string } | null>(null)

  const issues = state === 'all' ? ISSUES : ISSUES.filter((i) => i.id === state)
  const open = issues.filter((i) => !results[i.id])
  const resolve = (i: Issue, how: string) => {
    setPickErr((e) => ({ ...e, [i.id]: undefined }))
    setResults((r) => ({ ...r, [i.id]: { how } }))
    logAudit('Prakash Kulkarni', `${i.doc}: ${how}`)
  }
  const choose = (id: IssueId, how: string) => { target.current = { id, how }; input.current?.click() }
  const picked = (files: FileList | null) => {
    const t = target.current
    const f = files?.[0]
    if (!t || !f) return
    const issue = ISSUES.find((i) => i.id === t.id)!
    const why = checkFile(f)
    if (why) { setPickErr((e) => ({ ...e, [t.id]: why })); return }
    if (t.id === 'wrong-type' || t.id === 'duplicate') {
      const slot = t.id === 'wrong-type' ? 'card' : 'deed'
      setDocs((d) => [...d.filter((x) => x.slot !== slot), { slot, file: f.name, size: f.size >= 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1e3))} KB`, status: 'uploaded' }])
    }
    resolve(issue, `${t.how} (${f.name})`)
  }

  const actions = (i: Issue): Act[] => {
    switch (i.id) {
      case 'unsupported': return [{ label: 'Choose another file', primary: true, run: () => choose(i.id, 'Chose another file') }, { label: 'Remove', run: () => resolve(i, 'Removed the file') }]
      case 'unreadable': return [{ label: 'Upload a clearer copy', primary: true, run: () => choose(i.id, 'Uploaded a clearer copy') }, { label: 'Use anyway', run: () => resolve(i, 'Used the scan anyway') }]
      case 'wrong-type': return [
        { label: 'Move to "Sale deed"', primary: true, run: () => { setDocs((d) => [...d.filter((x) => x.slot !== 'deed'), { slot: 'deed', file: 'sale-deed-2015.pdf', size: '4.8 MB', pages: 6, langs: ['Marathi', 'English'], status: 'uploaded' }]); resolve(i, 'Moved to Sale deed') } },
        { label: 'Keep as property card', run: () => resolve(i, 'Kept as property card') },
        { label: 'Replace file', run: () => choose(i.id, 'Replaced the file') },
      ]
      case 'duplicate': return [{ label: 'Skip this file', primary: true, run: () => resolve(i, 'Skipped the file') }, { label: 'Replace the old one', run: () => choose(i.id, 'Replaced the old one') }]
    }
  }

  const buttons = (i: Issue, stack: boolean) => (
    <div className={cn('flex gap-2', stack ? 'flex-col' : 'flex-wrap')}>
      {actions(i).map((a) => (
        <Button key={a.label} size="md" variant={a.primary ? 'primary' : 'secondary'} className={cn('max-xl:min-h-11 max-xl:w-full xl:h-control', stack && 'xl:w-full')} onClick={a.run}>{a.label}</Button>
      ))}
    </div>
  )

  const done = (i: Issue): ReactNode => (
    <div role="status" className="flex items-center gap-2">
      <Pill tone="success" icon={<Check className="size-3.5" />}>Resolved</Pill>
      <span className="text-chip text-muted">{results[i.id]?.how}</span>
    </div>
  )

  const errBox = (i: Issue) => {
    const Icon = ICON[i.id]
    const tone = i.tone === 'danger' ? 'border-danger bg-danger-tint text-danger-ink' : 'border-warning bg-warning-tint text-warning-ink'
    return (
      <div className={cn('flex gap-2.5 rounded-lg border p-3', tone)}>
        <Icon className="mt-0.5 size-[18px] flex-none" aria-hidden />
        <div className="min-w-0">
          <div className="text-small font-semibold break-words">{i.file}</div>
          <div className="text-chip text-text">
            {i.id === 'wrong-type' ? <>This looks like a <b className="font-semibold">sale deed</b>, not a property card. Detected language: <span lang="mr">मराठी</span>.</>
              : i.id === 'duplicate' ? <>This is identical to <b className="font-semibold">sale-deed-2015.pdf</b>, already uploaded on 20 Nov 2026.</>
              : i.msg}
          </div>
        </div>
      </div>
    )
  }
  const pickMsg = (id: IssueId) => pickErr[id] && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><CircleAlert className="size-3.5 flex-none" aria-hidden />{pickErr[id]}</p>

  return (
    <Screen id="F03-02" role="owner" back={path('GP-08')} title="Documents" noTabs>
      <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { picked(e.target.files); e.target.value = '' }} />
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6 xl:px-12 xl:py-7">
        <h1 className="text-h1 max-md:text-[24px] max-md:leading-8 xl:hidden">Fix these files</h1>

        {/* 1440 */}
        <div className="grid gap-4 max-xl:hidden xl:grid-cols-4 xl:items-stretch">
          {issues.map((i) => (
            <Card key={i.id} className="flex flex-col gap-3.5 p-5">
              <div className="text-label font-semibold tracking-[0.06em] text-muted uppercase">{i.cap}</div>
              <h2 className="text-h3">{i.doc}</h2>
              {i.id === 'unreadable' && <div className="flex h-[90px] items-center justify-center rounded-lg border border-line bg-sunken text-label text-muted">Blurry scan preview</div>}
              {errBox(i)}
              <div className="flex-1" />
              {pickMsg(i.id)}
              {results[i.id] ? done(i) : buttons(i, i.id === 'wrong-type')}
            </Card>
          ))}
        </div>

        {/* 834 and 390 */}
        <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:items-start xl:hidden">
          {issues.map((i) => {
            const Icon = ICON[i.id]
            return (
              <Card key={i.id} className={cn('flex flex-col gap-2.5 p-3.5', !results[i.id] && 'border-danger')}>
                <h2 className="flex items-center gap-2 text-small font-semibold text-danger-ink"><Icon className="size-4" aria-hidden />{i.mTitle}</h2>
                <p className="text-chip leading-[19px] text-muted">{i.mMsg}</p>
                {pickMsg(i.id)}
                {results[i.id] ? done(i) : buttons(i, true)}
              </Card>
            )
          })}
        </div>

        {open.length === 0 && (
          <div role="status" className="flex flex-wrap items-center gap-3">
            <Pill tone="success" icon={<Check className="size-3.5" />}>All files fixed</Pill>
            <Button to={path('GP-08')} size="lg">Back to upload documents</Button>
          </div>
        )}
      </div>
    </Screen>
  )
}
