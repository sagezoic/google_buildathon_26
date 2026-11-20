import { Check, Circle, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { Pill } from '../../components/ui/pill'
import { prakash } from '../../data/fixtures/identity'
import { useSession } from '../../lib/auth-store'
import { K, KYC_MAX_ATTEMPTS, KYC_PENDING_MS, kycOutcome, maskPan, type KycStatus } from '../../lib/identity-flow'
import { cn } from '../../lib/cn'

const FORCED: Record<string, KycStatus> = { verified: 'verified', pending: 'pending', failed: 'failed', notstarted: 'none' }
const TAB = 'inline-flex min-h-11 items-center border-b-[3px] px-3 text-small no-underline'

/** F02-03 · Profile with KYC status card. Reads identity.* keys; `?state=verified|pending|failed|notstarted` forces a drawn state. */
export default function KYCProfile() {
  const [params] = useSearchParams()
  const forced = FORCED[params.get('state') ?? ''] ?? null
  const session = useSession()
  const [status, setStatus] = usePersistentState<KycStatus>(K.kycStatus, 'none')
  const [pan] = usePersistentState(K.pan, prakash.pan)
  const [attempts] = usePersistentState(K.kycAttempts, 0)
  const [checkedAt] = usePersistentState(K.kycCheckedAt, 0)
  const [consent] = usePersistentState(K.kycConsentDate, '')
  const [idName] = usePersistentState(K.name, '')
  const [phone] = usePersistentState(K.phone, '')
  const [details, setDetails] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const view: KycStatus = forced ?? status
  const left = forced === 'failed' ? 2 : Math.max(0, KYC_MAX_ATTEMPTS - attempts)
  const consentOn = forced ? prakash.consentDate : consent || prakash.consentDate
  const panShown = forced ? prakash.panMasked : maskPan(pan)

  const refresh = () => {
    setBusy(true); setNote('')
    setTimeout(() => {
      setBusy(false)
      if (!forced && checkedAt && Date.now() - checkedAt >= KYC_PENDING_MS) { setStatus(kycOutcome(pan)); return }
      setNote('Still checking. This usually takes under 2 minutes, we will notify you.')
    }, 700)
  }

  const card = {
    verified: { cap: 'A · Verified', border: 'border-success', pill: <Pill tone="success" icon={<Check className="size-3.5" />}>KYC verified</Pill>, h: 'Identity verified', p: <>PAN {panShown} · DigiLocker consent on {consentOn}.</>, pm: <>Verified on {consentOn}</>, act: <Button variant="secondary" onClick={() => setDetails(true)}>View details</Button> },
    pending: { cap: 'B · Pending', border: 'border-warning', pill: <Pill tone="warning" icon={<Circle className="size-2 fill-current" />}>Pending</Pill>, h: 'Checking your details', p: <>Usually under 2 minutes. We'll notify you.</>, pm: null, act: <Button variant="secondary" loading={busy} onClick={refresh}>Refresh status</Button> },
    failed: { cap: 'C · Failed', border: 'border-danger', pill: <Pill tone="danger" icon={<X className="size-3.5" />}>Failed</Pill>, h: "We couldn't verify you", p: <>Name on PAN does not match DigiLocker. {left} attempt{left === 1 ? '' : 's'} left today.</>, pm: null, act: <Button to={path('GP-04')} disabled={left === 0}>Try again</Button> },
    none: { cap: 'D · Not started', border: 'border-line', pill: <Pill tone="neutral">Not started</Pill>, h: 'Verify your identity', p: <>Needed to sign off, anchor and tokenise.</>, pm: null, act: <Button to={path('GP-04')}>Start KYC</Button> },
  }[view]

  const rows: [string, string][] = [
    ['Name', idName || session?.name || prakash.firstName + ' Kulkarni'],
    ['Email', session?.email ?? 'prakash@example.com'],
    ['Mobile', `+91 ${phone || prakash.phoneDesktop}`],
  ]

  return (
    <Screen id="F02-03">
      <div className="flex flex-col gap-5 p-4 md:px-12 md:py-6">
        <nav aria-label="Profile sections" className="flex gap-2 border-b border-line max-xl:hidden">
          <Link to={path('F02-03')} aria-current="page" className={cn(TAB, 'border-primary font-semibold text-brand')}>Profile</Link>
          <Link to={path('X-02')} className={cn(TAB, 'border-transparent text-muted hover:text-text')}>Notifications</Link>
          <Link to={path('X-03')} className={cn(TAB, 'border-transparent text-muted hover:text-text')}>Security</Link>
        </nav>
        <h1 className="text-h1 font-semibold">Profile</h1>
        <div className="grid items-start gap-4 xl:grid-cols-[1fr_1.4fr]">
          <section className="rounded-card border border-line bg-surface p-5 shadow-e1 max-xl:hidden">
            <h2 className="mb-2 text-label font-semibold tracking-[0.06em] text-muted uppercase">Your details</h2>
            <dl>
              {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-b-0"><dt className="text-muted">{k}</dt><dd className="min-w-0 truncate">{v}</dd></div>)}
            </dl>
          </section>
          <section aria-live="polite" className={cn('rounded-card border bg-surface p-5 shadow-e1', card.border)}>
            <h2 className="mb-2 text-label font-semibold tracking-[0.06em] text-muted uppercase"><span className="xl:hidden">KYC</span><span className="max-xl:hidden">KYC status · {card.cap}</span></h2>
            <div className="mb-2">{card.pill}</div>
            <p className="font-semibold max-xl:hidden">{card.h}</p>
            <p className="mt-1.5 mb-3.5 text-small text-muted"><span className="max-xl:hidden">{card.p}</span>{card.pm && <span className="xl:hidden">{card.pm}</span>}</p>
            {note && <p role="status" className="mb-3 text-small text-warning-ink">{note}</p>}
            {card.act}
          </section>
        </div>
      </div>
      <Modal open={details} onOpenChange={setDetails} title="KYC details">
        <dl className="text-small">
          {[['PAN', panShown], ['DigiLocker consent', consentOn], ['Status', 'Identity verified']].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line py-2 last:border-b-0"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </Modal>
    </Screen>
  )
}
