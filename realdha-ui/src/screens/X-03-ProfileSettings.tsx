import { Check, CircleCheck, Moon, Sun } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { clearPersisted, usePersistentState } from '../app/persist'
import { usePrefs, type Lang } from '../app/prefs'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Field } from '../components/ui/field'
import { Modal } from '../components/ui/modal'
import { Pill } from '../components/ui/pill'
import { PROFILE_DEFAULT, type Profile } from '../data/fixtures/x-flow'
import { cn } from '../lib/cn'
import { formatPhone, phoneError } from '../lib/identity-flow'

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'mr', label: 'मराठी' },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const initials = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: ReactNode; lang?: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex w-fit overflow-hidden rounded-control border border-line-strong bg-surface text-small font-medium max-xl:text-chip xl:w-full">
      {options.map((o) => (
        <button key={o.id} type="button" lang={o.lang} aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={cn('min-h-11 cursor-pointer px-4 xl:min-h-9', value === o.id ? 'bg-primary font-semibold text-on-primary' : 'text-text hover:bg-primary-tint')}>{o.label}</button>
      ))}
    </div>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between">
      <span className="text-body">{label}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('relative h-7 w-12 cursor-pointer rounded-full transition-colors', on ? 'bg-primary' : 'bg-line-strong')}>
        <span aria-hidden className={cn('absolute top-0.5 size-6 rounded-full bg-surface shadow-e1 transition-[left]', on ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  )
}

