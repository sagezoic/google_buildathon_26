import { Lock } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import type { Role } from '../../app/screens'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { logAudit } from '../../lib/audit'
import { ROLE_LABEL, useSessionRole } from '../../lib/access'
import { Resp } from './f-bits'

/** The access-denied card (F19-04). */
export function DeniedCard({ role }: { role: Role }) {
  const [name] = usePersistentState('identity.name', 'Prakash Kulkarni')
  const [asked, setAsked] = usePersistentState('f19.accessRequested', false)
  const [busy, setBusy] = useState(false)
  const request = () => {
    setBusy(true)
    setTimeout(() => { setAsked(true); logAudit(name || 'Visitor', 'Requested admin access'); setBusy(false) }, 350)
  }
  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col gap-4 px-4 py-6 xl:py-16">
      <Card role="alert" className="flex flex-col gap-4 p-6 max-xl:border-danger max-xl:bg-danger-tint">
        <Lock className="size-6 text-danger-ink xl:hidden" aria-hidden />
        <h1 className="text-h1 max-xl:text-h3"><Resp d="You do not have access to the admin console" m="You do not have access" /></h1>
        <p className="text-small"><Resp d={`This area is for Realdha admins. You are signed in as ${name || 'Prakash Kulkarni'} (${ROLE_LABEL[role] ?? role}).`} m="This area is for Realdha admins." /></p>
        {asked && <p role="status" className="text-label text-success-ink">Access request sent. An admin will review it.</p>}
        <div className="flex gap-3 max-xl:flex-col">
          <Button to={path('X-01')}><Resp d="Go to Home" m="Go to home" /></Button>
          <Button variant="secondary" onClick={request} loading={busy} disabled={asked} className="max-xl:hidden">{asked ? 'Request sent' : 'Request access'}</Button>
        </div>
      </Card>
    </div>
  )
}

/** Renders the admin screen for admins (or when no role is chosen); anyone else gets the F19-04 denied page with their own nav. */
export function AdminGate({ children }: { children: ReactNode }) {
  const role = useSessionRole()
  if (role && role !== 'admin') return <Screen id="F19-04" role={role}><DeniedCard role={role} /></Screen>
  return <>{children}</>
}
