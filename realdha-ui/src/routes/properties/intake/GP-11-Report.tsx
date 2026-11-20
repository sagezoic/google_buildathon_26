import { CheckCircle2, Download, TriangleAlert, XCircle } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { RecordId, SampleData } from '../../../components/ui/record-id'
import { VerdictBanner } from '../../../components/ui/verdict-banner'
import { cn } from '../../../lib/cn'
import { logAudit } from '../../../lib/audit'
import { downloadBlob, makePdf } from '../../../lib/mini-pdf'
import { useOwnerResolutions } from '../../../lib/owner-resolutions'
import { useSharedState } from '../../../lib/shared-state'
import { clearChecks, counts, findings, plot, type Finding, type Quote, type Severity } from '../../../data/fixtures/report'

type Lang = 'both' | 'en' | 'mr'
const LANGS: { id: Lang; full: string; short: string }[] = [
  { id: 'both', full: 'Original + English', short: 'Original + EN' },
  { id: 'en', full: 'English only', short: 'EN' },
  { id: 'mr', full: 'मराठी', short: 'मराठी' },
]

const SEV = {
  high: { tone: 'danger', label: 'High', Icon: XCircle },
  medium: { tone: 'warning', label: 'Medium', Icon: TriangleAlert },
  clear: { tone: 'success', label: 'Clear', Icon: CheckCircle2 },
} as const

function SeverityPill({ s }: { s: Severity }) {
  const { tone, label, Icon } = SEV[s]
  return <Pill tone={tone} icon={<Icon className="size-4" />}>{label}</Pill>
}

function QuoteBox({ quote, lang }: { quote: Quote; lang: Lang }) {
  const lines = quote.lines.filter((l) => lang === 'both' || l.lang === lang)
  if (!lines.length) return null
  return (
    <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3">
      {lines.map((l) => (
        <div key={l.lang + l.text} className="flex items-baseline gap-2">
          <span className="inline-flex flex-none rounded-control border border-line-strong bg-primary-tint px-2 text-label font-medium text-on-primary-tint">{l.lang === 'mr' ? 'मराठी' : 'EN'}</span>
          <span lang={l.lang === 'mr' ? 'mr' : undefined} className={l.lang === 'mr' ? 'text-control md:leading-[26px]' : 'text-chip md:text-small'}>{l.text}</span>
        </div>
      ))}
      <div className="text-label text-muted">{quote.source}</div>
    </div>
  )
}

