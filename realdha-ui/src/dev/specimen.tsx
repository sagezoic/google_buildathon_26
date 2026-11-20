// Dev-only token specimen. Rebuilds the artifact's style board (Main) and key C1–C3 parts
// from tokens, so every theme can be compared against the artifact.
// Open /specimen.html?theme=light | ?theme=dark
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, Check, CheckCircle2, Copy, Info, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import '../index.css'
import './specimen.css'

const params = new URLSearchParams(location.search)
const theme = params.get('theme') ?? 'light'
document.documentElement.dataset.theme = theme

function Pill({ tone, icon, children }: { tone: 'success' | 'warning' | 'danger' | 'info' | 'chain'; icon?: ReactNode; children: ReactNode }) {
  const tones = {
    success: 'bg-success-tint text-success-ink',
    warning: 'bg-warning-tint text-warning-ink',
    danger: 'bg-danger-tint text-danger-ink',
    info: 'bg-info-tint text-info-ink',
    chain: 'bg-chain-tint text-chain-ink',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill py-0.5 pr-2.5 ${icon ? 'pl-2' : 'pl-2.5'} text-label font-medium whitespace-nowrap ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  )
}

function RecordId({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-control border border-line bg-sunken py-1 pr-2 pl-3 font-mono text-chip text-text">
      {id}
      <button aria-label="Copy record ID" className="inline-flex size-6 items-center justify-center rounded text-muted hover:bg-primary-tint hover:text-primary-text">
        <Copy size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </span>
  )
}

const btn = 'inline-flex h-control items-center justify-center gap-2 rounded-control border px-5 text-control font-medium whitespace-nowrap transition-colors duration-150'
const B = {
  primary: `${btn} border-primary bg-primary text-on-primary hover:border-primary-hover hover:bg-primary-hover`,
  secondary: `${btn} border-line-strong bg-surface text-primary-text hover:border-primary-text hover:bg-primary-tint`,
  ghost: `${btn} border-transparent bg-transparent text-primary-text hover:bg-primary-tint`,
  danger: `${btn} border-danger bg-danger text-on-status hover:border-danger-hover hover:bg-danger-hover`,
  disabled: `${btn} cursor-not-allowed border-disabled-line bg-disabled-fill text-disabled`,
}

function Verdict({ kind }: { kind: 'stop' | 'clarify' | 'proceed' }) {
  const v = {
    stop: { cls: 'bg-danger-tint text-danger-ink border-danger', icon: <XCircle size={16} aria-hidden />, word: 'Stop' },
    clarify: { cls: 'bg-warning-tint text-warning-ink border-warning', icon: <AlertTriangle size={16} aria-hidden />, word: 'Clarify' },
    proceed: { cls: 'bg-success-tint text-success-ink border-success', icon: <CheckCircle2 size={16} aria-hidden />, word: 'Proceed' },
  }[kind]
  return <span className={`inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-chip font-semibold ${v.cls}`}>{v.icon}{v.word}</span>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  )
}

