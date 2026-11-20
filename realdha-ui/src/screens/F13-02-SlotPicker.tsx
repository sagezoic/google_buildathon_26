import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { TextareaField } from '../components/ui/textarea'
import { SLOT_TIMES, UNITS, unitById } from '../data/fixtures/f11-buyer'
import { logAudit } from '../lib/audit'
import { BK, MONTHS, SEED_CALLS, bookableDates, chipDate, dateOf, dayState, defaultDraft, isoOf, longDate, takenWith, typeTitle, windowDates, type Call, type CallDraft } from '../lib/buyer-store'
import { cn } from '../lib/cn'
import { useSharedState, writeShared } from '../lib/shared-state'

const DRAFT = defaultDraft()
const dayBtn = 'inline-flex size-10 items-center justify-center rounded-control text-small'

/** F13-02 · Slot picker over real dates: weekends closed, 14-day window, taken slots, no-slots state. */
export default function SlotPicker() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [calls] = useSharedState<Call[]>(BK.calls, SEED_CALLS)
  const [draft, setDraft] = usePersistentState<CallDraft>(BK.callDraft, DRAFT)
  const open = bookableDates(calls)
  const date = open.includes(draft.date) ? draft.date : open[0]
  const [view, setView] = useState(() => { const d = dateOf(date ?? draft.date); return { y: d.getFullYear(), m: d.getMonth() } })
  const [err, setErr] = useState('')
  const unit = unitById(draft.unitId) ?? UNITS[0]

  if (!date || params.get('state') === 'none') return <Navigate to={path('F13-05')} replace />

  const taken = takenWith(date, calls)
  const time = taken.has(draft.time) ? '' : draft.time
  const win = windowDates()
  const lastWin = dateOf(win[win.length - 1])
  const first = new Date(view.y, view.m, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const now = new Date()
  const canPrev = view.y * 12 + view.m > now.getFullYear() * 12 + now.getMonth()
  const canNext = view.y * 12 + view.m < lastWin.getFullYear() * 12 + lastWin.getMonth()
  const shift = (n: number) => setView((v) => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const choose = (iso: string) => setDraft((d) => ({ ...d, date: iso }))

  const confirm = () => {
    if (!time) { setErr('Choose a time to continue.'); return }
    if (takenWith(date, calls).has(time)) { setErr('That time was just taken. Choose another.'); return }
    const call: Call = { id: `c-${Date.now()}`, unitId: unit.id, type: draft.type, date, time, status: 'booked', note: draft.note }
    writeShared<Call[]>(BK.calls, (l) => [call, ...l], SEED_CALLS)
    writeShared<string>(BK.lastCall, call.id, '')
    logAudit('Buyer', `Booked ${typeTitle(draft.type).toLowerCase()} for ${unit.unit} on ${date} ${time}`)
    setDraft((d) => ({ ...d, time: '', note: '' }))
    nav(path('F13-03'))
  }

  return (
    <Screen id="F13-02" back={path('F13-01')} title="Book a call">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 px-4 py-4 xl:py-8">
        <div className="text-chip text-muted max-xl:hidden">Book a call · {unit.unit} · {typeTitle(draft.type)}</div>
        <h1 className="text-h1 font-semibold max-xl:text-h2"><span className="max-xl:hidden">Choose a slot</span><span className="xl:hidden">Pick a time</span></h1>
        <p className="text-chip font-medium text-muted xl:hidden">Call length 30 min · booking window 14 days, set by partner. IST.</p>

        <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden" role="group" aria-label="Day">
          {win.map((iso) => {
            const full = dayState(iso, calls) === 'full'
            const on = iso === date
            return <button key={iso} type="button" disabled={full} aria-pressed={on} onClick={() => choose(iso)} className={cn('min-h-11 shrink-0 cursor-pointer rounded-control border px-3.5 text-small font-semibold', on ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-primary-text', full && 'cursor-not-allowed bg-sunken text-muted line-through')}>{chipDate(iso)}{full && <span className="sr-only"> fully booked</span>}</button>
          })}
        </div>

        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[420px_1fr] xl:items-start xl:gap-4">
          <Card className="flex flex-col gap-3 p-6 max-xl:hidden">
            <div className="flex items-center justify-between">
              <b className="text-body">{MONTHS[view.m]} {view.y}</b>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)}><ChevronLeft className="size-4" aria-hidden /></Button>
                <Button size="sm" variant="secondary" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)}><ChevronRight className="size-4" aria-hidden /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-y-1 text-label font-semibold text-muted">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
            <div className="grid grid-cols-7 justify-items-center gap-y-1">
              {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: days }, (_, i) => {
                const iso = isoOf(new Date(view.y, view.m, i + 1))
                const st = dayState(iso, calls)
                const on = iso === date
                const ok = st === 'open'
                return <button key={iso} type="button" disabled={!ok} aria-pressed={on} aria-label={`${longDate(iso)}${st === 'full' ? ', fully booked' : st === 'weekend' ? ', no slots at weekends' : ''}`} onClick={() => choose(iso)} className={cn(dayBtn, 'cursor-pointer', on ? 'bg-primary font-semibold text-on-primary' : ok ? 'text-text hover:bg-primary-tint' : 'cursor-not-allowed text-muted opacity-60')}>{i + 1}</button>
              })}
            </div>
            <p className="text-chip font-medium text-muted">Weekends have no slots.</p>
          </Card>

          <Card className="flex flex-col gap-3 p-4 xl:p-6 max-xl:border-0 max-xl:bg-transparent max-xl:p-0 max-xl:shadow-none">
            <b className="text-body max-xl:text-label max-xl:font-semibold max-xl:tracking-[0.04em] max-xl:text-muted max-xl:uppercase">{longDate(date)}<span className="max-xl:hidden"> · IST</span></b>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="Times">
              {SLOT_TIMES.map((t) => {
                const gone = taken.has(t)
                const on = time === t
                return (
                  <button key={t} type="button" disabled={gone} aria-pressed={on} onClick={() => { setErr(''); setDraft((d) => ({ ...d, date, time: t })) }} className={cn('min-h-11 cursor-pointer rounded-control border px-1 text-small font-semibold', on ? 'border-2 border-primary bg-primary-tint max-xl:bg-primary max-xl:text-on-primary' : 'border-line-strong bg-surface text-primary-text hover:bg-primary-tint', gone && 'cursor-not-allowed border-line bg-sunken font-normal text-muted hover:bg-sunken')}>
                    <span className={gone ? 'line-through xl:no-underline' : ''}>{t}</span>{gone && <span className="max-xl:sr-only"> · taken</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-chip font-medium text-muted xl:hidden">Struck-through times are taken.</p>
            <TextareaField className="xl:hidden" label="Note (optional)" rows={2} value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
          </Card>
        </div>
        {err && <p role="alert" className="flex items-center gap-1.5 text-label text-danger-ink"><TriangleAlert className="size-3.5" aria-hidden />{err}</p>}
        <div className="flex flex-col-reverse gap-2.5 xl:flex-row xl:justify-end">
          <Button variant="secondary" size="lg" to={path('F13-01')} className="max-xl:hidden xl:h-control">Back</Button>
          <Button size="lg" className="xl:h-control" onClick={confirm}>{time ? `Confirm ${time}${' '}slot`.replace(' ', ' ') : 'Confirm slot'}</Button>
        </div>
      </div>
    </Screen>
  )
}
