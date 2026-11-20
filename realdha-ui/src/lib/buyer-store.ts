import { phoneError } from './identity-flow'
import { CALL_TYPES, SLOT_TIMES, type CallType } from '../data/fixtures/f11-buyer'

/** Persisted keys for F11 to F13 and F18. */
export const BK = {
  shortlist: 'f11.shortlist',
  compare: 'f11.compare',
  chat: 'f11.chat',
  enquiries: 'f12.enquiries',
  enquiryDraft: 'f12.draft',
  lastEnquiry: 'f12.last',
  callDraft: 'f13.draft',
  calls: 'f13.calls',
  lastCall: 'f13.last',
  notify: 'f13.notify',
  interests: 'f18.interests',
  interestDraft: 'f18.draft',
  watchlist: 'market.watchlist',
} as const

/** Validators: return '' when valid. */
export const nameError = (v: string) => (v.trim().length < 2 ? 'Enter your full name.' : '')
export const mobileError = (v: string) => {
  let d = v.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  return phoneError(d)
}
export const emailError = (v: string) => (!v.trim() ? 'Enter your email.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like name@example.com.')
export const messageError = (v: string) => (v.trim().length < 10 ? 'Write at least 10 characters so the developer can help.' : '')

/** ---- dates (all calendar math is local; labels are IST in the UI) ---- */
export const WINDOW_DAYS = 14
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n: number) => String(n).padStart(2, '0')
export const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const dateOf = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const todayIso = () => isoOf(new Date())
export const shortDate = (iso: string) => { const d = dateOf(iso); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}` }
export const fullDate = (iso: string) => { const d = dateOf(iso); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` }
export const longDate = (iso: string) => { const d = dateOf(iso); return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` }
export const chipDate = (iso: string) => { const d = dateOf(iso); return `${DAYS[d.getDay()]} ${d.getDate()}` }
export const sentDate = (ts: number) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(ts)
export const addedDate = (ts: number) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' }).format(ts)

/** ---- slots ---- */
export interface Call {
  id: string
  unitId: string
  type: CallType
  date: string
  time: string
  status: 'booked' | 'cancelled'
  note: string
  reason?: string
}
export interface CallDraft { unitId: string; type: CallType; date: string; time: string; note: string }

const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6

/** Slots the partner has already given away, by date. One day in seven is fully taken. */
export function takenFor(iso: string): Set<string> {
  const h = hash(iso)
  if (h % 7 === 0) return new Set(SLOT_TIMES)
  const a = h % SLOT_TIMES.length
  let b = (h >> 3) % SLOT_TIMES.length
  if (b === a) b = (b + 3) % SLOT_TIMES.length
  return new Set([SLOT_TIMES[a], SLOT_TIMES[b]])
}
/** Taken for this buyer too: their own booked calls. `ignoreId` is the call being rescheduled. */
export function takenWith(iso: string, calls: Call[], ignoreId?: string): Set<string> {
  const s = takenFor(iso)
  calls.filter((c) => c.status === 'booked' && c.date === iso && c.id !== ignoreId).forEach((c) => s.add(c.time))
  return s
}
export const freeSlots = (iso: string, calls: Call[], ignoreId?: string) => {
  const t = takenWith(iso, calls, ignoreId)
  return SLOT_TIMES.filter((x) => !t.has(x))
}
export const inWindow = (iso: string) => {
  const t = new Date(); const start = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  const d = dateOf(iso)
  return d > start && d <= addDays(start, WINDOW_DAYS)
}
export const windowDates = () => {
  const t = new Date(); const start = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(start, i + 1)).filter((d) => !isWeekend(d)).map(isoOf)
}
export const bookableDates = (calls: Call[], ignoreId?: string) => windowDates().filter((d) => freeSlots(d, calls, ignoreId).length > 0)
export const dayState = (iso: string, calls: Call[], ignoreId?: string): 'open' | 'full' | 'weekend' | 'outside' => {
  if (!inWindow(iso)) return 'outside'
  if (isWeekend(dateOf(iso))) return 'weekend'
  return freeSlots(iso, calls, ignoreId).length ? 'open' : 'full'
}
export const endTime = (time: string, type: CallType) => {
  const [h, m] = time.split(':').map(Number)
  const t = h * 60 + m + (type === 'site' ? 45 : 30)
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`
}
export const typeTitle = (t: CallType) => CALL_TYPES.find((c) => c.id === t)!.title
export const callLink = (id: string) => `meet.example/ra-${id.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(-8)}`

/** First bookable date at or after `offset` days out, so a seeded call is always on a real, open day. */
export function seedCall(): Call {
  const d = windowDates().find((x) => freeSlots(x, []).includes('11:00')) ?? windowDates()[0] ?? todayIso()
  return { id: 'c-seed', unitId: 'RA-PUN-001-A-18-04', type: 'video', date: d, time: '11:00', status: 'booked', note: '' }
}

export function icsFile(c: Call, unitLabel: string) {
  const [y, m, d] = c.date.split('-')
  const stamp = (t: string) => `${y}${m}${d}T${t.replace(':', '')}00`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Realdha//Sample//EN', 'BEGIN:VEVENT', `UID:${c.id}@realdha.example`, `DTSTAMP:${stamp('00:00')}`,
    `DTSTART;TZID=Asia/Kolkata:${stamp(c.time)}`, `DTEND;TZID=Asia/Kolkata:${stamp(endTime(c.time, c.type))}`, `SUMMARY:${typeTitle(c.type)} · ${unitLabel}`, 'END:VEVENT', 'END:VCALENDAR']
  return new Blob([lines.join('\r\n')], { type: 'text/calendar' })
}

export const SEED_CALLS: Call[] = [seedCall()]
export const EMPTY_DRAFT_TIME = '11:00'
export const defaultDraft = (unitId = 'RA-PUN-001-A-18-04'): CallDraft => ({
  unitId, type: 'video', date: bookableDates(SEED_CALLS)[0] ?? todayIso(), time: EMPTY_DRAFT_TIME, note: '',
})