/** X-03 · Profile and settings. Saved profile is `x.profile`; unsaved form edits live in `x.profile.draft`. Language and theme apply immediately. */
export default function ProfileSettings() {
  const nav = useNavigate()
  const { lang, setLang, theme, toggleTheme } = usePrefs()
  const [profile, setProfile] = usePersistentState<Profile>('x.profile', PROFILE_DEFAULT)
  const [draft, setDraft] = usePersistentState('x.profile.draft', { name: profile.name, phone: profile.phone, email: profile.email })
  const [errs, setErrs] = useState<{ name?: string; phone?: string; email?: string }>({})
  const [msg, setMsg] = useState('')
  const [dlg, setDlg] = useState<'password' | 'sessions' | 'delete' | null>(null)
  const [pw, setPw] = useState({ cur: '', next: '', again: '' })
  const [pwErr, setPwErr] = useState<Record<string, string>>({})
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const save = () => {
    const e: typeof errs = {}
    if (!draft.name.trim()) e.name = 'Enter your full name.'
    const p = phoneError(draft.phone.replace(/^\+91/, ''))
    if (p) e.phone = p
    if (!draft.email.trim()) e.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(draft.email.trim())) e.email = 'Enter a valid email address.'
    setErrs(e)
    if (Object.keys(e).length) { setMsg(''); return }
    const digits = draft.phone.replace(/^\+91/, '')
    const phone = `+91 ${formatPhone(digits)}`
    const next = { name: draft.name.trim(), phone, email: draft.email.trim() }
    setDraft(next)
    setProfile({ ...profile, ...next, saved: true })
    flash('Saved')
  }
  const setTheme = (t: 'light' | 'dark') => { if (t !== theme) toggleTheme() }
  const download = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'realdha-my-data.json'; a.click()
    URL.revokeObjectURL(a.href)
    flash('Downloaded')
  }
  const changePw = () => {
    const e: Record<string, string> = {}
    if (!pw.cur) e.cur = 'Enter your current password.'
    if (pw.next.length < 8) e.next = 'Use at least 8 characters.'
    if (pw.again !== pw.next) e.again = 'The two passwords do not match.'
    setPwErr(e)
    if (Object.keys(e).length) return
    setDlg(null); setPw({ cur: '', next: '', again: '' }); flash('Password changed')
  }
  const signOut = () => nav(path('F01-08'))
  const deleteAccount = () => { clearPersisted(); nav(path('F01-01')) }
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const side = [['personal', 'Personal details'], ['language', 'Language'], ['kyc', 'KYC status'], ['security', 'Security']]

  const langCard = (
    <Card id="language" className="flex scroll-mt-4 flex-col gap-3 p-4 xl:p-6">
      <h2 className="text-h3 max-xl:sr-only xl:text-h2">Language</h2>
      <Segmented label="Language" value={lang} onChange={setLang} options={LANGS.map((l) => ({ ...l, lang: l.id }))} />
    </Card>
  )
  const themeCard = (
    <Card id="theme" className="flex scroll-mt-4 flex-col gap-3 p-4 xl:p-6">
      <h2 className="text-h3 xl:text-h2">Theme</h2>
      <Segmented label="Theme" value={theme} onChange={setTheme} options={[
        { id: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun className="size-4" aria-hidden />Light</span> },
        { id: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon className="size-4" aria-hidden />Dark</span> },
      ]} />
    </Card>
  )

  return (
    <Screen id="X-03" back={path('X-01')} title="Profile">
      <div className="mx-auto flex w-full max-w-[1344px] flex-1 flex-col gap-4 p-4 xl:flex-row xl:gap-7 xl:px-12 xl:py-8">
        <nav aria-label="Settings sections" className="flex w-60 flex-none flex-col gap-1 max-xl:hidden">
          {side.map(([id, l], i) => (
            <button key={id} type="button" onClick={() => jump(id)} className={cn('h-10 cursor-pointer rounded-control px-3.5 text-left text-small', i === 0 ? 'bg-primary-tint font-semibold text-on-primary-tint' : 'hover:bg-primary-tint')}>{l}</button>
          ))}
          <button type="button" onClick={signOut} className="h-10 cursor-pointer rounded-control px-3.5 text-left text-small font-semibold text-danger-ink hover:bg-danger-tint">Sign out</button>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-4 xl:gap-5">
          <h1 className="text-h1 max-xl:hidden">Profile and settings</h1>

          <div className="flex items-center gap-3 xl:hidden">
            <div aria-hidden className="flex size-11 items-center justify-center rounded-full bg-primary-tint text-label font-semibold text-on-primary-tint">{initials(profile.name)}</div>
            <div><div className="text-body font-semibold">{profile.name}</div><div className="text-small text-muted">{profile.phone}</div></div>
          </div>

          <Card id="personal" className="flex scroll-mt-4 flex-col gap-4 p-6 max-xl:hidden">
            <h2 className="text-h2">Personal details</h2>
            <form className="grid gap-4 xl:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save() }} noValidate>
              <Field label="Full name" value={draft.name} error={errs.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoComplete="name" />
              <Field label="Phone" value={draft.phone} error={errs.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
              <Field label="Email" type="email" value={draft.email} error={errs.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="xl:col-span-2" autoComplete="email" />
            </form>
          </Card>

          {langCard}
          {themeCard}

          <Card className="flex flex-col gap-3 p-4 xl:hidden">
            <h2 className="text-h3">Notifications</h2>
            <Toggle label="Email" on={profile.emailOn} onChange={(v) => setProfile({ ...profile, emailOn: v })} />
            <Toggle label="SMS" on={profile.smsOn} onChange={(v) => setProfile({ ...profile, smsOn: v })} />
          </Card>

          <Card id="kyc" className="flex scroll-mt-4 flex-col gap-2 p-6 max-xl:hidden">
            <div className="flex items-center justify-between"><h2 className="text-h2">KYC status</h2><Pill tone="success" icon={<Check className="size-3.5" />}>Verified</Pill></div>
            <p className="text-small text-muted">PAN and Aadhaar verified on 20 Nov 2026. See <a href={path('F02-03')}>F02-03</a>.</p>
          </Card>

          <Card id="security" className="flex scroll-mt-4 flex-col gap-3 p-4 xl:p-6">
            <h2 className="text-h2 max-xl:sr-only">Security</h2>
            <div className="flex items-center justify-between gap-3 max-xl:flex-col max-xl:items-stretch">
              <span className="text-body max-xl:hidden">Password</span>
              <Button variant="secondary" size="sm" className="max-xl:h-12 max-xl:text-control" onClick={() => setDlg('password')}><span className="xl:hidden">Change password</span><span className="max-xl:hidden">Change</span></Button>
            </div>
            <div className="flex items-center justify-between gap-3 max-xl:hidden">
              <span className="text-body">Active sessions</span>
              <Button variant="secondary" size="sm" onClick={() => setDlg('sessions')}>Review</Button>
            </div>
            <Button variant="secondary" className="h-12 xl:hidden" onClick={download}>Download my data</Button>
            <Button variant="secondary" className="h-12 border-danger text-danger-ink hover:bg-danger-tint xl:hidden" onClick={() => setDlg('delete')}>Delete account</Button>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="max-xl:hidden" onClick={save}>Save changes</Button>
            <Button variant="secondary" className="border-danger text-danger-ink hover:bg-danger-tint max-xl:h-12 max-xl:w-full max-xl:border-line-strong max-xl:text-primary-text" onClick={signOut}>Sign out</Button>
            <span role="status" aria-live="polite" className="flex items-center gap-1.5 text-chip font-medium text-success-ink">{msg && <><CircleCheck className="size-4" aria-hidden />{msg}</>}</span>
          </div>
        </div>
      </div>

      <Modal open={dlg === 'password'} onOpenChange={(o) => !o && setDlg(null)} title="Change password">
        <Field label="Current password" type="password" value={pw.cur} error={pwErr.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" />
        <Field label="New password" type="password" value={pw.next} error={pwErr.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
        <Field label="Confirm new password" type="password" value={pw.again} error={pwErr.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} autoComplete="new-password" />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDlg(null)}>Cancel</Button><Button onClick={changePw}>Change password</Button></div>
      </Modal>
      <Modal open={dlg === 'sessions'} onOpenChange={(o) => !o && setDlg(null)} title="Active sessions">
        <ul className="flex flex-col"><li className="flex items-center justify-between border-b border-line py-2.5 text-small"><span>This device</span><Pill tone="success" icon={<Check className="size-3.5" />}>Current</Pill></li></ul>
        <div className="flex justify-end"><Button variant="secondary" onClick={() => setDlg(null)}>Close</Button></div>
      </Modal>
      <Modal open={dlg === 'delete'} onOpenChange={(o) => !o && setDlg(null)} title="Delete account">
        <p className="text-small text-muted">This removes your profile and every saved draft on this device.</p>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDlg(null)}>Cancel</Button><Button variant="danger" onClick={deleteAccount}>Delete account</Button></div>
      </Modal>
    </Screen>
  )
}
