import { AlertCircle, Check, CircleDashed, FileText, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useActiveRole } from '../../app/active-role'
import { JOURNEYS, type JourneyRole } from '../../app/journeys'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { OnboardSteps } from '../../components/onboard-steps'
import { AuthCard, AuthInput, Notice } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { OtpInput } from '../../components/ui/otp-input'
import { DIGILOCKER_DOCS, SAMPLE_AADHAAR, type IssuedDoc } from '../../data/fixtures/digilocker'
import { logAudit } from '../../lib/audit'
import { cn } from '../../lib/cn'
import { DEMO_CODE, OTP_MAX_ATTEMPTS } from '../../lib/identity-flow'
import { finishOnboarding, readFetched, saveFetched, useIntent, type FetchedDoc } from '../../lib/onboard-intent'

type Phase = 'connect' | 'otp' | 'consent' | 'fetching' | 'done'
const FETCH_MS = 700

const formatAadhaar = (raw: string) => raw.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ')
const aadhaarError = (v: string) => {
  const d = v.replace(/\D/g, '')
  if (!d) return 'Enter your Aadhaar number.'
  if (d.length !== 12) return 'Aadhaar is 12 digits.'
  if (/^[01]/.test(d)) return 'Aadhaar numbers do not start with 0 or 1.'
  return ''
}
const maskAadhaar = (v: string) => `XXXX XXXX ${v.replace(/\D/g, '').slice(-4)}`

