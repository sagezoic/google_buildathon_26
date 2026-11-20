import { CheckCircle2, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { AuditTrail } from '../../components/ui/audit-trail'
import { RecordId } from '../../components/ui/record-id'
import { dayStamp, logAudit } from '../../lib/audit'
import { downloadBlob, makePdf } from '../../lib/mini-pdf'
import { useSharedState } from '../../lib/shared-state'
import { cn } from '../../lib/cn'
import { plot } from '../../data/fixtures/report'
import { lawyer, reviewDocs, reviewFindings, type Decision, type SentBack, type SignedOff } from '../../data/fixtures/lawyer'

const DECLARATION = 'I have reviewed the documents and findings listed for this record. In my professional judgement the documents are consistent, and I sign off this file. I understand my name and the sign-off date will be recorded on the record.'

/** GP-14 · Lawyer review and sign-off. Sign-off enables once the box is ticked and every finding is decided. */
type Entry = { d: Decision; note: string }
const INITIAL: Record<string, Entry> = Object.fromEntries(reviewFindings.map((f) => [f.id, { d: f.initial, note: f.comment ?? '' }]))

export default function LawyerReview() {
  const navigate = useNavigate()
  const [state, setState] = useDemoState(['review', 'declared'] as const)
  const [declaredP, setDeclaredP] = useSharedState('lawyer.declared', false)
  const [entries, setEntries] = useSharedState<Record<string, Entry>>('lawyer.decisions', INITIAL)
  const [signed, setSigned] = useSharedState<SignedOff | null>('lawyer.signedOff', null)
  const [, setSentBack] = useSharedState<SentBack | null>('lawyer.sentBack', null)
  const [hint, setHint] = useState('')
  const declared = state === 'declared' || declaredP
  const get = (id: string): Entry => entries[id] ?? { d: null, note: '' }
  // A comment only counts as a decision once it says something.
  const isDecided = (id: string) => { const e = get(id); return e.d === 'comment' ? !!e.note.trim() : !!e.d }
  const decided = reviewFindings.filter((f) => isDecided(f.id)).length
  const canSign = declared && decided === reviewFindings.length && !signed
  const who = lawyer.name
  const choose = (id: string, d: Exclude<Decision, null>) => {
    setHint('')
    const cur = get(id)
    const next: Decision = cur.d === d && (d !== 'comment' || !cur.note.trim()) ? null : d
    setEntries((p) => ({ ...p, [id]: { d: next, note: p[id]?.note ?? '' } }))
    const f = reviewFindings.find((x) => x.id === id)
    logAudit(who, next ? `${next === 'accept' ? 'Accepted' : next === 'reject' ? 'Rejected' : 'Started a comment on'} finding ${f?.title ?? id}` : `Cleared the decision on finding ${f?.title ?? id}`)
  }
  const setNote = (id: string, note: string) => setEntries((p) => ({ ...p, [id]: { d: p[id]?.d ?? 'comment', note } }))
  const toggleDeclared = (on: boolean) => { setDeclaredP(on); if (state === 'declared' && !on) setState('review'); logAudit(who, on ? 'Ticked the sign-off declaration' : 'Cleared the sign-off declaration') }
  const download = () => {
    downloadBlob(makePdf([
      'REALDHA - File review', plot.title, `Record ${plot.recordId}`, `Owner: ${plot.owner}`, '',
      ...reviewFindings.flatMap((f) => [`${f.title}: ${get(f.id).d ?? 'undecided'}`, `   ${f.detail}`, ...(get(f.id).note.trim() ? [`   Comment: ${get(f.id).note.trim()}`] : [])]),
      '', 'Documents: ' + reviewDocs.map((d) => d.name).join(', '),
    ]), `${plot.recordId}-file-review.pdf`)
    logAudit(who, 'Downloaded the file review report')
  }
  const showDocs = () => { const el = document.getElementById('file-docs'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.focus() }
  const signOff = () => {
    if (!canSign) return
    const rec = { recordId: plot.recordId, by: who, at: Date.now() }
    setSigned(rec)
    setSentBack(null)
    logAudit(who, `Signed off ${plot.recordId}`)
    navigate(path('GP-15'))
  }
  const sendBack = () => {
    const comments = reviewFindings.filter((f) => get(f.id).d === 'comment' && get(f.id).note.trim()).map((f) => `${f.title}: ${get(f.id).note.trim()}`)
    const rejected = reviewFindings.filter((f) => get(f.id).d === 'reject').map((f) => `${f.title}: rejected`)
    if (!comments.length && !rejected.length) { setHint('Add a comment or reject a finding before sending the file back.'); return }
    setSentBack({ recordId: plot.recordId, by: who, at: Date.now(), comments: [...comments, ...rejected] })
    setSigned(null)
    logAudit(who, `Sent ${plot.recordId} back to the owner with ${comments.length + rejected.length} comment(s)`)
    navigate(path('F06-01'))
  }
  const btn = 'min-h-11 md:min-h-0'

  return (
    <Screen id="GP-14" role="lawyer">
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-[18px] md:px-12 md:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to={path('GP-13')} className="inline-flex min-h-11 items-center text-chip text-muted no-underline md:min-h-0">← Queue</Link>
            <h1 className="text-h2 md:mt-0.5 md:mb-1.5 md:text-h1">{plot.title}</h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <RecordId id={plot.recordId} />
              <Pill tone="brand">Lawyer review</Pill>
              <span className="text-label text-muted">Owner: {plot.owner} · KYC verified</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button size="sm" variant="secondary" className={btn} onClick={showDocs}>Open documents</Button>
            <Button size="sm" variant="secondary" className={btn} onClick={download}>Download report</Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-col gap-3.5 xl:flex-1">
            <h2 className="text-h3">Findings · {decided} of {reviewFindings.length} decided</h2>
            {reviewFindings.map((f) => {
              const d = get(f.id).d
              const commented = d === 'comment'
              return (
                <Card key={f.id} className={cn('flex flex-col gap-2.5 px-5 py-[18px]', commented && 'border-warning')}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-body font-semibold">{f.title}</h3>
                    {commented
                      ? <Pill tone="warning" icon={<MessageSquare className="size-4" />}>Commented</Pill>
                      : <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Resolved by owner</Pill>}
                  </div>
                  <div className="text-label text-muted">{f.detail}</div>
                  {f.original && (
                    <div className="rounded-control border border-line bg-canvas px-3 py-2.5 text-small leading-[22px]">
                      <span lang="mr">{f.original}</span> <span className="ml-2 text-label text-muted">{f.translation}</span>
                    </div>
                  )}
                  <div role="group" aria-label={`Decision for finding ${f.id}`} className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className={cn(btn, d === 'accept' ? 'border-success bg-success text-on-status hover:border-success hover:bg-success' : '')} variant={d === 'accept' ? 'primary' : 'secondary'} aria-pressed={d === 'accept'} onClick={() => choose(f.id, 'accept')}>{d === 'accept' ? '✓ ' : ''}Accept</Button>
                    <Button size="sm" className={cn(btn, d === 'reject' ? 'border-danger bg-danger text-on-status hover:border-danger hover:bg-danger' : '')} variant={d === 'reject' ? 'primary' : 'secondary'} aria-pressed={d === 'reject'} onClick={() => choose(f.id, 'reject')}>{d === 'reject' ? '✗ ' : ''}Reject</Button>
                    <Button size="sm" className={cn(btn, commented && 'border-warning bg-warning-tint text-warning-ink hover:bg-warning-tint')} variant="secondary" aria-pressed={commented} onClick={() => choose(f.id, 'comment')}>{commented ? '● Comment added' : 'Comment'}</Button>
                  </div>
                  {commented && (
                    <label className="block">
                      <span className="sr-only">Comment on finding {f.id}</span>
                      <textarea value={get(f.id).note} onChange={(e) => setNote(f.id, e.target.value)} onBlur={() => get(f.id).note.trim() && logAudit(who, `Commented on finding ${f.title}`)} rows={2} className="w-full rounded-control border border-line-strong bg-field px-3 py-2 text-chip text-text" />
                    </label>
                  )}
                </Card>
              )
            })}
          </div>

          <div className="flex flex-col gap-3.5 xl:w-[440px] xl:flex-none">
            <Card id="file-docs" tabIndex={-1} className="flex flex-col gap-2.5 px-5 py-[18px]">
              <h2 className="text-body leading-6 font-semibold">Documents in this file</h2>
              <ul className="flex flex-col gap-2 text-small">
                {reviewDocs.map((d) => (
                  <li key={d.name} className="flex justify-between gap-3"><span>{d.name}</span><span lang="mr" className="text-label text-muted">{d.meta}</span></li>
                ))}
              </ul>
            </Card>
            <Card className="flex flex-col gap-3.5 border-2 border-primary p-5">
              <h2 className="text-h3">Sign-off</h2>
              <label className="flex items-start gap-2.5 text-chip">
                <input type="checkbox" checked={declared} disabled={!!signed} onChange={(e) => toggleDeclared(e.target.checked)} className="mt-0.5 size-5 flex-none accent-primary max-md:size-6" />
                <span>{DECLARATION} <span className="text-label text-muted">[Declaration text: sample, to be replaced by Realdha legal]</span></span>
              </label>
              <div className="text-label text-muted">Signing as {lawyer.name} · Bar Council reg. [sample]</div>
              <Button size="lg" block disabled={!canSign} onClick={signOff}>{signed ? `Signed off ${dayStamp(signed.at)}` : 'Sign off'}</Button>
              <Button block variant="secondary" onClick={sendBack} className={btn}>Send back with comments</Button>
              <div role="status" className="text-label text-muted">{hint || (signed ? 'This file is signed off. Send it back to reopen it.' : '"Sign off" activates once the box is ticked and every finding is accepted, rejected or commented.')}</div>
            </Card>
            <AuditTrail className="px-5 py-[18px]" />
          </div>
        </div>
      </div>
    </Screen>
  )
}
