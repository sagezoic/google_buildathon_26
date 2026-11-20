import { AlertCircle, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { writeShared } from '../lib/shared-state'
import { AuthCard, AuthInput, Notice } from '../components/ui/auth-parts'
import { Button } from '../components/ui/button'
import { AUTH_KEYS, SAMPLE_LOGIN, emailError, findAccount, hashPw, startSession, type Account } from '../lib/auth-store'
import { logAudit } from '../lib/audit'

const GoogleG = () => <span aria-hidden className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-muted text-label font-semibold">G</span>

/** F01-01 · Sign in. Real checks against the demo account store (`auth.accounts`). */
export default function SignIn() {
  const nav = useNavigate()
  const [email, setEmail] = usePersistentState('auth.signin.email', '')
  const [pw, setPw] = useState('')
  const [errs, setErrs] = useState<{ email?: string; pw?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errs = {}
    const ee = emailError(email)
    if (ee) next.email = ee
    if (!pw) next.pw = 'Enter your password.'
    setErrs(next)
    if (next.email || next.pw) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      const acc: Account | undefined = findAccount(email)
      if (!acc) return setErrs({ form: 'We could not find an account with this email. Check the spelling or create an account.' })
      if (acc.method === 'google' && !acc.pw) return setErrs({ form: 'This account was created with Google. Use Sign in with Google instead.' })
      if (acc.pw !== hashPw(pw)) return setErrs({ pw: 'That password is not right. Try again or reset it.' })
      if (!acc.verified) {
        writeShared(AUTH_KEYS.verify, { email: acc.email, sentAt: Date.now(), status: 'sent' }, null)
        return nav(path('F01-03'))
      }
      startSession(acc)
      logAudit(acc.name, 'Signed in')
      nav(path('X-01'))
    }, 500)
  }

  const methods = (
    <div className="flex flex-col gap-3 max-xl:order-1 xl:order-3">
      <Button size="lg" block variant="secondary" to={path('GP-02')} icon={<Smartphone className="size-[18px]" aria-hidden />}>Sign in with phone</Button>
      <Button size="lg" block variant="secondary" to={path('F01-05')} icon={<GoogleG />}>Sign in with Google</Button>
    </div>
  )

  return (
    <Screen id="F01-01" layout="auth">
      <AuthCard>
        <h1 className="text-h1 font-semibold max-xl:order-0">Sign in</h1>
        {methods}
        <div className="flex items-center gap-3 text-label text-muted max-xl:order-2 xl:order-2" role="separator">
          <span className="h-px flex-1 bg-line" /><span className="xl:hidden">or with email</span><span className="max-xl:hidden">or</span><span className="h-px flex-1 bg-line" />
        </div>
        <form noValidate onSubmit={submit} className="flex flex-col gap-4 max-xl:order-3 xl:order-1">
          {errs.form && <Notice tone="danger" icon={<AlertCircle className="size-[18px]" />}>{errs.form}</Notice>}
          <AuthInput label="Email" type="email" autoComplete="email" inputMode="email" placeholder={SAMPLE_LOGIN.email} value={email} error={errs.email} onChange={(e) => { setEmail(e.target.value); setErrs({}) }} />
          <div>
            <AuthInput label="Password" secret autoComplete="current-password" placeholder="Your password" value={pw} error={errs.pw} onChange={(e) => { setPw(e.target.value); setErrs({}) }} aside={<Link to={path('F01-04')} className="text-label font-medium max-xl:hidden">Forgot password?</Link>} />
            <Link to={path('F01-04')} className="mt-1 inline-flex min-h-11 items-center text-small font-medium xl:hidden">Forgot password?</Link>
          </div>
          <Button type="submit" size="lg" block loading={busy}>Sign in</Button>
          <p className="text-label text-muted">Sample account for this prototype: <span className="font-mono font-medium text-text">{SAMPLE_LOGIN.email}</span> with password <span className="font-mono font-medium text-text">{SAMPLE_LOGIN.password}</span></p>
        </form>
        <p className="text-center text-small text-muted max-xl:order-4 xl:order-4">
          <span className="xl:hidden">New here? </span><span className="max-xl:hidden">New to Realdha? </span>
          <Link to={path('GP-01')} className="font-medium"><span className="xl:hidden">Sign up</span><span className="max-xl:hidden">Create an account</span></Link>
        </p>
      </AuthCard>
    </Screen>
  )
}
