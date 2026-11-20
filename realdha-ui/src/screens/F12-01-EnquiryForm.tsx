import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Field } from '../components/ui/field'
import { Pill } from '../components/ui/pill'
import { RecordId } from '../components/ui/record-id'
import { Switch } from '../components/ui/switch'
import { TextareaField } from '../components/ui/textarea'
import { SEED_ENQUIRIES, UNITS, inr, unitById, type Enquiry } from '../data/fixtures/f11-buyer'
import { logAudit } from '../lib/audit'
import { BK, emailError, messageError, mobileError, nameError } from '../lib/buyer-store'
import { K } from '../lib/identity-flow'
import { readShared, writeShared } from '../lib/shared-state'

interface Draft { name: string; phone: string; email: string; message: string; contact: boolean }
const saved = (k: string) => readShared<string>(k, '')
const initial = (): Draft => ({
  name: saved(K.name) || 'Priya Deshmukh',
  phone: saved(K.phone) ? `+91 ${saved(K.phone)}` : '+91 98765 43210',
  email: 'priya@example.com',
  message: 'I would like to know the payment schedule and possession date.',
  contact: true,
})
type Errs = Partial<Record<'name' | 'phone' | 'email' | 'message', string>>
const check = (d: Draft): Errs => {
  const e: Errs = { name: nameError(d.name), phone: mobileError(d.phone), email: emailError(d.email), message: messageError(d.message) }
  return Object.fromEntries(Object.entries(e).filter(([, v]) => v))
}

/** F12-01 · Enquiry form, prefilled from the unit. Draft persists in `f12.draft`; Send writes `f12.enquiries`. */
export default function EnquiryForm() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const unit = unitById(params.get('unit') ?? '') ?? UNITS[0]
  const [d, setD] = usePersistentState<Draft>(BK.enquiryDraft, initial())
  const [errs, setErrs] = useState<Errs>({})
  const [sending, setSending] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const blur = (k: keyof Errs) => setErrs((e) => ({ ...e, [k]: check(d)[k] }))
  const back = `${path('F09-03')}?unit=${unit.id}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = check(d)
    setErrs(found)
    if (Object.keys(found).length) { window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0); return }
    setSending(true)
    window.setTimeout(() => {
      const enq: Enquiry = { id: `e-${Date.now()}`, unitId: unit.id, ...d, sentAt: Date.now(), status: 'sent', live: true }
      writeShared<Enquiry[]>(BK.enquiries, (l) => [enq, ...l], SEED_ENQUIRIES)
      writeShared<string>(BK.lastEnquiry, enq.id, '')
      logAudit(d.name, `Sent enquiry about ${unit.unit}`)
      nav(path('F12-02'))
    }, 600)
  }

  return (
    <Screen id="F12-01" back={back} title="Enquire">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 py-4 xl:py-8">
        <Link to={back} className="inline-flex items-center gap-1.5 text-chip text-muted no-underline hover:text-text"><ArrowLeft className="size-3.5" aria-hidden />{unit.unit} · {unit.bhk}</Link>
        <h1 className="text-h1 font-semibold max-xl:text-h2">Enquire about {unit.unit}</h1>
        <Card className="flex flex-col gap-4 p-4 xl:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-control bg-sunken px-3 py-3">
            <RecordId id={unit.id} />
            <span className="text-small max-xl:hidden">{unit.bhk} · {unit.carpet} · {inr(unit.price)}</span>
            <Pill>Prefilled</Pill>
          </div>
          <form noValidate onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <Field label="Your name" value={d.name} autoComplete="name" onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} error={errs.name} />
              <Field label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')} error={errs.phone} />
            </div>
            <Field label="Email" type="email" autoComplete="email" value={d.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} error={errs.email} />
            <TextareaField label="Message" rows={4} value={d.message} onChange={(e) => set('message', e.target.value)} onBlur={() => blur('message')} error={errs.message} />
            <div className="flex items-center gap-3">
              <Switch checked={d.contact} onChange={(v) => set('contact', v)} aria-labelledby="f12-contact" />
              <span id="f12-contact" className="text-small"><span className="max-xl:hidden">Developer may contact me by phone</span><span className="xl:hidden">Share my contact with the owner</span></span>
            </div>
            <div className="flex flex-col-reverse gap-2.5 xl:flex-row xl:justify-end">
              <Button variant="secondary" to={back} size="lg" className="xl:h-control">Cancel</Button>
              <Button type="submit" size="lg" className="xl:h-control" loading={sending}>Send enquiry</Button>
            </div>
          </form>
        </Card>
      </div>
    </Screen>
  )
}