/** F02-04 · DigiLocker documents. Connect with Aadhaar + OTP, consent per document, fetch, then continue to the persona's journey. */
export default function DigiLockerDocs() {
  const nav = useNavigate()
  const intent = useIntent()
  const [active] = useActiveRole()
  const role: JourneyRole = intent ?? active
  const issued = DIGILOCKER_DOCS[role]

  const existing = readFetched(role)
  const [phase, setPhase] = useState<Phase>(existing.length ? 'done' : 'connect')
  const [aadhaar, setAadhaar] = usePersistentState('digilocker.aadhaar', '')
  const [aErr, setAErr] = useState('')
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [busy, setBusy] = useState(false)
  const [picked, setPicked] = useState<string[]>(() => issued.map((d) => d.id))
  const [pickErr, setPickErr] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fetched, setFetched] = useState<FetchedDoc[]>(existing)

  const queue = useMemo(() => issued.filter((d) => picked.includes(d.id)), [issued, picked])

  // Fetch one document at a time so each row visibly moves from queued to fetched.
  useEffect(() => {
    if (phase !== 'fetching' || progress >= queue.length) return
    const t = setTimeout(() => {
      const d = queue[progress]
      const next = [...fetched, { id: d.id, name: d.name, issuer: d.issuer, uri: d.uri, at: Date.now() }]
      setFetched(next)
      setProgress(progress + 1)
      if (next.length === queue.length) {
        saveFetched(role, next)
        logAudit(JOURNEYS[role].name, `Fetched ${next.length} documents from DigiLocker`)
        setPhase('done')
      }
    }, FETCH_MS)
    return () => clearTimeout(t)
  }, [phase, progress, queue, fetched, role])

  const sendOtp = () => {
    const e = aadhaarError(aadhaar)
    setAErr(e)
    if (e) return
    setBusy(true)
    setTimeout(() => { setBusy(false); setCode(''); setWrong(false); setAttempts(0); setPhase('otp') }, 600)
  }
  const verifyOtp = () => {
    if (code.length !== 6 || busy) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (code === DEMO_CODE) { setPhase('consent'); return }
      const used = attempts + 1
      setAttempts(used)
      setCode('')
      setWrong(true)
      if (used >= OTP_MAX_ATTEMPTS) { setPhase('connect'); setAErr('Too many wrong codes. Request a new one.') }
    }, 500)
  }
  const startFetch = () => {
    if (!queue.length) return setPickErr(true)
    setFetched([])
    setProgress(0)
    setPhase('fetching')
  }
  const toggle = (d: IssuedDoc) => {
    if (d.required) return
    setPickErr(false)
    setPicked((p) => (p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id]))
  }
  const proceed = () => nav(intent ? finishOnboarding(intent) : JOURNEYS[role].home)
  const refetch = () => { setFetched([]); setProgress(0); setPicked(issued.map((d) => d.id)); setPhase('consent') }

  return (
    <Screen id="F02-04" layout="auth" noTabs>
      <AuthCard wide>
        <OnboardSteps step="docs" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h2 xl:text-h1">
            {phase === 'done' ? 'Documents fetched from DigiLocker' : 'Fetch your documents from DigiLocker'}
          </h1>
          <p className="text-small text-muted">
            {phase === 'done'
              ? 'These come straight from the issuing department, so they count as originals. No uploads needed.'
              : 'Government-issued copies arrive signed by the issuer, so Realdha can trust them without a scan.'}
          </p>
        </div>

        {phase === 'connect' && (
          <>
            <AuthInput
              label="Aadhaar number"
              inputMode="numeric"
              autoComplete="off"
              mono
              placeholder={SAMPLE_AADHAAR}
              value={aadhaar}
              error={aErr}
              help="DigiLocker sends a code to the mobile linked with this Aadhaar."
              onChange={(e) => { setAadhaar(formatAadhaar(e.target.value)); setAErr('') }}
            />
            <Button size="lg" block loading={busy} onClick={sendOtp} icon={<ShieldCheck className="size-[18px]" aria-hidden />}>Connect DigiLocker</Button>
            <Button type="button" size="sm" variant="secondary" className="self-start" onClick={() => { setAadhaar(SAMPLE_AADHAAR); setAErr('') }}>Use sample Aadhaar</Button>
          </>
        )}

        {phase === 'otp' && (
          <>
            <p className="text-small text-muted">
              Enter the 6-digit code DigiLocker sent for Aadhaar <span className="font-mono font-medium text-text">{maskAadhaar(aadhaar)}</span>.{' '}
              <button type="button" onClick={() => setPhase('connect')} className="cursor-pointer text-brand underline">Change</button>
            </p>
            <OtpInput label="DigiLocker code" value={code} onChange={(v) => { setWrong(false); setCode(v) }} error={wrong} describedBy={wrong ? 'dl-otp-err' : undefined} />
            {wrong && (
              <p id="dl-otp-err" role="alert" className="flex items-center gap-1.5 text-chip font-medium text-danger-ink">
                <AlertCircle className="size-4 flex-none" aria-hidden />That code is not right. {OTP_MAX_ATTEMPTS - attempts} left.
              </p>
            )}
            <p className="text-label text-muted">Sample code for this prototype: <span className="font-mono font-medium text-text">{DEMO_CODE}</span></p>
            <Button size="lg" block loading={busy} disabled={code.length !== 6} onClick={verifyOtp}>Verify and continue</Button>
          </>
        )}

        {phase === 'consent' && (
          <>
            <p className="text-chip font-semibold">Realdha is asking to read these documents</p>
            <ul className="flex flex-col gap-2">
              {issued.map((d) => {
                const on = picked.includes(d.id)
                return (
                  <li key={d.id}>
                    <label className={cn('flex items-start gap-3 rounded-card border p-3.5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus', on ? 'border-primary bg-primary-tint' : 'border-line-strong bg-surface', d.required ? 'cursor-default' : 'cursor-pointer')}>
                      <input type="checkbox" checked={on} disabled={d.required} onChange={() => toggle(d)} className="peer sr-only" />
                      <span aria-hidden className={cn('mt-0.5 flex size-[18px] flex-none items-center justify-center rounded-[4px] border', on ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-field')}>{on && <Check className="size-3.5" />}</span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-control font-semibold">{d.name}{d.required && <span className="ml-2 text-label font-medium text-muted">Required</span>}</span>
                        <span className="text-label text-muted">{d.issuer} · {d.why}</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {pickErr && <p role="alert" className="text-label text-danger-ink">Pick at least one document.</p>}
            <p className="flex items-start gap-2 text-label text-muted">
              <Lock className="mt-0.5 size-3.5 flex-none" aria-hidden />
              Access lasts 30 days and you can revoke it in DigiLocker or in Settings. Only document fingerprints go on-chain, never the documents or your Aadhaar number.
            </p>
            <Button size="lg" block onClick={startFetch}>Allow and fetch {queue.length} document{queue.length === 1 ? '' : 's'}</Button>
          </>
        )}

        {(phase === 'fetching' || phase === 'done') && (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line" aria-live="polite">
            {(phase === 'done' ? fetched : queue).map((d, i) => {
              const state = phase === 'done' || i < progress ? 'done' : i === progress ? 'active' : 'queued'
              const got = fetched.find((f) => f.id === d.id)
              return (
                <li key={d.id} className="flex items-start gap-3 p-3.5">
                  <span aria-hidden className={cn('mt-0.5 flex size-7 flex-none items-center justify-center rounded-full', state === 'done' ? 'bg-success-tint text-success-ink' : 'bg-sunken text-muted')}>
                    {state === 'done' ? <Check className="size-4" /> : state === 'active' ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <CircleDashed className="size-4" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-control font-semibold"><FileText className="size-4 flex-none text-muted" aria-hidden />{d.name}</span>
                    <span className="text-label text-muted">{d.issuer}</span>
                    {got && <span className="truncate font-mono text-label text-muted" title={got.uri}>{got.uri}</span>}
                  </span>
                  <span className="text-label font-medium whitespace-nowrap text-muted">
                    {state === 'done' ? (got ? new Date(got.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Fetched') : state === 'active' ? 'Fetching…' : 'Queued'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {phase === 'done' && (
          <>
            <Notice tone="success" icon={<ShieldCheck className="size-[18px]" />}>
              {fetched.length} document{fetched.length === 1 ? '' : 's'} saved to your Realdha vault with the issuer's signature.
            </Notice>
            <Button size="lg" block onClick={proceed}>{JOURNEYS[role].cta.replace(/^Start/, 'Continue')}</Button>
            <button type="button" onClick={refetch} className="min-h-11 cursor-pointer text-center text-small font-medium text-brand">Fetch again</button>
          </>
        )}

        {(phase === 'connect' || phase === 'otp' || phase === 'consent') && (
          <button type="button" onClick={proceed} className="min-h-11 cursor-pointer text-center text-small font-medium text-brand">Do this later</button>
        )}
      </AuthCard>
    </Screen>
  )
}
