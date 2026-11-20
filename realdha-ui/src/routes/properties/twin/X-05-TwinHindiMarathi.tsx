import { Link2, ShieldCheck } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePrefs } from '../../../app/prefs'
import { useDemoState } from '../../../app/useDemoState'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { RecordId } from '../../../components/ui/record-id'
import { TWIN_COPY, type TwinCopy } from '../../../data/fixtures/x-flow'
import { copyText } from '../../../lib/twin-store'
import { useState } from 'react'

const ACTION_TO = [path('F07-01'), path('GP-17'), path('GP-18'), path('GP-19')]

function Panel({ c }: { c: TwinCopy }) {
  const [note, setNote] = useState('')
  const share = async () => {
    const ok = await copyText(`${location.origin}${path('F07-01')}?record=RA-LON-004-P-112-2`)
    setNote(ok ? '✓' : '!')
    setTimeout(() => setNote(''), 1800)
  }
  return (
    <Card lang={c.lang} className="flex flex-col gap-3.5 p-5 max-xl:hidden xl:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <RecordId id="RA-LON-004-P-112-2" copyable />
        <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>{c.chip}</Pill>
      </div>
      <h2 className="text-h1 leading-[1.7] xl:text-[32px] xl:tracking-[-0.02em]">{c.title}</h2>
      <p className="text-small leading-[1.7] text-muted">{c.place}</p>
      <dl className="grid grid-cols-2 gap-4 border-b border-line pb-4">
        {c.facts.map((f) => (
          <div key={f.k}><dt className="text-label leading-[1.7] text-muted">{f.k}</dt><dd className="text-body font-semibold leading-[1.7]">{f.v}</dd></div>
        ))}
      </dl>
      <h3 className="text-small font-semibold leading-[1.7]">{c.docsTitle}</h3>
      <ul>
        {c.docs.map((d) => (
          <li key={d.n} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
            <span className="text-small leading-[1.7]">{d.n}</span><span className="font-mono text-label text-chain-ink">{d.h}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5 border-t border-line pt-4">
        {c.actions.map((a, i) => (
          <Button key={a} size="sm" variant="secondary" className="leading-[1.7]" {...(i === 0 ? { onClick: () => void share(), icon: <Link2 className="size-4" aria-hidden /> } : { to: ACTION_TO[i] })}>{a}</Button>
        ))}
        <span role="status" aria-live="polite" className="flex items-center text-chip font-medium text-success-ink">{note}</span>
      </div>
      <p className="text-chip leading-[1.7] text-muted">{c.note}</p>
    </Card>
  )
}

function AptPanel({ c, showLabel }: { c: TwinCopy; showLabel: boolean }) {
  const [note, setNote] = useState('')
  const share = async () => {
    setNote((await copyText(`${location.origin}${path('F07-01')}?record=RA-PUN-001-A-18-04`)) ? '✓' : '!')
    setTimeout(() => setNote(''), 1800)
  }
  return (
    <section className="flex flex-col gap-2.5 xl:hidden" aria-label={c.tabLabel}>
      {showLabel && <div lang={c.lang} className="text-label font-semibold tracking-[0.06em] text-muted uppercase">{c.tabLabel}</div>}
      <Card lang={c.lang} className="flex flex-col gap-3 p-4">
        <div><RecordId id="RA-PUN-001-A-18-04" copyable /></div>
        <h2 className="text-h2 leading-[1.7]">{c.apt.title}</h2>
        <p className="text-small leading-[1.7]">{c.apt.lines.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</p>
        <Button variant="secondary" block className="h-12 leading-[1.7]" onClick={() => void share()}>{c.apt.share}</Button>
        <span role="status" aria-live="polite" className="text-chip font-medium text-success-ink">{note}</span>
      </Card>
    </section>
  )
}

/** X-05 · Digital Twin key sections in Hindi and Marathi. Language follows the header switch (usePrefs); ?state=hindi|marathi forces it. */
export default function TwinHindiMarathi() {
  const { lang } = usePrefs()
  const [state] = useDemoState(['auto', 'hindi', 'marathi'] as const)
  const shown: ('hi' | 'mr')[] = state === 'hindi' ? ['hi'] : state === 'marathi' ? ['mr'] : lang === 'hi' ? ['hi'] : lang === 'mr' ? ['mr'] : ['hi', 'mr']
  const both = shown.length === 2
  return (
    <Screen id="X-05" back={path('F03-03')} title="A-1804">
      <div className="flex flex-1 flex-col gap-4 p-4 xl:px-12 xl:py-8">
        <div className={both ? 'grid gap-6 xl:grid-cols-2' : 'grid gap-6 xl:mx-auto xl:w-full xl:max-w-[658px]'}>
          {shown.map((l) => (
            <div key={l} className="flex flex-col gap-2.5 max-xl:hidden">
              {both && <div lang={l} className="text-label font-semibold tracking-[0.06em] text-muted uppercase">{TWIN_COPY[l].tabLabel}</div>}
              <Panel c={TWIN_COPY[l]} />
            </div>
          ))}
          {shown.map((l) => <AptPanel key={l} c={TWIN_COPY[l]} showLabel={both} />)}
        </div>
        <p className="text-small text-muted xl:hidden">Sample data. The land register remains the legal record.</p>
      </div>
    </Screen>
  )
}
