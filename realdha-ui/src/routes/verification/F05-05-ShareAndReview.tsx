import { AlertCircle, CheckCircle2, Check, Copy, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { useDemoState } from '../../app/useDemoState'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'
import { REVIEW_PLANS } from '../../data/fixtures/f05-check'
import { useCheckReport, useCheckState } from '../../lib/check-store'
import { logAudit } from '../../lib/audit'
import { cn } from '../../lib/cn'
import { downloadBlob, makePdf } from '../../lib/mini-pdf'

interface Share { email: string; includeDocs: boolean }
interface Review { plan: 'standard' | 'priority'; note: string; sent: boolean }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const label = 'mb-1.5 block text-chip font-semibold'
const inputCls = 'w-full rounded-control border bg-field px-3 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]'

/** F05-05 · Share or download the check report, and request a lawyer review. `?state=share|review` shows one panel. */
export default function ShareAndReview() {
  const [mode] = useDemoState(['both', 'share', 'review'] as const)
  const navigate = useNavigate()
  const [check] = useCheckState()
  const [share, setShare] = usePersistentState<Share>('f05.share', { email: '', includeDocs: false })
  const [review, setReview] = usePersistentState<Review>('f05.review', { plan: 'standard', note: '', sent: false })
  const [emailError, setEmailError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [copied, setCopied] = useState(false)
  const { report } = useCheckReport(check.verdict ?? 'stop')
  const back = path((report?.verdict ?? check.verdict) === 'proceed' ? 'F05-04' : 'F05-03')
  const id = report?.checkId.split('#')[1] ?? 'report'

  const download = () => {
    if (!report) return
    const lines = [
      'REALDHA - Document check report', report.title, report.checkId, report.sample ? 'Sample data' : '', '',
      `Verdict: ${report.verdict === 'stop' ? 'STOP' : 'PROCEED'} - ${report.headline}`,
      `High ${report.counts.high} · Medium ${report.counts.medium} · Clear ${report.counts.clear}`, '',
      ...report.findings.flatMap((f, i) => [`${i + 1}. ${f.title} [${f.sev}]`, `   ${f.body}`, `   ${f.quote} (${f.source})`, '']),
      report.footer,
    ]
    downloadBlob(makePdf(lines), `${id}-document-check.pdf`)
    logAudit('You', `Downloaded document check report ${id}`)
  }
  const copy = () => {
    void navigator.clipboard?.writeText(`${window.location.origin}${back}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  const sendEmail = () => {
    if (!EMAIL.test(share.email.trim())) { setSentTo(''); return setEmailError(share.email.trim() ? 'Enter an email address like name@example.com.' : 'Enter an email address to send the report.') }
    setEmailError('')
    setSentTo(share.email.trim())
    logAudit('You', `Emailed document check report ${id}${share.includeDocs ? ' with documents' : ''}`)
  }
  const sendReview = () => {
    setReview((r) => ({ ...r, sent: true }))
    logAudit('You', `Requested ${review.plan} lawyer review for ${id}`)
  }
  const plan = REVIEW_PLANS.find((p) => p.id === review.plan) ?? REVIEW_PLANS[0]

  const panelA = (
    <Card className="flex w-full flex-col gap-4 p-4 shadow-e3 md:w-[560px] md:gap-[18px] md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Share or download</h2>
        <Link to={back} aria-label="Close" className="-mr-2 inline-flex size-11 items-center justify-center rounded-control text-muted hover:bg-primary-tint md:size-9"><X className="size-[18px]" aria-hidden /></Link>
      </div>
      <div className="flex flex-col gap-2.5 md:flex-row">
        <Button variant="secondary" size="lg" className="flex-1 md:h-control" onClick={download}>Download PDF</Button>
        <Button variant="secondary" size="lg" className="flex-1 md:h-control" onClick={copy} icon={copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}>{copied ? 'Link copied' : 'Copy link'}</Button>
      </div>
      <hr className="border-line" />
      <div>
        <label htmlFor="f05-email" className={label}>Email the report</label>
        <div className="flex gap-2.5">
          <input
            id="f05-email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={share.email}
            aria-invalid={emailError ? true : undefined} aria-describedby={emailError ? 'f05-email-err' : undefined}
            onChange={(e) => { setShare((s) => ({ ...s, email: e.target.value })); setEmailError(''); setSentTo('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') sendEmail() }}
            className={cn(inputCls, 'h-12 md:h-control', emailError ? 'border-danger' : 'border-line-strong')}
          />
          <Button variant="secondary" size="lg" className="md:h-control" onClick={sendEmail}>Send</Button>
        </div>
        {emailError && <p id="f05-email-err" className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5" aria-hidden />{emailError}</p>}
        <p role="status" className="empty:hidden">{sentTo && <span className="mt-1.5 flex items-center gap-1.5 text-label text-success-ink"><CheckCircle2 className="size-3.5" aria-hidden />Report sent to {sentTo}</span>}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div id="f05-incl" className="text-small font-semibold">Include uploaded documents</div>
          <div className="text-chip text-muted max-md:hidden">{share.includeDocs ? 'On: the recipient sees the documents too' : 'Off: the recipient sees the findings only'}</div>
        </div>
        <Switch checked={share.includeDocs} onChange={(v) => setShare((s) => ({ ...s, includeDocs: v }))} aria-labelledby="f05-incl" />
      </div>
      <p className="text-chip text-muted max-md:hidden">Reports carry a "Not legally reviewed" label until a lawyer signs off.</p>
    </Card>
  )

  const panelB = (
    <Card className="flex w-full flex-col gap-4 p-4 md:w-[560px] md:gap-[18px] md:p-6">
      <h2 className="text-h2">Request lawyer review</h2>
      <p className="text-small text-muted max-md:hidden">A verified lawyer reads your documents and the findings, then signs off or sends back questions.</p>
      <div role="radiogroup" aria-label="Review plan" className="flex flex-col gap-2.5">
        {REVIEW_PLANS.map((p) => {
          const on = p.id === review.plan
          return (
            <button
              key={p.id} type="button" role="radio" aria-checked={on} disabled={review.sent}
              onClick={() => setReview((r) => ({ ...r, plan: p.id }))}
              className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-control text-left max-md:p-3 md:px-4 md:py-3.5', on ? 'border-2 border-primary bg-primary-tint max-md:p-[11px] md:py-[13px] md:pl-[15px]' : 'border border-line-strong bg-surface hover:bg-primary-tint')}
            >
              <span>
                <span className="block text-control font-semibold">{p.label}</span>
                <span className="block text-chip text-muted"><span className="md:hidden">{p.replyM} · {p.price} (sample)</span><span className="max-md:hidden">{p.reply}</span></span>
              </span>
              <span className="font-semibold max-md:hidden">{p.price} <span className="text-chip font-normal text-muted">sample</span></span>
            </button>
          )
        })}
      </div>
      <div>
        <label htmlFor="f05-note" className={label}>Note to the lawyer<span className="max-md:hidden"> (optional)</span></label>
        <textarea
          id="f05-note" rows={3} maxLength={400} placeholder="Heir release is my main worry." value={review.note} disabled={review.sent}
          onChange={(e) => setReview((r) => ({ ...r, note: e.target.value }))}
          className={cn(inputCls, 'min-h-[72px] border-line-strong py-3 md:min-h-[76px]')}
        />
      </div>
      <p role="status" className="empty:hidden">{review.sent && <span className="flex items-center gap-1.5 text-chip text-success-ink"><CheckCircle2 className="size-4" aria-hidden />{plan.label} requested. {plan.reply}.</span>}</p>
      <div className="flex flex-col gap-2.5 md:flex-row md:justify-end">
        <Button variant="secondary" className="max-md:hidden" onClick={() => navigate(back)}>{review.sent ? 'Back to report' : 'Cancel'}</Button>
        <Button size="lg" className="md:h-control" disabled={review.sent} onClick={sendReview}>{review.sent ? 'Sent for review' : 'Send for review'}</Button>
      </div>
    </Card>
  )

  return (
    <Screen id="F05-05" back={back} title="Share">
      <div className="flex flex-1 flex-col items-center gap-4 bg-canvas px-4 py-4 md:flex-row md:items-start md:justify-center md:gap-7 md:px-12 md:py-7 max-xl:md:flex-col max-xl:md:items-center">
        {mode !== 'review' && panelA}
        {mode !== 'share' && panelB}
      </div>
    </Screen>
  )
}
