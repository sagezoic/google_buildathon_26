import { AlertTriangle, Check, CheckCircle2, Clock, X, XCircle } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../../app/persist'
import { K, KYC_MAX_ATTEMPTS, KYC_PENDING_MS, maskPan, panError, type KycStatus } from '../../lib/identity-flow'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { prakash } from '../../data/fixtures/identity'
import { cn } from '../../lib/cn'

const STATES = ['verified', 'pending', 'failed'] as const
type State = (typeof STATES)[number]

/** GP-05 · KYC result. Desktop: icon card. Phone and tablet: tinted status banner. */
export default function KYCResult() {
  const [params] = useSearchParams()
  const forcedParam = params.get('state') as State | null
  const forced = forcedParam && STATES.includes(forcedParam) ? forcedParam : null
  const [saved, setSaved] = usePersistentState<KycStatus>(K.kycStatus, 'none')
  const [pan] = usePersistentState(K.pan, prakash.pan)
  const [consentDate] = usePersistentState(K.kycConsentDate, prakash.consentDate)
  const [attempts] = usePersistentState(K.kycAttempts, 0)
  const [checkedAt] = usePersistentState(K.kycCheckedAt, 0)
  const [, setName] = usePersistentState(K.name, '')
  const state: State = forced ?? (saved === 'none' ? 'verified' : saved)
  // A pending check finishes on its own after a short wait.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (forced || saved !== 'pending') return
    const t = setTimeout(() => { setSaved('verified'); setName(prakash.firstName); setTick((n) => n + 1) }, Math.max(0, checkedAt + KYC_PENDING_MS - Date.now()))
    return () => clearTimeout(t)
  }, [forced, saved, checkedAt, setSaved, setName])
  const left = Math.max(0, KYC_MAX_ATTEMPTS - (forced === 'failed' ? 1 : attempts))
  const shownPan = panError(pan) ? prakash.pan : pan
  const v: Record<State, { banner: string; icon: ReactNode; ic: ReactNode; title: string; word: string; pill: ReactNode; d: string; m: string; mt: string }> = {
    verified: {
      banner: 'border-success bg-success-tint text-success-ink', icon: <CheckCircle2 className="size-5" />, ic: <Check className="size-7" />,
      title: 'Identity verified', word: 'Verified',
      pill: <Pill tone="success" icon={<Check className="size-3.5" />}>KYC verified</Pill>,
      d: `PAN ${maskPan(shownPan)} matched. DigiLocker consent recorded on ${consentDate || prakash.consentDate}.`, m: 'PAN and Aadhaar match. You can add properties.', mt: '',
    },
    pending: {
      banner: 'border-demo-line bg-warning-tint text-warning-ink', icon: <AlertTriangle className="size-5" />, ic: <Clock className="size-7" />,
      title: 'Checking your details', word: 'Pending',
      pill: <Pill tone="warning" icon={<Clock className="size-3.5" />}>Pending</Pill>,
      d: "This usually takes under 2 minutes. You can leave this page; we'll notify you when it's done.", m: 'DigiLocker is still checking. Usually 2 minutes.', mt: '',
    },
    failed: {
      banner: 'border-danger bg-danger-tint text-danger-ink', icon: <XCircle className="size-5" />, ic: <X className="size-7" />,
      title: "We couldn't verify you", word: 'Failed',
      pill: <Pill tone="danger" icon={<X className="size-3.5" />}>Failed</Pill>,
      d: `The name on your PAN does not match your DigiLocker record. Check the PAN and try again. ${left > 0 ? `${left} attempt${left === 1 ? '' : 's'} left today.` : 'No attempts left today.'}`, m: 'Name on PAN does not match Aadhaar.', mt: '',
    },
  }
  const s = v[state]
  const tone = { verified: 'bg-success-tint text-success-ink', pending: 'bg-warning-tint text-warning-ink', failed: 'bg-danger-tint text-danger-ink' }[state]
  const failed = state === 'failed'
  if (!forced && saved === 'none') return <Navigate to={path('GP-04')} replace />
  return (
    <Screen id="GP-05" layout="auth" noTabs>
      <div className="flex flex-1 items-start justify-center px-4 pt-4 pb-8 xl:items-center xl:pt-0">
        <div className="flex w-full max-w-[440px] flex-col gap-3.5" aria-live="polite">
          {/* phone / tablet */}
          <div className={cn('flex flex-col gap-1 rounded-[8px] border p-3.5 xl:hidden', s.banner)}>
            <div className="flex items-center gap-2.5 text-h3"><span aria-hidden>{s.icon}</span>{s.word}</div>
            <p className="pl-[30px] text-small">{s.m}</p>
          </div>
          {/* desktop */}
          <div className="flex flex-col items-start gap-3.5 rounded-card border border-line bg-surface p-6 shadow-e1 max-xl:hidden">
            <div aria-hidden className={cn('flex size-14 items-center justify-center rounded-full', tone)}>{s.ic}</div>
            <h1 className="text-h2">{s.title}</h1>
            {s.pill}
            <p className="text-small text-muted">{s.d}</p>
          </div>
          <Button size="lg" block variant={state === 'pending' ? 'secondary' : 'primary'} to={failed ? path('GP-04') : path('GP-06')} disabled={failed && left === 0}>
            {failed ? 'Try again' : state === 'pending' ? 'Continue to home' : 'Go to home'}
          </Button>
          {failed && <a href={path('GP-06')} className="inline-flex min-h-11 items-center justify-center text-small font-medium max-xl:hidden">Do this later</a>}
        </div>
      </div>
    </Screen>
  )
}
