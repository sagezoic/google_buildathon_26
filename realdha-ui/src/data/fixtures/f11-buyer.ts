/** Sample units, assistant answers and call options shared by F11, F12 and F13. */
export interface Unit {
  id: string
  unit: string
  bhk: string
  carpet: string
  project: string
  price: number
  developer: string
  status: { label: string; tone: 'success' | 'warning' | 'neutral' }
  /** Extra document pill on Compare. */
  extra?: { label: string; tone: 'chain' | 'neutral' }
  floor: string
  view: string
  sunlight: string
}

const NS = 'Not stated'
export const UNITS: Unit[] = [
  { id: 'RA-PUN-001-A-18-04', unit: 'A-1804', bhk: '3 BHK', carpet: '1,180 sq ft', project: 'Baner Heights', price: 14200000, developer: 'Sahyadri Developers (sample)', status: { label: 'Signed off', tone: 'success' }, extra: { label: 'On-chain', tone: 'chain' }, floor: '18', view: 'Hill, unobstructed', sunlight: 'Morning sun until 10:30' },
  { id: 'RA-PUN-001-A-17-04', unit: 'A-1704', bhk: '3 BHK', carpet: '1,180 sq ft', project: 'Baner Heights', price: 13800000, developer: 'Sahyadri Developers (sample)', status: { label: 'Documents checked', tone: 'success' }, extra: { label: 'Awaiting lawyer sign-off', tone: 'neutral' }, floor: '17', view: 'Hill, partly blocked by Tower B', sunlight: 'Morning sun until 10:00' },
  { id: 'RA-PUN-007-B-09-02', unit: 'B-0902', bhk: '2 BHK', carpet: NS, project: 'Skyline Residency', price: 10200000, developer: 'Sahyadri Developers (sample)', status: { label: 'New launch', tone: 'neutral' }, floor: '9', view: NS, sunlight: NS },
  { id: 'RA-PUN-003-A-07-01', unit: 'A-0701', bhk: '3 BHK', carpet: NS, project: 'Balewadi', price: 13100000, developer: 'Sahyadri Developers (sample)', status: { label: 'Lawyer review', tone: 'warning' }, floor: '7', view: NS, sunlight: NS },
  { id: 'RA-PUN-018-V-07-01', unit: 'Villa 7', bhk: '4 BHK', carpet: '2,850 sq ft', project: 'Sahyadri Meadows Villas', price: 38500000, developer: 'Sahyadri Developers (sample)', status: { label: 'Signed off', tone: 'success' }, extra: { label: 'On-chain', tone: 'chain' }, floor: 'Ground + 1', view: 'Private garden', sunlight: 'Morning sun until 11:00' },
]
export const unitById = (id: string) => UNITS.find((u) => u.id === id)
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export const PROJECT = { name: 'Baner Heights', id: 'RA-PUN-001' }
export const TRY_ASKING = ['Which towers face east?', 'Is the OC issued?']
export const ASSISTANT_NOTE = "Answers use only this project's documents."
export const ASSISTANT_DISCLAIMER = 'AI answers are not legal advice and never state legal title or value.'

export type Reply =
  | { kind: 'cited'; text: string; cites: string[] }
  | { kind: 'missing'; text: string; note: string }
  | { kind: 'refuse'; text: string }
export interface Turn { id: string; q: string; a: Reply }

const MISSING: Omit<Extract<Reply, { kind: 'missing' }>, 'kind'> = { text: "I can't find this in the documents. Ask the developer to confirm.", note: 'No source found in the uploaded documents.' }
/** `area` is the place picked in search (name + how many verified records match it); area questions answer from it. */
export function assistantReply(q: string, area?: { name: string; records: number }): Reply {
  const t = q.toLowerCase()
  if (area && /(near|nearby|around|area|locality|verified|here)/.test(t)) {
    return { kind: 'cited', text: area.records ? `Realdha has ${area.records} verified record${area.records === 1 ? '' : 's'} matching ${area.name}. Open Search to see them on the map.` : `Realdha has no verified records for ${area.name} yet.`, cites: [`Realdha records · ${area.name}`] }
  }
  if (/(own|title|legal|lawyer)/.test(t)) return { kind: 'refuse', text: 'I cannot say who legally owns this. Please ask a lawyer.' }
  if (/(clubhouse|possession)/.test(t)) return { kind: 'cited', text: 'Yes. The brochure lists a 6,000 sq ft clubhouse in Tower C. Possession is December 2027 per the RERA registration.', cites: ['Brochure · p4', 'RERA registration · p1'] }
  if (/parking/.test(t)) return { kind: 'cited', text: 'The agreement lists one covered parking slot (P-118).', cites: ['Agreement for sale · page 4'] }
  return { kind: 'missing', ...MISSING }
}
export const SEED_CHAT: Turn[] = [
  { id: 's1', q: 'Is there a clubhouse, and when is possession?', a: assistantReply('clubhouse') },
  { id: 's2', q: 'What is the maintenance charge?', a: assistantReply('maintenance') },
]

export type EnquiryStatus = 'sent' | 'seen' | 'responded'
export interface Enquiry {
  id: string
  unitId: string
  name: string
  phone: string
  email: string
  message: string
  contact: boolean
  sentAt: number
  status: EnquiryStatus
  /** New enquiries move Sent, Seen, Responded as time passes (demo). */
  live?: boolean
}
export const REPLY_TEXT = 'Thank you for your enquiry. Our sales team will share the details by phone.'
export const SEED_ENQUIRIES: Enquiry[] = [
  { id: 'e-3', unitId: 'RA-PUN-001-A-18-04', name: 'Priya Deshmukh', phone: '+91 98765 43210', email: 'priya@example.com', message: 'I would like to know the payment schedule and possession date.', contact: true, sentAt: Date.UTC(2026, 10, 20, 6), status: 'sent' },
  { id: 'e-2', unitId: 'RA-PUN-001-A-17-04', name: 'Priya Deshmukh', phone: '+91 98765 43210', email: 'priya@example.com', message: 'Is the unit still available?', contact: true, sentAt: Date.UTC(2026, 10, 18, 6), status: 'seen' },
  { id: 'e-1', unitId: 'RA-PUN-007-B-09-02', name: 'Priya Deshmukh', phone: '+91 98765 43210', email: 'priya@example.com', message: 'Please share the launch price list.', contact: true, sentAt: Date.UTC(2026, 10, 12, 6), status: 'responded' },
]

export type CallType = 'video' | 'phone' | 'site'
export const CALL_TYPES: { id: CallType; title: string; line: string; short: string }[] = [
  { id: 'video', title: 'Video call', line: '30 minutes on Google Meet link', short: 'With the owner or channel partner' },
  { id: 'phone', title: 'Phone call', line: 'Sales team calls you on +91 98765 43210', short: 'We call you on +91 98765 43210' },
  { id: 'site', title: 'Site visit', line: 'Visit Baner Heights sample flat, 45 minutes', short: 'Visit the property in person' },
]
export const SLOT_TIMES = ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30']
