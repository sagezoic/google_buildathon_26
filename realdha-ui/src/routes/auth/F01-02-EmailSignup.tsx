import { Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { AuthCard, AuthInput, PasswordStrength } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { AUTH_KEYS, emailError, findAccount, hashPw, nameError, normEmail, pwError, saveAccount } from '../../lib/auth-store'
import { K } from '../../lib/identity-flow'
import { logAudit } from '../../lib/audit'
import { writeShared } from '../../lib/shared-state'
import { cn } from '../../lib/cn'

/** `?state=` views drawn in the frame: fair (as drawn), met (all rules), error (submitted empty), empty. */
const SEEDS: Record<string, { name: string; email: string; pw: string; terms: boolean; submitted: boolean }> = {
  empty: { name: '', email: '', pw: '', terms: false, submitted: false },
  fair: { name: 'Prakash Kulkarni', email: 'newuser@example.com', pw: 'prakash123', terms: true, submitted: false },
  met: { name: 'Prakash Kulkarni', email: 'newuser@example.com', pw: 'Prakash#2026x', terms: true, submitted: false },
  error: { name: '', email: 'prakash@example', pw: 'short', terms: false, submitted: true },
}

/** F01-02 · Email sign-up. Saves the account to `auth.accounts` and sends the visitor to email verification. */
export default function EmailSignup() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const seed = SEEDS[params.get('state') ?? '']
  const [pName, setPName] = usePersistentState('auth.signup.name', '')
  const [pEmail, setPEmail] = usePersistentState('auth.signup.email', '')
  const [pTerms, setPTerms] = usePersistentState('auth.signup.terms', false)
  const [name, setName] = useState(seed?.name ?? pName)
  const [email, setEmail] = useState(seed?.email ?? pEmail)
  const [pw, setPw] = useState(seed?.pw ?? '')
  const [terms, setTerms] = useState(seed?.terms ?? pTerms)
  const [submitted, setSubmitted] = useState(seed?.submitted ?? false)
  const [busy, setBusy] = useState(false)
  const [doc, setDoc] = useState<'Terms' | 'Privacy Policy' | null>(null)
  const [, setMethod] = usePersistentState<string>(K.signupMethod, '')

  const errs = {
    name: nameError(name),
    email: emailError(email),
    pw: pwError(pw),
    terms: terms ? '' : 'Agree to the Terms and Privacy Policy to continue.',
  }
  const show = (k: keyof typeof errs, touched: boolean) => (submitted || touched ? errs[k] : '')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (errs.name || errs.email || errs.pw || errs.terms) return
    setBusy(true)
    setTimeout(() => {
      const addr = normEmail(email)
      if (findAccount(addr)) { writeShared(AUTH_KEYS.pendingEmail, addr, ''); nav(path('F01-06')); return }
      saveAccount({ email: addr, name: name.trim(), method: 'email', pw: hashPw(pw), verified: false, createdAt: Date.now() })
      writeShared(AUTH_KEYS.verify, { email: addr, sentAt: Date.now(), status: 'sent' }, null)
      setMethod('email')
      logAudit(name.trim(), 'Created an account with email')
      nav(path('F01-03'))
    }, 600)
  }

  return (
    <Screen id="F01-02" layout="auth">
      <AuthCard>
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-h1 font-semibold">Create your account</h1>
            <p className="mt-1 text-small text-muted max-xl:hidden">with email and password</p>
          </div>
          <AuthInput label="Full name" autoComplete="name" value={name} error={show('name', !!touched.name)} onBlur={() => blur('name')} onChange={(e) => { setName(e.target.value); setPName(e.target.value) }} />
          <AuthInput label="Email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} error={show('email', !!touched.email)} onBlur={() => blur('email')} onChange={(e) => { setEmail(e.target.value); setPEmail(e.target.value) }} />
          <div>
            <AuthInput label="Password" secret autoComplete="new-password" value={pw} error={show('pw', !!touched.pw)} onBlur={() => blur('pw')} onChange={(e) => setPw(e.target.value)} />
            <PasswordStrength value={pw} />
          </div>
          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-small has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
              <input type="checkbox" className="sr-only" checked={terms} aria-invalid={show('terms', false) ? true : undefined} onChange={(e) => { setTerms(e.target.checked); setPTerms(e.target.checked) }} />
              <span aria-hidden className={cn('flex size-5 flex-none items-center justify-center rounded-[4px] border-2', terms ? 'border-primary bg-primary text-on-primary' : show('terms', false) ? 'border-danger' : 'border-line-strong')}>{terms && <Check className="size-3.5" />}</span>
              <span>I agree to the <button type="button" onClick={() => setDoc('Terms')} className="cursor-pointer text-brand underline">Terms</button> and <button type="button" onClick={() => setDoc('Privacy Policy')} className="cursor-pointer text-brand underline">Privacy Policy</button></span>
            </label>
            {show('terms', false) && <p role="alert" className="mt-1 text-label text-danger-ink">{errs.terms}</p>}
          </div>
          <Button type="submit" size="lg" block loading={busy}>Create account</Button>
          <p className="text-center text-small text-muted">Already have an account? <Link to={path('F01-01')} className="font-medium">Sign in</Link></p>
        </form>
      </AuthCard>
      <Modal open={doc !== null} onOpenChange={(o) => !o && setDoc(null)} title={doc ?? ''}>
        <p className="text-small text-muted">Sample text. The full {doc} is published before launch.</p>
      </Modal>
    </Screen>
  )
}
