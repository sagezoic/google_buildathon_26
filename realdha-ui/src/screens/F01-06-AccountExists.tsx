import { AlertTriangle } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { AuthCard, AuthInput, Notice } from '../components/ui/auth-parts'
import { Button } from '../components/ui/button'
import { AUTH_KEYS, findAccount, methodLabel } from '../lib/auth-store'
import { useSharedState, writeShared } from '../lib/shared-state'
import { usePersistentState } from '../app/persist'

/** F01-06 · Account already exists. Reached from email sign-up when the address is registered (`auth.pendingEmail`). */
export default function AccountExists() {
  const [pending] = useSharedState<string>(AUTH_KEYS.pendingEmail, '')
  const email = pending || 'prakash@example.com'
  const acc = findAccount(email)
  const nav = useNavigate()
  const method = acc?.method ?? 'google'
  const [, setSignin] = usePersistentState('auth.signin.email', '')
  return (
    <Screen id="F01-06" layout="auth">
      <AuthCard>
        <h1 className="text-h1 font-semibold max-xl:hidden">Create your account</h1>
        <AuthInput label="Email" value={email} readOnly className="max-xl:hidden" />
        <Notice tone="warning" icon={<AlertTriangle className="size-[18px]" />}>
          <b className="max-xl:hidden">An account with this email already exists.</b>
          <b className="xl:hidden">Account already exists</b>
          <span className="mt-0.5 block text-muted max-xl:hidden">You signed up with {methodLabel(method)}. Sign in instead, or use a different email.</span>
          <span className="xl:hidden">{email} is already registered with {methodLabel(method)}.</span>
        </Notice>
        <Button size="lg" block onClick={() => { setSignin(email); writeShared(AUTH_KEYS.pendingEmail, '', ''); nav(path('F01-01')) }}>Sign in instead</Button>
        <Button size="lg" block variant="secondary" onClick={() => { writeShared(AUTH_KEYS.pendingEmail, '', ''); nav(path('F01-02')) }}>Use a different email</Button>
        <Link to={path('F01-04')} className="min-h-11 text-center text-small font-medium max-xl:hidden">Forgot password?</Link>
      </AuthCard>
    </Screen>
  )
}
