import { CheckCircle2, Loader2, TriangleAlert, XCircle } from 'lucide-react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { SampleData } from '../../components/ui/record-id'
import { VerdictBanner } from '../../components/ui/verdict-banner'
import { type CheckFinding, type Sev } from '../../data/fixtures/f05-check'
import { useCheckReport } from '../../lib/check-store'

const SEV = {
  high: { tone: 'danger', label: 'High', Icon: XCircle },
  medium: { tone: 'warning', label: 'Medium', Icon: TriangleAlert },
  clear: { tone: 'success', label: 'Clear', Icon: CheckCircle2 },
} as const

function SevPill({ s }: { s: Sev }) {
  const { tone, label, Icon } = SEV[s]
  return <Pill tone={tone} icon={<Icon className="size-4" />}>{label}</Pill>
}

function Finding({ f }: { f: CheckFinding }) {
  return (
    <Card className="flex flex-col gap-2.5 p-3.5 md:gap-3 md:p-5">
      <div className="flex items-start justify-between gap-2 md:items-center">
        <h3 className="text-body leading-[22px] font-semibold md:text-h3">
          <span className="md:hidden">{f.titleM}</span>
          <span className="max-md:hidden">{f.title}</span>
        </h3>
        <SevPill s={f.sev} />
      </div>
      <p className="text-small text-muted">
        <span className="md:hidden">{f.bodyM}</span>
        <span className="max-md:hidden">{f.body}</span>
      </p>
      <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3">
        {f.quoteOrig && (
          <div className="flex items-baseline gap-2">
            <span className="inline-flex flex-none rounded-control border border-line-strong bg-sunken px-2 text-label font-medium">Original</span>
            <span className="text-label md:text-small">{f.quoteOrig}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="inline-flex flex-none rounded-control border border-line-strong bg-primary-tint px-2 text-label font-medium text-on-primary-tint">EN</span>
          <span className="text-label md:text-small">
            <span className="md:hidden">{f.quoteM}</span>
            <span className="max-md:hidden">{f.quote}</span>
          </span>
        </div>
        <div className="text-label text-muted">{f.source}</div>
      </div>
    </Card>
  )
}

/** F05-03 (STOP) and F05-04 (PROCEED) share this layout. Shows the Gemini report of the last check, or the sample when none has run. */
export function CheckReport({ id, verdict: fallback }: { id: 'F05-03' | 'F05-04'; verdict: 'stop' | 'proceed' }) {
  const { report: r, loading, error } = useCheckReport(fallback)
  const toShare = `${path('F05-05')}?state=share`
  const toReview = `${path('F05-05')}?state=review`
  if (!r) {
    return (
      <Screen id={id} back={path('F05-01')} title="Report">
        <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
          <Card className="flex w-full max-w-[960px] flex-col gap-3 p-6">
            {loading || !error
              ? <p role="status" className="flex items-center gap-2 text-small text-muted"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />Loading your report…</p>
              : <>
                  <p role="alert" className="flex items-start gap-2 text-small text-danger-ink"><TriangleAlert className="mt-0.5 size-4 flex-none" aria-hidden />{error}</p>
                  <Button variant="secondary" to={path('F05-01')} className="self-start">Back to the documents</Button>
                </>}
          </Card>
        </div>
      </Screen>
    )
  }
  const verdict = r.verdict
  return (
    <Screen id={id} back={path('F05-02')} title="Report">
      <div className="flex flex-1 justify-center px-4 py-4 md:px-12 md:py-7">
        <div className="flex w-full max-w-[960px] flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-overline font-semibold tracking-[0.06em] text-muted uppercase md:text-label">Document check report</div>
              <h1 className="text-h2 md:text-h1">
                <span className="md:hidden">{r.titleM}</span>
                <span className="max-md:hidden">{r.title}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-control border border-line bg-sunken px-2 py-1 font-mono text-label font-medium md:text-small">
                  <span className="md:hidden">{r.idM}</span>
                  <span className="max-md:hidden">{r.checkId}</span>
                </span>
                {r.sample && <SampleData />}
              </div>
            </div>
            <div className="flex gap-2.5 max-md:hidden">
              <Button variant="secondary" to={toShare}>Download PDF</Button>
              <Button to={toReview}>Request lawyer review</Button>
            </div>
          </div>

          <VerdictBanner
            tone={verdict}
            title={verdict === 'stop' ? 'STOP' : 'PROCEED'}
            aside={<Counts c={r.counts} className="max-md:hidden" />}
          >
            <span className="md:hidden">{r.headlineM}</span>
            <span className="max-md:hidden">{r.headline}</span>
          </VerdictBanner>
          <Counts c={r.counts} className="justify-around md:hidden" mobile />

          {r.note && (
            <Card className="flex items-start gap-3.5 border-warning bg-warning-tint p-3 md:p-5">
              <TriangleAlert className="mt-0.5 size-5 flex-none text-warning-ink" aria-hidden />
              <div>
                <div className="text-small font-semibold md:text-control">{r.note.title}</div>
                <div className="text-chip text-text md:text-small">
                  <span className="md:hidden">{r.note.bodyM}</span>
                  <span className="max-md:hidden">{r.note.body}</span>
                </div>
              </div>
            </Card>
          )}

          <h2 className="text-h3 max-md:hidden">Findings</h2>
          {r.findings.map((f) => <Finding key={f.title} f={f} />)}

          <p className="text-label leading-[18px] text-muted">
            <span className="md:hidden">{r.footerM}</span>
            <span className="max-md:hidden">{r.footer}</span>
          </p>

          <div className="flex flex-col gap-2.5 md:hidden">
            <Button size="lg" block variant="secondary" to={toShare}>Download PDF</Button>
            <Button size="lg" block to={toReview}>Request lawyer review</Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}

function Counts({ c, className, mobile }: { c: { high: number; medium: number; clear: number }; className?: string; mobile?: boolean }) {
  const items = [['High', c.high, 'text-danger-ink'], ['Medium', c.medium, 'text-warning-ink'], ['Clear', c.clear, 'text-success-ink']] as const
  return (
    <dl className={`flex gap-4 text-chip ${className ?? ''}`}>
      {items.map(([k, n, tone]) => (
        <div key={k} className="flex flex-col text-center">
          <dt className={`order-last ${mobile ? 'text-label text-muted' : ''}`}>{k}</dt>
          <dd className={`${mobile ? 'text-h3' : 'text-h2'} font-semibold ${tone}`}>{n}</dd>
        </div>
      ))}
    </dl>
  )
}
