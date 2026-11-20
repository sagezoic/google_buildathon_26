import { CheckCircle2, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { AuthCard, AuthInput, PasswordStrength } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { AUTH_KEYS, endSession, emailError, findAccount, hashPw, normEmail, pwError, saveAccount } from '../../lib/auth-store'
import { logAudit } from '../../lib/audit'
import { fmtMmSs } from '../../lib/identity-flow'
import { useSharedState, writeShared } from '../../lib/shared-state'

type Step = 'request' | 'sent' | 'reset' | 'done'
interface Reset { step: Step; email: string; sentAt: number }
const STEPS: Step[] = ['request', 'sent', 'reset', 'done']
const INIT: Reset = { step: 'request', email: '', sentAt: 0 }
const RESEND_MS = 60 * 1000

/** F01-04 · Forgot password: request, link sent, set new password, success. Updates the stored account for real. */
export default function ForgotPassword() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const forcedRaw = params.get('state') as Step | null
  const forced = forcedRaw && STEPS.includes(forcedRaw) ? forcedRaw : null
  const [r] = useSharedState<Reset>(AUTH_KEYS.reset, INIT)
  const put = (next: Partial<Reset>) => { writeShared<Reset>(AUTH_KEYS.reset, (p) => ({ ...p, ...next }), INIT); if (forced) nav(path('F01-04'), { replace: true }) }
  const step = forced ?? r.step
  const [email, setEmail] = useState(r.email)
  const [emailErr, setEmailErr] = useState('')
  const [pw, setPw] = useState(forced === 'reset' ? 'Prakash#2026x' : '')
  const [pw2, setPw2] = useState('')
  const [errs, setErrs] = useState<{ pw?: string; pw2?: string }>({})
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const shown = r.email || 'prakash@example.com'
  const left = forced === 'sent' ? 38_000 : RESEND_MS - (now - r.sentAt)

  const request = (e: FormEvent) => {
    e.preventDefault()
    const err = emailError(email)
    setEmailErr(err)
    if (err) return
    setBusy(true)
    setTimeout(() => { setBusy(false); put({ step: 'sent', email: normEmail(email), sentAt: Date.now() }) }, 600)
  }
  const update = (e: FormEvent) => {
    e.preventDefault()
    const next = { pw: pwError(pw), pw2: !pw2 ? 'Confirm your new password.' : pw2 !== pw ? 'The two passwords do not match.' : '' }
    setErrs(next)
    if (next.pw || next.pw2) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      const acc = findAccount(r.email)
      if (acc) { saveAccount({ ...acc, pw: hashPw(pw), verified: true }); logAudit(acc.name, 'Reset password') }
      endSession() // other devices are signed out too
      put({ step: 'done' })
    }, 600)
  }

  return (
    <Screen id="F01-04" layout="auth">
      <AuthCard>
        <div aria-live="polite" className="flex flex-col gap-4">
          {step === 'request' && (
            <form noValidate onSubmit={request} className="flex flex-col gap-4">
              <h1 className="text-h2">Forgot your password?</h1>
              <p className="text-small text-muted max-xl:hidden">Enter your email and we'll send a reset link.</p>
              <AuthInput label="Email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} error={emailErr} onChange={(e) => { setEmail(e.target.value); setEmailErr('') }} />
              <Button type="submit" size="lg" block loading={busy}>Send reset link</Button>
              <Link to={path('F01-01')} className="min-h-11 text-center text-small font-medium max-xl:leading-[44px]">Back to sign in</Link>
            </form>
          )}
          {step === 'sent' && (
            <>
              <div aria-hidden className="flex size-12 items-center justify-center rounded-full bg-primary-tint text-on-primary-tint"><Mail className="size-6" /></div>
              <h1 className="text-h2"><span className="xl:hidden">Link sent</span><span className="max-xl:hidden">Check your email</span></h1>
              <p className="text-small text-muted"><span className="xl:hidden">Check {shown}.</span><span className="max-xl:hidden">If an account exists for {shown}, a reset link is on its way. It works for 1 hour.</span></p>
              <p className="text-label text-muted">Sample link for this prototype: <button type="button" onClick={() => put({ step: 'reset' })} className="cursor-pointer font-medium text-brand underline">Open the reset link</button></p>
              <Button size="lg" block variant="secondary" disabled={left > 0} onClick={() => put({ sentAt: Date.now() })}>Resend link</Button>
              {left > 0 && <p className="text-center text-small text-muted">Resend in <b className="font-semibold text-text">{fmtMmSs(left)}</b></p>}
              <button type="button" onClick={() => put({ step: 'request' })} className="min-h-11 cursor-pointer text-center text-small font-medium text-brand">Use a different email</button>
            </>
          )}
          {step === 'reset' && (
            <form noValidate onSubmit={update} className="flex flex-col gap-4">
              <h1 className="text-h2">Set a new password</h1>
              <div>
                <AuthInput label="New password" secret autoComplete="new-password" value={pw} error={errs.pw} onChange={(e) => { setPw(e.target.value); setErrs({}) }} />
                <PasswordStrength value={pw} />
              </div>
              <AuthInput label="Confirm password" secret autoComplete="new-password" value={pw2} error={errs.pw2} onChange={(e) => { setPw2(e.target.value); setErrs({}) }} />
              <Button type="submit" size="lg" block loading={busy}>Update password</Button>
            </form>
          )}
          {step === 'done' && (
            <>
              <div aria-hidden className="flex size-12 items-center justify-center rounded-full bg-success-tint text-success-ink"><CheckCircle2 className="size-6" /></div>
              <h1 className="text-h2">Password updated</h1>
              <p className="text-small text-muted"><span className="xl:hidden">Sign in with your new password.</span><span className="max-xl:hidden">You can now sign in with your new password. Other devices have been signed out.</span></p>
              <Button size="lg" block onClick={() => { writeShared<Reset>(AUTH_KEYS.reset, INIT, INIT); nav(path('F01-01')) }}>Sign in</Button>
            </>
          )}
        </div>
      </AuthCard>
    </Screen>
  )
}
