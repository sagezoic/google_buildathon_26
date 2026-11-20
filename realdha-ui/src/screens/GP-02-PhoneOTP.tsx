import { AlertCircle, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { Button } from '../components/ui/button'
import { OtpInput } from '../components/ui/otp-input'
import { prakash } from '../data/fixtures/identity'
import { DEMO_CODE, K, OTP_MAX_ATTEMPTS, OTP_RESEND_MS, OTP_TTL_MS, fmtMmSs, formatPhone, phoneError } from '../lib/identity-flow'

type Phase = 'phone' | 'otp' | 'expired'
/** `?state=` views drawn in the frame; they show seeded values until the first real interaction. */
const FORCED: Record<string, { phase: Phase; code: string; wrong: boolean; left: number }> = {
  phone: { phase: 'phone', code: '', wrong: false, left: 0 },
  otp: { phase: 'otp', code: '482', wrong: false, left: 24 },
  wrong: { phase: 'otp', code: '482910', wrong: true, left: 9 },
  expired: { phase: 'expired', code: '', wrong: false, left: 0 },
}
const D = ({ d, m }: { d: string; m: string }) => (<><span className="xl:hidden">{m}</span><span className="max-xl:hidden">{d}</span></>)

/** GP-02 · Phone sign-up: enter number, enter code, wrong code, expired code. Real checks against a demo code. */
export default function PhoneOTP() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [forced, setForced] = useState<(typeof FORCED)[string] | null>(() => FORCED[params.get('state') ?? ''] ?? null)
  const [phone, setPhone] = usePersistentState(K.phone, '')
  const [phase, setPhase] = usePersistentState<Phase>(K.otpPhase, 'phone')
  const [sentAt, setSentAt] = usePersistentState(K.otpSentAt, 0)
  const [attempts, setAttempts] = usePersistentState(K.otpAttempts, 0)
  const [, setVerified] = usePersistentState(K.phoneVerified, false)
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const [phoneErr, setPhoneErr] = useState('')
  const [busy, setBusy] = useState<'send' | 'verify' | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const live = forced === null
  const expiredNow = phase === 'otp' && now - sentAt > OTP_TTL_MS
  const view: Phase = forced ? forced.phase : phase === 'otp' && (expiredNow || attempts >= OTP_MAX_ATTEMPTS) ? 'expired' : phase
  const showWrong = forced ? forced.wrong : wrong
  const value = forced ? forced.code : code
  const left = forced ? forced.left * 1000 : OTP_RESEND_MS - (now - sentAt)
  const attemptsLeft = forced ? 2 : OTP_MAX_ATTEMPTS - attempts
  const full = value.length === 6
  const sentTo = <>+91 {phone || <D d={prakash.phoneDesktop} m={prakash.phoneMobile} />}</>

  const release = () => { setForced(null); setWrong(false); setCode('') }
  const goto = (p: Phase) => { release(); setPhase(p) }
  const send = () => {
    const err = phoneError(phone)
    setPhoneErr(err)
    if (err) return
    setBusy('send')
    setTimeout(() => {
      release(); setSentAt(Date.now()); setNow(Date.now()); setAttempts(0); setPhase('otp'); setBusy(null)
    }, 600)
  }
  const resend = () => { release(); setSentAt(Date.now()); setNow(Date.now()); setAttempts(0); setPhase('otp') }
  const verify = () => {
    if (!full || busy) return
    setBusy('verify')
    setTimeout(() => {
      setBusy(null)
      if (value === DEMO_CODE && live) {
        setVerified(true); setAttempts(0); setPhase('phone'); setSentAt(0)
        nav(path('GP-03'))
        return
      }
      const used = (live ? attempts : 1) + 1
      setForced(null)
      setAttempts(used)
      if (used >= OTP_MAX_ATTEMPTS) { setPhase('expired'); setWrong(false); setCode('') } else { setWrong(true); setCode('') }
    }, 500)
  }

  return (
    <Screen id="GP-02" layout="auth" noTabs>
      <div className="flex flex-1 items-start justify-center px-4 pt-6 md:items-center md:pt-0">
        <div className="flex w-full max-w-[440px] flex-col gap-3.5 md:rounded-card md:border md:border-line md:bg-surface md:p-6 md:shadow-e1" aria-live="polite">
          {view === 'phone' && (
            <>
              <h1 className="text-h2"><span className="xl:hidden">Verify your phone</span><span className="max-xl:hidden">Enter your mobile number</span></h1>
              <p className="text-small text-muted">We'll send a 6-digit code by SMS.</p>
              <div className="flex flex-col">
                <label htmlFor="mobile" className="mb-1.5 block text-chip font-semibold">Mobile number</label>
                <div className="flex gap-2">
                  <span className="flex h-12 w-[72px] flex-none items-center justify-center rounded-control border border-line-strong bg-sunken font-medium">+91</span>
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={prakash.phoneDesktop}
                    value={phone}
                    onChange={(e) => { setPhone(formatPhone(e.target.value)); if (phoneErr) setPhoneErr('') }}
                    onBlur={() => phone && setPhoneErr(phoneError(phone))}
                    aria-invalid={phoneErr ? true : undefined}
                    aria-describedby={phoneErr ? 'mobile-err' : undefined}
                    className={`h-12 min-w-0 flex-1 rounded-control border ${phoneErr ? 'border-danger' : 'border-line-strong'} bg-field px-3 font-mono text-control font-medium text-text outline-none placeholder:text-muted focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]`}
                  />
                </div>
                {phoneErr && <p id="mobile-err" role="alert" className="mt-1.5 flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5 flex-none" aria-hidden />{phoneErr}</p>}
              </div>
              <Button size="lg" block loading={busy === 'send'} onClick={send}>Send code</Button>
              <Link to={path('F01-02')} className="text-center text-small font-medium">Use email instead</Link>
            </>
          )}

          {view === 'otp' && (
            <>
              <h1 className="text-h2">Enter the 6-digit code</h1>
              <p className="text-small text-muted">
                {!showWrong ? <><span className="max-xl:hidden">Sent to {sentTo}. </span><span className="xl:hidden">Code sent to {sentTo}</span></> : <>Sent to {sentTo}.</>}
                {!showWrong && <> <button type="button" onClick={() => goto('phone')} className="cursor-pointer text-brand underline">Change number</button></>}
              </p>
              <OtpInput value={value} onChange={(v) => { if (forced) setForced(null); setWrong(false); setCode(v) }} error={showWrong} describedBy={showWrong ? 'otp-err' : undefined} />
              {showWrong && (
                <p id="otp-err" role="alert" className="flex items-start gap-1.5 text-chip font-medium text-danger-ink">
                  <AlertCircle className="mt-0.5 size-4 flex-none" aria-hidden />
                  <D d={`That code is not right. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`} m={`That code is wrong. ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left.`} />
                </p>
              )}
              <p className="text-label text-muted">Sample code for this prototype: <span className="font-mono font-medium text-text">{DEMO_CODE}</span></p>
              <Button size="lg" block loading={busy === 'verify'} onClick={verify} disabled={!full}>Verify</Button>
              <p className="text-center text-small text-muted">
                {left > 0 ? <><span className="xl:hidden">Resend in </span><span className="max-xl:hidden">Resend code in </span></> : <button type="button" onClick={resend} className="inline-flex min-h-11 cursor-pointer items-center font-medium text-brand underline">Resend code</button>}
                {left > 0 && <b className="font-semibold text-text">{fmtMmSs(left)}</b>}
              </p>
            </>
          )}

          {view === 'expired' && (
            <>
              <h1 className="text-h2"><span className="xl:hidden">Verify your phone</span><span className="max-xl:hidden">That code has expired</span></h1>
              <div role="alert" className="flex gap-2.5 rounded-[8px] border border-demo-line bg-warning-tint px-3.5 py-3 text-small text-warning-ink">
                <AlertTriangle className="mt-0.5 size-[18px] flex-none" aria-hidden />
                <span><span className="xl:hidden">This code expired.</span><span className="max-xl:hidden">Codes work for 5 minutes. Request a new one to continue.</span></span>
              </div>
              <OtpInput value="" onChange={() => {}} disabled />
              <Button size="lg" block onClick={resend} disabled={phoneError(phone) !== '' && !forced}>Send a new code</Button>
              <button type="button" onClick={() => goto('phone')} className="min-h-11 cursor-pointer text-center text-small font-medium text-brand">Change number</button>
            </>
          )}
        </div>
      </div>
    </Screen>
  )
}
