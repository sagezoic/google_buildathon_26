import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { AuthCard, AuthInput, Notice } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { findAccount, nameError, saveAccount, startSession } from '../../lib/auth-store'
import { logAudit } from '../../lib/audit'
import { K } from '../../lib/identity-flow'

type Phase = 'connecting' | 'linked' | 'cancelled'
const PHASES: Phase[] = ['linked', 'connecting', 'cancelled']
const PROFILE = { name: 'Prakash Kulkarni', email: 'prakash@example.com' }
const G = <span aria-hidden className="flex size-9 flex-none items-center justify-center rounded-full border-[1.5px] border-muted text-control font-semibold">G</span>

/** F01-05 · Google first-time handoff. Connecting, linked (as drawn) and cancelled. Continue stores the account and session. */
export default function GoogleHandoff() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const forcedRaw = params.get('state') as Phase | null
  const forced = forcedRaw && PHASES.includes(forcedRaw) ? forcedRaw : null
  const [phase, setPhase] = useState<Phase>(forced ?? 'connecting')
  const [name, setName] = usePersistentState('auth.google.name', PROFILE.name)
  const [err, setErr] = useState('')
  const [, setMethod] = usePersistentState<string>(K.signupMethod, '')
  const [, setIdName] = usePersistentState(K.name, '')

  useEffect(() => {
    if (forced || phase !== 'connecting') return
    const t = setTimeout(() => setPhase('linked'), 1200)
    return () => clearTimeout(t)
  }, [forced, phase])
  const view = forced ?? phase
  const retry = () => { setPhase('connecting'); if (forced) nav(path('F01-05'), { replace: true }) }

  const next = () => {
    const e = nameError(name)
    setErr(e)
    if (e) return
    const prev = findAccount(PROFILE.email)
    const acc = { email: PROFILE.email, name: name.trim(), method: 'google' as const, pw: prev?.pw ?? '', verified: true, createdAt: prev?.createdAt || Date.now() }
    saveAccount(acc)
    startSession(acc)
    setMethod('google')
    setIdName(acc.name)
    logAudit(acc.name, 'Signed in with Google')
    nav(path('GP-03'))
  }

  return (
    <Screen id="F01-05" layout="auth">
      <AuthCard>
        <div aria-live="polite" className="flex flex-col gap-4">
          {view === 'connecting' && (
            <>
              <h1 className="text-h2">Connecting to Google</h1>
              <p className="flex items-center gap-2.5 text-small text-muted"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />Waiting for Google to confirm your account.</p>
              <Button size="lg" block variant="secondary" onClick={() => setPhase('cancelled')}>Cancel</Button>
            </>
          )}
          {view === 'cancelled' && (
            <>
              <h1 className="text-h2">Google sign-in was cancelled</h1>
              <Notice tone="warning" icon={<AlertCircle className="size-[18px]" />}>No account was created. You can try again or use another method.</Notice>
              <Button size="lg" block onClick={retry}>Try Google again</Button>
              <Button size="lg" block variant="secondary" to={path('F01-01')}>Back to sign in</Button>
            </>
          )}
          {view === 'linked' && (
            <>
              <div className="flex items-center gap-3 rounded-[8px] border border-line bg-sunken p-3 max-xl:rounded-card max-xl:bg-surface">
                {G}
                <div className="min-w-0 flex-1 text-small"><b className="block">Signed in with Google</b><span className="block truncate text-muted">{PROFILE.email}</span></div>
                <Pill tone="success" icon={<Check className="size-3.5" />}>Linked</Pill>
              </div>
              <div>
                <h1 className="text-h2 xl:text-h1">Welcome to Realdha</h1>
                <p className="mt-1 text-small text-muted"><span className="xl:hidden">One more step: tell us how you will use Realdha.</span><span className="max-xl:hidden">Confirm your details, then choose how you'll use Realdha.</span></p>
              </div>
              <AuthInput label="Full name" autoComplete="name" value={name} error={err} onChange={(e) => { setName(e.target.value); setErr('') }} />
              <div className="flex flex-col">
                <span className="mb-1.5 text-chip font-semibold">Email</span>
                <div className="flex h-12 items-center justify-between gap-2 rounded-control border border-line bg-sunken px-3 text-control"><span className="truncate">{PROFILE.email}</span><span className="text-label text-muted">From Google · verified</span></div>
              </div>
              <p className="text-small text-muted max-xl:hidden">Next: <b className="text-text">Account type</b>, then identity KYC.</p>
              <Button size="lg" block onClick={next}>Continue</Button>
            </>
          )}
        </div>
      </AuthCard>
    </Screen>
  )
}
