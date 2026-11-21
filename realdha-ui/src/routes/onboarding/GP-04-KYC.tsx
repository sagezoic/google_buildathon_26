import { Check, ShieldCheck } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { usePersistentState } from '../../app/persist'
import { K, KYC_MAX_ATTEMPTS, kycOutcome, panError, today, type KycStatus } from '../../lib/identity-flow'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Field } from '../../components/ui/field'
import { prakash } from '../../data/fixtures/identity'
import { OnboardSteps } from '../../components/onboard-steps'
import { useIntent } from '../../lib/onboard-intent'

/** GP-04 · KYC. Desktop: single card with consent. Phone and tablet: shorter copy, consent inline. */
export default function KYC() {
  const nav = useNavigate()
  const intent = useIntent()
  const [pan, setPan] = usePersistentState(K.pan, prakash.pan)
  const [consent, setConsent] = usePersistentState(K.panConsent, true)
  const [attempts, setAttempts] = usePersistentState(K.kycAttempts, 0)
  const [, setStatus] = usePersistentState<KycStatus>(K.kycStatus, 'none')
  const [, setName] = usePersistentState(K.name, '')
  const [, setCheckedAt] = usePersistentState(K.kycCheckedAt, 0)
  const [, setConsentDate] = usePersistentState(K.kycConsentDate, '')
  const [panErr, setPanErr] = useState('')
  const [consentErr, setConsentErr] = useState(false)
  const [busy, setBusy] = useState(false)
  const locked = attempts >= KYC_MAX_ATTEMPTS
  const verify = () => {
    // The consent checkbox is drawn at desktop width; below it the consent line is implicit in pressing the button.
    const explicit = window.matchMedia('(min-width: 1280px)').matches
    const e = panError(pan)
    setPanErr(e)
    const noConsent = explicit && !consent
    setConsentErr(noConsent)
    if (e || noConsent || busy) return
    setBusy(true)
    setTimeout(() => {
      const outcome = kycOutcome(pan)
      setPan(pan)
      setConsent(explicit ? consent : true)
      setConsentDate(today())
      setCheckedAt(Date.now())
      setStatus(outcome)
      setAttempts(outcome === 'failed' ? attempts + 1 : 0)
      if (outcome === 'verified') setName(prakash.firstName)
      nav(path('GP-05'))
    }, 900)
  }
  return (
    <Screen id="GP-04" layout="auth" noTabs>
      <div className="flex flex-1 items-start justify-center px-4 pt-4 pb-8 xl:pt-2">
        <div className="flex w-full max-w-[560px] flex-col gap-3.5 xl:rounded-card xl:border xl:border-line xl:bg-surface xl:p-6 xl:shadow-e1">
          {intent ? <OnboardSteps step="kyc" /> : <p className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-xl:hidden">Step 3 of 3 · Verify your identity</p>}
          <h1 className="text-h2 xl:text-h1"><span className="xl:hidden">Verify your identity</span><span className="max-xl:hidden">Verify who you are</span></h1>
          <p className="text-control text-muted">
            <span className="xl:hidden">Needed to add a property or tokenise.</span>
            <span className="max-xl:hidden">KYC unlocks sign-off, anchoring and tokenising. Browsing and adding drafts work without it.</span>
          </p>
          <Field
            label="PAN"
            value={pan}
            onChange={(e) => { setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)); if (panErr) setPanErr('') }}
            onBlur={() => pan && setPanErr(panError(pan))}
            error={panErr}
            placeholder={prakash.pan}
            maxLength={10}
            autoCapitalize="characters"
            help={<span className="max-xl:hidden">10 characters, as printed on your PAN card</span>}
            className="[&_input]:h-12 [&_input]:font-mono [&_input]:font-medium [&_input]:tracking-[0.08em]"
          />
          <div className="flex items-center gap-3 text-chip text-muted max-xl:hidden" aria-hidden>
            <span className="h-px flex-1 bg-line" />then<span className="h-px flex-1 bg-line" />
          </div>
          <Button size="lg" block variant="secondary" onClick={verify} loading={busy} disabled={locked} icon={<ShieldCheck className="size-[18px]" aria-hidden />} className="xl:font-medium max-xl:bg-primary max-xl:text-on-primary max-xl:border-primary">Verify Aadhaar with DigiLocker</Button>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-[8px] border border-line bg-canvas px-3.5 py-3 text-chip max-xl:hidden">
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setConsentErr(false) }} aria-invalid={consentErr || undefined} aria-describedby={consentErr ? 'consent-err' : undefined} className="peer sr-only" />
            <span aria-hidden className={`mt-0.5 flex size-[18px] flex-none items-center justify-center rounded-[4px] border ${consent ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-field'} peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus`}>{consent && <Check className="size-3.5" />}</span>
            <span className="leading-5">I consent to Realdha checking my PAN and Aadhaar through DigiLocker to verify my identity. Realdha stores only the verification result, not my Aadhaar number. I can withdraw consent in Settings. <a href="#">Read how we use this data</a></span>
          </label>
          <p className="text-label text-muted xl:hidden">By continuing you consent to Realdha reading your PAN and Aadhaar name through DigiLocker (mocked). We never put personal data on-chain.</p>
          {consentErr && <p id="consent-err" role="alert" className="flex items-center gap-1.5 text-label text-danger-ink max-xl:hidden"><AlertCircle className="size-3.5 flex-none" aria-hidden />Tick the consent box to continue.</p>}
          {locked && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><AlertCircle className="size-3.5 flex-none" aria-hidden />No attempts left today.</p>}
          <Button size="lg" block onClick={verify} loading={busy} disabled={!consent || locked} className="max-xl:hidden">Verify identity</Button>
          <div className="text-center"><a href={intent ? path('F02-04') : path('GP-06')} className="inline-flex min-h-11 items-center text-small font-medium">Do this later</a></div>
        </div>
      </div>
    </Screen>
  )
}
