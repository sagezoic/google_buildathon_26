import { Phone, Users, Video } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistentState } from '../../../app/persist'
import { Button } from '../../../components/ui/button'
import { RecordId } from '../../../components/ui/record-id'
import { CALL_TYPES, UNITS, inr, unitById, type CallType } from '../../../data/fixtures/f11-buyer'
import { BK, defaultDraft, type CallDraft } from '../../../lib/buyer-store'
import { cn } from '../../../lib/cn'

const ICON = { video: Video, phone: Phone, site: Users }
const DRAFT = defaultDraft()

/** F13-01 · Call type. Choice persists in `f13.draft`. */
export default function CallTypeScreen() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [draft, setDraft] = usePersistentState<CallDraft>(BK.callDraft, DRAFT)
  const unit = unitById(params.get('unit') ?? draft.unitId) ?? UNITS[0]
  const pick = (t: CallType) => setDraft((d) => ({ ...d, type: t, unitId: unit.id }))
  const next = () => { setDraft((d) => ({ ...d, unitId: unit.id })); nav(path('F13-02')) }
  const back = `${path('F09-03')}?unit=${unit.id}`

  return (
    <Screen id="F13-01" back={back} title="Book a call">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 py-4 xl:py-8">
        <div className="text-chip text-muted max-xl:hidden">Book a call · {unit.unit}</div>
        <h1 className="text-h1 font-semibold max-xl:text-h2"><span className="max-xl:hidden">How would you like to talk?</span><span className="xl:hidden">Book a call</span></h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2"><RecordId id={unit.id} /><span className="text-small">{unit.unit} · {unit.bhk}<span className="max-xl:hidden"> · {inr(unit.price)}</span></span></div>
        <fieldset className="flex flex-col gap-3 xl:grid xl:grid-cols-3">
          <legend className="sr-only">Call type</legend>
          {CALL_TYPES.map((c) => {
            const on = draft.type === c.id
            const Icon = ICON[c.id]
            return (
              <label key={c.id} className={cn('flex min-h-11 cursor-pointer flex-col gap-1.5 rounded-card border bg-surface p-4 shadow-e1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus', on ? 'border-2 border-primary bg-primary-tint' : 'border-line hover:border-line-hover')}>
                <input type="radio" name="call-type" className="sr-only" checked={on} onChange={() => pick(c.id)} />
                <span className="flex items-center gap-2"><Icon className="size-[18px] text-muted" aria-hidden /><b>{c.title}</b></span>
                <span className="text-chip text-muted"><span className="max-xl:hidden">{c.line}</span><span className="xl:hidden">{c.short}</span></span>
              </label>
            )
          })}
        </fieldset>
        <div className="flex flex-col-reverse gap-2.5 xl:flex-row xl:justify-end">
          <Button variant="secondary" size="lg" to={back} className="max-xl:hidden xl:h-control">Cancel</Button>
          <Button size="lg" className="xl:h-control" onClick={next}><span className="max-xl:hidden">Next: Choose a slot</span><span className="xl:hidden">Choose a time</span></Button>
        </div>
      </div>
    </Screen>
  )
}
