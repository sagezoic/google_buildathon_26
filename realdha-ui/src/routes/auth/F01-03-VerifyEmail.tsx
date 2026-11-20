import { AlertCircle, CheckCircle2, Clock, Mail } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { AuthCard } from '../../components/ui/auth-parts'
import { Button } from '../../components/ui/button'
import { OtpInput } from '../../components/ui/otp-input'
import { AUTH_KEYS, findAccount, saveAccount, startSession } from '../../lib/auth-store'
import { logAudit } from '../../lib/audit'
import { DEMO_CODE, OTP_RESEND_MS, fmtMmSs } from '../../lib/identity-flow'
import { useSharedState, writeShared } from '../../lib/shared-state'

type Status = 'sent' | 'verified' | 'expired'
interface Verify { email: string; sentAt: number; status: Status }
const LINK_TTL_MS = 24 * 60 * 60 * 1000
const FALLBACK = 'prakash@example.com'
const STATES = ['sent', 'verified', 'expired']
const D = ({ d, m }: { d: ReactNode; m: ReactNode }) => (<><span className="xl:hidden">{m}</span><span className="max-xl:hidden">{d}</span></>)
const Ic = ({ tone, children }: { tone: 'warning' | 'success' | 'primary'; children: ReactNode }) => (
  <div aria-hidden className={`flex size-12 flex-none items-center justify-center rounded-full ${tone === 'success' ? 'bg-success-tint text-success-ink' : tone === 'warning' ? 'bg-warning-tint text-warning-ink' : 'bg-primary-tint text-on-primary-tint'}`}>{children}</div>
)

/** F01-03 · Verify email: sent, verified, link expired. The sample code stands in for the emailed link. */
export default function VerifyEmail() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const forced = STATES.includes(params.get('state') ?? '') ? (params.get('state') as Status) : null
  const [v] = useSharedState<Verify | null>(AUTH_KEYS.verify, null)
  const [now, setNow] = useState(() => Date.now())
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  const email = v?.email ?? FALLBACK
  const live: Status = v ? (v.status === 'sent' && now - v.sentAt > LINK_TTL_MS ? 'expired' : v.status) : 'sent'
  const view = forced ?? live
  const left = v && !forced ? OTP_RESEND_MS - (now - v.sentAt) : forced === 'sent' ? 42_000 : 0

  const set = (status: Status, sentAt = v?.sentAt ?? Date.now()) => writeShared<Verify | null>(AUTH_KEYS.verify, { email, sentAt, status }, null)
  const resend = () => { set('sent', Date.now()); setCode(''); setWrong(false); setNow(Date.now()); if (forced) nav(path('F01-03'), { replace: true }) }
  const verify = () => {
    if (code.length < 6 || busy) return
    if (code !== DEMO_CODE) { setWrong(true); setCode(''); return }
    setBusy(true)
    setTimeout(() => {
      const acc = findAccount(email)
      if (acc) { saveAccount({ ...acc, verified: true }); startSession({ ...acc, verified: true }); logAudit(acc.name, 'Verified email') }
      set('verified')
      setBusy(false)
    }, 500)
  }

  return (
    <Screen id="F01-03" layout="auth">
      <AuthCard>
        <div aria-live="polite" className="flex flex-col gap-4">
          {view === 'sent' && (
            <>
              <Ic tone="primary"><Mail className="size-6" /></Ic>
              <h1 className="text-h2">Check your email</h1>
              <p className="text-small text-muted"><D d={<>We sent a verification link to <b className="text-text">{email}</b>. It works for 24 hours.</>} m={<>We sent a link to {email}.</>} /></p>
              <div className="flex flex-col gap-2.5">
                <OtpInput value={code} onChange={(c) => { setWrong(false); setCode(c) }} error={wrong} label="Verification code" describedBy={wrong ? 'ver-err' : undefined} />
                {wrong && <p id="ver-err" role="alert" className="flex items-center gap-1.5 text-chip font-medium text-danger-ink"><AlertCircle className="size-4 flex-none" aria-hidden />That code is not right. Check the email and try again.</p>}
                <p className="text-label text-muted">Sample code for this prototype: <span className="font-mono font-medium text-text">{DEMO_CODE}</span></p>
                <Button size="lg" block loading={busy} disabled={code.length < 6} onClick={verify}>Verify</Button>
              </div>
              <Button size="lg" block variant="secondary" disabled={left > 0} onClick={resend}>Resend email</Button>
              <p className="text-center text-small text-muted">
                {left > 0 && <>Resend available in <b className="font-semibold text-text">{fmtMmSs(left)}</b> · </>}
                <Link to={path('F01-02')} className="font-medium">Change email</Link>
              </p>
            </>
          )}
          {view === 'verified' && (
            <>
              <Ic tone="success"><CheckCircle2 className="size-6" /></Ic>
              <h1 className="text-h2"><D d="Email verified" m="Email verified" /></h1>
              <p className="text-small text-muted"><D d={<>Thanks, {email} is confirmed. Next, tell us how you'll use Realdha.</>} m="You can continue." /></p>
              <Button size="lg" block to={path('GP-03')}>Continue</Button>
            </>
          )}
          {view === 'expired' && (
            <>
              <Ic tone="warning"><Clock className="size-6" /></Ic>
              <h1 className="text-h2"><D d="This link has expired" m="Link expired" /></h1>
              <p className="text-small text-muted"><D d="Verification links work for 24 hours. Request a new one and we'll email it right away." m="This link is older than 24 hours." /></p>
              <Button size="lg" block onClick={resend}>Send a new link</Button>
              <Link to={path('F01-01')} className="min-h-11 text-center text-small font-medium max-xl:leading-[44px]">Back to sign in</Link>
            </>
          )}
        </div>
      </AuthCard>
    </Screen>
  )
}
