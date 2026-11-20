import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { AuthCard, AuthInput, Notice } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { BIZ, bizRole } from '../../data/fixtures/f01-business'
import { AUTH_KEYS } from '../../lib/auth-store'
import { logAudit } from '../../lib/audit'
import { K } from '../../lib/identity-flow'
import { cn } from '../../lib/cn'
import { useSharedState, writeShared } from '../../lib/shared-state'

type Saved = Record<string, Record<string, string>>
const NONE: Saved = {}
const STATE_ROLE: Record<string, string> = { developer: 'developer', broker: 'broker', lawyer: 'lawyer', government: 'gov' }

/** F01-07 · Business details, one form per sub-role (`?state=developer|broker|lawyer|government`). Saved under `auth.business`. */
export default function BusinessDetails() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [storedRole, setStoredRole] = usePersistentState<string>(K.businessRole, 'developer')
  const forced = STATE_ROLE[params.get('state') ?? '']
  const role = bizRole(forced ?? storedRole)
  const form = BIZ[role]
  const [saved] = useSharedState<Saved>(AUTH_KEYS.business, NONE)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [requested, setRequested] = usePersistentState('auth.business.govRequested', false)
  const val = (id: string) => vals[id] ?? saved[role]?.[id] ?? ''

  const setVal = (id: string, v: string) => {
    setVals((p) => ({ ...p, [id]: v }))
    setErrs((p) => ({ ...p, [id]: '' }))
    writeShared<Saved>(AUTH_KEYS.business, (p) => ({ ...p, [role]: { ...p[role], [id]: v } }), NONE)
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = Object.fromEntries(form.fields.map((f) => [f.id, f.check(val(f.id))]))
    setErrs(next)
    if (Object.values(next).some(Boolean)) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      logAudit(val('org'), role === 'gov' ? 'Requested government access' : 'Saved business details')
      if (role === 'gov') { setRequested(true); return }
      setStoredRole(role)
      nav(path('F02-01'))
    }, 500)
  }

  return (
    <Screen id="F01-07" layout="auth">
      <AuthCard wide>
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <h1 className="text-h1 font-semibold"><span className="xl:hidden">Business details</span><span className="max-xl:hidden">{form.heading}</span></h1>
          {form.fields.map((f) => {
            const label = f.labelM ? <><span className="xl:hidden">{f.labelM}</span><span className="max-xl:hidden">{f.label}</span></> : f.label
            return f.options ? (
              <div key={f.id} className="flex flex-col">
                <label htmlFor={`biz-${f.id}`} className="mb-1.5 text-chip font-semibold">{label}</label>
                <select id={`biz-${f.id}`} value={val(f.id)} aria-invalid={errs[f.id] ? true : undefined} onChange={(e) => setVal(f.id, e.target.value)} className={cn('h-12 w-full cursor-pointer rounded-control border bg-field px-3 text-control text-text outline-none focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)]', errs[f.id] ? 'border-danger' : 'border-line-strong')}>
                  <option value="">Choose one</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errs[f.id] && <p role="alert" className="mt-1.5 text-label text-danger-ink">{errs[f.id]}</p>}
              </div>
            ) : (
              <AuthInput key={f.id} label={label} type={f.type} mono={f.mono} placeholder={f.placeholder} help={f.help} error={errs[f.id]} value={val(f.id)} onChange={(e) => setVal(f.id, e.target.value)} />
            )
          })}
          {role === 'gov' ? (
            <>
              <p className="text-small text-muted"><span className="max-xl:hidden">Government accounts are read-only and are approved by a Realdha admin.</span><span className="xl:hidden">Access is read-only and needs approval.</span></p>
              {requested && <Notice tone="success" icon={<CheckCircle2 className="size-[18px]" />}>Request sent to {val('email') || 'your official email'}.</Notice>}
              <Button type="submit" size="lg" block loading={busy} disabled={requested}>Request access</Button>
            </>
          ) : (
            <Button type="submit" size="lg" block loading={busy}>Continue to KYC</Button>
          )}
        </form>
      </AuthCard>
    </Screen>
  )
}
