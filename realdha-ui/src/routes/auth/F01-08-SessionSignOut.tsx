import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { AuthCard } from '../../components/ui/auth-parts'
import { useDemoState } from '../../app/useDemoState'
import { endSession, readSession } from '../../lib/auth-store'
import { logAudit } from '../../lib/audit'

/** F01-08 · Session expired (`?state=expired`) and sign-out confirmation (`?state=confirm`). Sign-out clears `auth.session` only. */
export default function SessionSignOut() {
  const nav = useNavigate()
  const [state] = useDemoState(['expired', 'confirm'] as const)
  const signOut = () => {
    const s = readSession()
    if (s) logAudit(s.name, 'Signed out')
    endSession()
    nav(path('F01-01'))
  }
  const back = () => (window.history.state?.idx > 0 ? nav(-1) : nav(path('X-01')))
  const again = () => { endSession(); nav(path('F01-01')) }

  return (
    <Screen id="F01-08" layout="auth">
      <AuthCard>
        {state === 'expired' ? (
          <div className="flex flex-col gap-4" aria-live="polite">
            <div aria-hidden className="flex size-12 items-center justify-center rounded-full bg-warning-tint text-warning-ink"><Clock className="size-6" /></div>
            <h1 className="text-h2"><span className="xl:hidden">Session expired</span><span className="max-xl:hidden">Your session has expired</span></h1>
            <p className="text-small text-muted"><span className="xl:hidden">Sign in again to continue. Your draft is saved.</span><span className="max-xl:hidden">For your security we signed you out after 30 minutes of inactivity. Your work was saved as a draft.</span></p>
            <Button size="lg" block onClick={again}>Sign in again</Button>
          </div>
        ) : null}
      </AuthCard>
      <Modal open={state === 'confirm'} onOpenChange={(o) => !o && back()} title="Sign out of Realdha?">
        <p className="text-small text-muted"><span className="xl:hidden">You will need to sign in again.</span><span className="max-xl:hidden">You'll need to sign in again to see your properties. Drafts stay saved.</span></p>
        <div className="flex gap-3">
          <Button size="lg" block variant="secondary" onClick={() => back()}>Cancel</Button>
          <Button size="lg" block onClick={signOut}>Sign out</Button>
        </div>
      </Modal>
    </Screen>
  )
}
