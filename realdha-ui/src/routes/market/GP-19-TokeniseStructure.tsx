import { Check, CircleDot, Lock, TriangleAlert } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { usePersistentState } from '../../app/persist'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field } from '../../components/ui/field'
import { Pill } from '../../components/ui/pill'
import { TOKENISE } from '../../data/fixtures/twin'
import { useTwinRecord } from '../../lib/twin-store'

interface Structure { units: string; price: string; partner: string; consent?: boolean }
const num = (s: string) => Number(s.replace(/,/g, ''))
const inr = (n: number) => `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Static({ label, value, help, disabled }: { label: string; value: ReactNode; help?: string; disabled?: boolean }) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span id={id} className="text-small font-medium">{label}</span>
      <div aria-labelledby={id} className={disabled ? 'flex h-control items-center rounded-control border border-disabled-line bg-disabled-fill px-3 text-control text-disabled' : 'flex h-control items-center rounded-control border border-line-strong bg-field px-3 text-control'}>{value}</div>
      {help && <span className="text-label text-muted">{help}</span>}
    </div>
  )
}

/** GP-19 · Tokenise, step 1 of 2: structure. States: unlocked, locked (sign-off missing). */
export default function TokeniseStructure() {
  const [params] = useSearchParams()
  const { signedOff, plot } = useTwinRecord()
  const [form, setForm] = usePersistentState<Structure>('tokenise.structure', { units: TOKENISE.units, price: TOKENISE.unitPrice, partner: TOKENISE.fundPartner })
  const [tried, setTried] = useState(false)
  const navigate = useNavigate()
  // ?state= forces the drawn state; otherwise lock follows the sign-off state.
  const forced = params.get('state')
  const locked = forced === 'locked' || (forced !== 'unlocked' && !signedOff)
  const state = locked ? 'locked' : 'unlocked'

  const units = num(form.units)
  const price = num(form.price)
  const errors = {
    units: !/^[\d,]+$/.test(form.units.trim()) || !Number.isInteger(units) || units < 1 || units > 1_000_000 ? 'Enter a whole number of units, 1 to 10,00,000.' : '',
    price: !/^[\d,]*\.?\d{0,2}$/.test(form.price.trim()) || !form.price.trim() || !(price > 0) ? 'Enter a price above 0, up to 2 decimals.' : '',
    partner: form.partner.trim() ? '' : 'Enter the fund partner name.',
  }
  const valid = !errors.units && !errors.price && !errors.partner
  const total = !errors.units && !errors.price ? inr(units * price) : '—'
  const set = (k: keyof Structure) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (valid) void navigate(path('GP-20'))
  }
  return (
    <Screen id="GP-19">
      <div className="flex flex-1 flex-col gap-4.5 px-4 py-6 md:px-12">
        <div role="region" aria-label="Testnet notice" className="flex items-center gap-3 rounded-card border-2 border-demo-line bg-demo px-4 py-3.5 text-demo-ink md:px-5">
          <TriangleAlert className="size-6 flex-none" aria-hidden />
          <div>
            <div className="text-h3 font-bold">Test tokens only</div>
            <div className="text-chip text-text">Tokenising here creates test tokens on Sepolia. They have no legal, financial or monetary value and cannot be bought or sold.</div>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-h1">{TOKENISE.title.replace('Gat 112/2', `Gat ${plot.gat}`)}</h1>
          <span className="text-chip text-muted">Step 1 of 2 · Structure</span>
        </div>

        {state === 'unlocked' ? (
          <Card className="max-w-[720px] md:p-6">
           <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-h3">Structure</h2>
              <div className="flex gap-2">
                <Pill tone="success" icon={<Check className="size-3.5" />}>Signed off</Pill>
                <Pill tone="success" icon={<Check className="size-3.5" />}>KYC verified</Pill>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Field className="flex-1" label="Total units" value={form.units} onChange={set('units')} inputMode="numeric" error={tried ? errors.units : ''} help="Number of test units this record is split into" />
              <Field className="flex-1" label="Unit price (₹)" value={form.price} onChange={set('price')} inputMode="decimal" error={tried ? errors.price : ''} help="Sample value" />
            </div>
            <div className="flex justify-between rounded-control border border-line bg-sunken px-4 py-3 text-small">
              <span className="text-muted">Total value</span>
              <b className="font-semibold" aria-live="polite">{total}</b>
            </div>
            <Field label="Fund partner" value={form.partner} onChange={set('partner')} error={tried ? errors.partner : ''} help="Placeholder. Replace with the partner's registered name." />
            <Static label="Rent / payout schedule" value="Not applicable for this plot" help={'Plots do not earn rent. Rent yield shows "—" on the market.'} disabled />
            <Button type="submit" size="lg" block className="md:w-auto md:self-start">Continue to review</Button>
            <p className="text-label text-muted">You can change these until you press "Mint on Sepolia".</p>
           </form>
          </Card>
        ) : (
          <Card className="flex max-w-[560px] flex-col gap-4 md:p-6">
            <div className="flex flex-col items-center gap-3 px-3 py-5 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-skeleton"><Lock className="size-7 text-muted" aria-hidden /></div>
              <h2 className="text-[20px] leading-7 font-semibold">Tokenise is locked</h2>
              <p className="text-small text-muted">Only signed-off records with a KYC-verified owner can be tokenised.</p>
            </div>
            <ul className="flex flex-col gap-2.5 rounded-control border border-line px-4 py-3.5 text-small">
              <li className="flex items-center gap-2.5"><Pill tone="success" icon={<Check className="size-3.5" />} className="flex-none">Done</Pill>KYC verified</li>
              <li className="flex items-center gap-2.5"><Pill tone="warning" icon={<CircleDot className="size-3.5" />} className="flex-none">To do</Pill>Lawyer sign-off · waiting</li>
            </ul>
            <div aria-hidden className="flex gap-3 opacity-55">
              <Static label="Total units" value="—" disabled />
              <Static label="Unit price (₹)" value="—" disabled />
            </div>
            <Button size="lg" block disabled>Tokenise</Button>
            <a href={path('GP-14')} className="text-center text-small font-medium">View sign-off status</a>
          </Card>
        )}
      </div>
    </Screen>
  )
}