function FindingCard({ f, lang, resolved }: { f: Finding; lang: Lang; resolved?: boolean }) {
  return (
    <Card className="flex flex-col gap-2.5 p-3.5 md:gap-3 md:p-5">
      <div className="flex items-start justify-between gap-2 md:items-center">
        <h3 className="text-body leading-[22px] font-semibold md:text-h3">
          <span className="md:hidden">{f.titleM}</span>
          <span className="max-md:hidden">{f.title}</span>
        </h3>
        {resolved
          ? <Pill tone="success" icon={<CheckCircle2 className="size-4" />}>Resolved</Pill>
          : <SeverityPill s={f.severity} />}
      </div>
      <p className="text-small text-muted md:hidden">{f.bodyM}</p>
      {f.body && <p className="text-small text-muted max-md:hidden">{f.body}</p>}
      {f.compare && (
        <dl className="flex gap-7 max-md:hidden">
          {f.compare.map((c) => (
            <div key={c.label}>
              <dt className="text-label text-muted">{c.label}</dt>
              <dd className="text-body font-semibold">{c.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex flex-col gap-2 md:hidden">{f.quotesM.map((q) => <QuoteBox key={q.source} quote={q} lang={lang} />)}</div>
      <div className="flex flex-col gap-3 max-md:hidden">{f.quotes.map((q) => <QuoteBox key={q.source} quote={q} lang={lang} />)}</div>
    </Card>
  )
}

/** GP-11 · Verification report, Clarify verdict. */
export default function Report() {
  const [lang, setLang] = useSharedState<Lang>('report.lang', 'both')
  const done = useOwnerResolutions()
  const open = findings.filter((f) => !done[f.id])
  const n = { high: open.filter((f) => f.severity === 'high').length, medium: open.filter((f) => f.severity === 'medium').length }
  const clear = counts.clear + findings.length - open.length
  const allResolved = open.length === 0
  const download = () => {
    const lines = [
      'REALDHA - Verification report', `${plot.title}`, `Record ${plot.recordId}`, 'Sample data', '',
      allResolved ? 'Verdict: Proceed - all findings resolved by the owner' : `Verdict: Clarify - ${open.length} item(s) need an answer`, '',
      ...findings.flatMap((f) => [`${f.id}. ${f.title} [${done[f.id] ? 'Resolved' : SEV[f.severity].label}]`, ...(f.body ? [`   ${f.body}`] : [`   ${f.bodyM}`]), ...(f.compare ?? []).map((c) => `   ${c.label}: ${c.value}`), '']),
      `5 other checks are clear: ${clearChecks}`, '',
      "AI-assisted report from the uploaded documents. A lawyer's sign-off is what makes a record \"Signed off\". This is not legal advice.",
    ]
    downloadBlob(makePdf(lines), `${plot.recordId}-verification-report.pdf`)
    logAudit(plot.owner, 'Downloaded the verification report (PDF)')
  }
  return (
    <Screen id="GP-11">
      <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
        <div className="flex w-full max-w-[960px] flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase md:text-label">Verification report</div>
              <h1 className="text-h2 md:text-h1">
                <span className="md:hidden">{plot.titleM}</span>
                <span className="max-md:hidden">{plot.title}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2.5">
                <RecordId id={`${plot.recordId} · pending`} className="text-muted" />
                <SampleData />
              </div>
            </div>
            <div className="flex flex-col gap-2.5 md:items-end">
              <div role="radiogroup" aria-label="Report language" className="flex self-start overflow-hidden rounded-control border border-line-strong bg-surface text-chip">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={lang === l.id}
                    lang={l.id === 'mr' ? 'mr' : undefined}
                    onClick={() => setLang(l.id)}
                    className={cn('min-h-11 cursor-pointer px-3 md:min-h-0 md:py-1.5', lang === l.id ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}
                  >
                    <span className="md:hidden">{l.short}</span>
                    <span className="max-md:hidden">{l.full}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5 max-md:hidden">
                <Button variant="secondary" onClick={download} icon={<Download className="size-4" aria-hidden />}>Download PDF</Button>
                <Button to={path('GP-12')}>Send to lawyer</Button>
              </div>
            </div>
          </div>

          <VerdictBanner
            tone={allResolved ? 'proceed' : 'clarify'}
            title={allResolved ? 'Proceed' : 'Clarify'}
            aside={
              <dl className="flex gap-4 text-chip max-md:hidden">
                <div className="flex flex-col text-center"><dt className="order-last">High</dt><dd className="text-h2 font-semibold text-danger-ink">{n.high}</dd></div>
                <div className="flex flex-col text-center"><dt className="order-last">Medium</dt><dd className="text-h2 font-semibold text-warning-ink">{n.medium}</dd></div>
                <div className="flex flex-col text-center"><dt className="order-last">Clear</dt><dd className="text-h2 font-semibold text-success-ink">{clear}</dd></div>
              </dl>
            }
          >
            {allResolved ? (
              <span>All items are resolved. The report is ready to send to a lawyer.</span>
            ) : (
              <>
                <span className="md:hidden">{open.length} {open.length === 1 ? 'item needs' : 'items need'} your answer before a lawyer can sign off.</span>
                <span className="max-md:hidden">{open.length} {open.length === 1 ? 'item needs' : 'items need'} your answer before a lawyer can sign off. Nothing here stops the purchase of this record, but each one can delay approval.</span>
              </>
            )}
          </VerdictBanner>

          <h2 className="text-h3 max-md:hidden">Findings</h2>
          {findings.map((f) => <FindingCard key={f.id} f={f} lang={lang} resolved={!!done[f.id]} />)}

          <Card className="flex items-center justify-between gap-3 px-5 py-4 max-md:hidden">
            <div>
              <div className="text-control font-semibold">5 other checks are clear</div>
              <div className="text-chip leading-[18px] text-muted">{clearChecks}</div>
            </div>
            <SeverityPill s="clear" />
          </Card>

          <p className="text-label leading-[18px] text-muted max-md:hidden">AI-assisted report from the uploaded documents. A lawyer's sign-off is what makes a record "Signed off". This is not legal advice.</p>

          <div className="flex flex-col gap-2.5 md:hidden">
            <Button size="lg" block variant="secondary" onClick={download} icon={<Download className="size-4" aria-hidden />}>Download PDF</Button>
            <Button size="lg" block to={path('GP-12')}>Send to lawyer</Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}