function Specimen() {
  return (
    <div className="min-h-screen bg-canvas text-text">
      <nav className="flex h-14 items-center gap-7 border-b border-line bg-surface px-gutter">
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-brand">Realdha</span>
        <a className="hidden border-b-[3px] border-primary-text py-[15px] text-small font-semibold text-primary-text no-underline md:block" href="#">My properties</a>
        <a className="hidden border-b-[3px] border-transparent py-[15px] text-small text-text no-underline md:block" href="#">Verify</a>
        <a className="hidden border-b-[3px] border-transparent py-[15px] text-small text-text no-underline md:block" href="#">Market</a>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex overflow-hidden rounded-control border border-line-strong text-label font-medium">
            <span className="bg-primary px-2.5 py-1 text-on-primary">EN</span>
            <span lang="hi" className="px-2.5 py-1">हिं</span>
            <span lang="mr" className="px-2.5 py-1">मरा</span>
          </div>
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-label font-semibold text-on-primary-tint">PK</span>
        </div>
      </nav>

      <main className="mx-auto flex max-w-[1312px] flex-col gap-12 px-gutter py-12">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1">{theme === 'light' ? 'Light · pinned by the artifact' : 'Dark · Graphite'}</h1>
            <p className="max-w-[60ch] text-body text-muted">One permanent record for every property in India.</p>
          </div>
          <Pill tone="info">Sample data</Pill>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
          {/* Sample record card (Main board) */}
          <article className="flex flex-col gap-4 self-start rounded-card border border-line bg-surface p-6 shadow-e1">
            <div className="flex items-center justify-between gap-3">
              <RecordId id="RA-PUN-001-A-18-04" />
              <Pill tone="info">Sample data</Pill>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-h2">A-1804 · 3 BHK apartment</h3>
              <p className="text-small text-muted">Tower A, floor 18 · Pune</p>
            </div>
            <dl className="flex gap-6 text-small">
              {[['Carpet area', '1,180 sq ft'], ['Facing', 'East'], ['View', 'Hill']].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-label text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              <Pill tone="success" icon={<Check size={14} strokeWidth={2} aria-hidden />}>Signed off</Pill>
              <Pill tone="chain" icon={<ShieldCheck size={14} strokeWidth={1.6} aria-hidden />}>Anchored on-chain</Pill>
            </div>
            <div className="flex flex-col gap-1 border-t border-line pt-3 text-label text-muted">
              <div className="flex justify-between"><span className="font-medium">Fingerprint</span><span className="font-mono text-chain-ink">0x9f3a…c21e</span></div>
              <div className="flex justify-between"><span className="font-medium">Network</span><span className="text-chain-ink">Sepolia testnet</span></div>
            </div>
            <div className="flex gap-3">
              <button className={`${B.primary} flex-1`}>Open record</button>
              <button className={B.secondary}>Share</button>
            </div>
          </article>

          <div className="flex flex-col gap-8">
            <Section title="Verdicts and status">
              <div className="flex flex-wrap gap-3"><Verdict kind="stop" /><Verdict kind="clarify" /><Verdict kind="proceed" /></div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="success" icon={<Check size={14} aria-hidden />}>Verified</Pill>
                <Pill tone="warning" icon={<AlertTriangle size={14} aria-hidden />}>Needs clarification</Pill>
                <Pill tone="danger" icon={<XCircle size={14} aria-hidden />}>High severity</Pill>
                <Pill tone="info" icon={<Info size={14} aria-hidden />}>Queued</Pill>
                <Pill tone="chain" icon={<ShieldCheck size={14} aria-hidden />}>Anchored on-chain</Pill>
              </div>
              <div role="alert" className="flex gap-3 rounded-card border border-danger bg-danger-tint p-4 text-danger-ink">
                <XCircle size={20} className="mt-0.5 shrink-0" aria-hidden />
                <div><p className="font-semibold">Stop</p><p className="text-small">One heir has not signed a release. Do not proceed to purchase.</p></div>
              </div>
            </Section>

            <Section title="Buttons">
              <div className="flex flex-wrap gap-3">
                <button className={B.primary}>Continue</button>
                <button className={B.secondary}>Download PDF</button>
                <button className={B.ghost}>Do this later</button>
                <button className={B.danger}>Revoke link</button>
                <button className={B.disabled} disabled>Continue</button>
                <button className={B.primary} aria-busy><Loader2 size={16} className="animate-spin" aria-hidden />Checking…</button>
              </div>
            </Section>

            <Section title="Fields">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-small font-medium">PAN</span>
                  <input className="h-control rounded-control border border-line-strong bg-field px-3 text-control text-text placeholder:text-muted hover:border-line-hover focus-visible:border-primary-text focus-visible:shadow-[0_0_0_3px_var(--rd-focus-halo)] focus-visible:outline-none" placeholder="ABCDE1234F" />
                  <span className="text-label text-muted">As printed on your PAN card.</span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-small font-medium">Mobile number</span>
                  <input aria-invalid className="h-control rounded-control border border-danger bg-field px-3 text-control text-text shadow-[inset_0_0_0_1px_var(--rd-danger)]" defaultValue="98220" />
                  <span className="flex items-center gap-1.5 text-label font-medium text-danger-ink"><XCircle size={14} aria-hidden />Enter a 10-digit mobile number.</span>
                </label>
              </div>
            </Section>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="On-chain proof">
            <div className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6">
              <Pill tone="chain" icon={<ShieldCheck size={14} aria-hidden />}>Anchored on-chain</Pill>
              {[['Document fingerprint (SHA-256)', '0x9f3a…c21e'], ['Transaction hash', '0x5b7d…e904'], ['Network', 'Sepolia testnet'], ['Anchored', '20 Nov 2026, 14:32 IST']].map(([k, v]) => (
                <div key={k} className="flex w-full justify-between gap-4 border-t border-line pt-3 text-small">
                  <span className="text-muted">{k}</span>
                  <span className={k === 'Anchored' ? 'text-right text-text' : k === 'Network' ? 'text-right text-chain-ink' : 'font-mono whitespace-nowrap text-chain-ink'}>{v}</span>
                </div>
              ))}
              <p className="text-label text-muted">Only the fingerprint is public. The document stays private.</p>
            </div>
          </Section>

          <Section title="Hindi and Marathi">
            <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
              <p lang="mr" className="text-h1">सातबारा उतारा</p>
              <p lang="mr">गट क्र. ११२/२, मौजे कुसगाव — क्षेत्र ०.०४१८ हेक्टर</p>
              <p lang="hi">आपकी संपत्ति, एक स्थायी रिकॉर्ड।</p>
              <p lang="mr" className="text-small text-muted">दस्तऐवज तपासले · वकील पुनरावलोकन · साइन-ऑफ पूर्ण</p>
            </div>
          </Section>
        </div>

        <Section title="Table">
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-sunken text-label font-semibold text-muted">
                  {['Record ID', 'Property', 'Status', 'Age', 'Flags'].map((h) => <th key={h} className="border-b border-line px-3 py-2.5">{h}</th>)}
                </tr>
              </thead>
              <tbody className="text-small">
                <tr className="hover:bg-primary-tint/40">
                  <td className="border-b border-line p-3 font-mono">RA-PUN-001-A-18-04</td>
                  <td className="border-b border-line p-3">A-1804 · 3 BHK</td>
                  <td className="border-b border-line p-3"><Pill tone="chain" icon={<ShieldCheck size={14} aria-hidden />}>Anchored on-chain</Pill></td>
                  <td className="border-b border-line p-3">2 d</td>
                  <td className="border-b border-line p-3">0</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">RA-LON-004-P-112-2</td>
                  <td className="p-3">Kusgaon plot 112/2</td>
                  <td className="p-3"><Pill tone="warning" icon={<AlertTriangle size={14} aria-hidden />}>Needs clarification</Pill></td>
                  <td className="p-3">5 d</td>
                  <td className="p-3">3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  )
}

createRoot(document.getElementById('specimen')!).render(<StrictMode><Specimen /></StrictMode>)
