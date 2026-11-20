/** Sample data for the add-property flow (GP-07 to GP-10). Prakash's plot: Kusgaon Plot 112/2. */
export type PropertyType = 'apartment' | 'plot' | 'commercial'

export const STEPS = ['Property details', 'Documents', 'Check', 'Sign-off'] as const

export const plot = {
  gat: '112/2',
  village: 'Kusgaon',
  taluka: 'Maval',
  district: 'Pune',
  address: 'Near Lonavala, off old Mumbai–Pune road',
  mobileVillage: 'Kusgaon, Maval',
  mobileAddress: 'Near Kusgaon fata, Lonavala 410401',
  gps: { lat: 18.7546, lng: 73.4062 },
  mobileGps: { lat: 18.7557, lng: 73.4091 },
  area: '3,200',
  areaUnit: 'sqft',
} as const

export interface UploadDoc {
  id: string
  name: string
  /** Desktop meta line. */
  meta?: string
  /** Mobile meta line. */
  mobileMeta: string
  /** Desktop language chip. */
  detected?: string
  missing?: boolean
}

export const uploadDocs: UploadDoc[] = [
  { id: 'extract', name: '7/12 extract', meta: '7-12-kusgaon.pdf · 2 pages · 1.2 MB', mobileMeta: 'Marathi detected · 2 pages', detected: 'मराठी' },
  { id: 'card', name: 'Property card', meta: 'property-card.pdf · 1 page · 640 KB', mobileMeta: 'Marathi detected · 1 page', detected: 'मराठी' },
  { id: 'na', name: 'NA order', meta: 'na-order.pdf · 3 pages · 2.1 MB', mobileMeta: 'Marathi detected · 3 pages', detected: 'मराठी' },
  { id: 'mutation', name: 'Mutation entries', mobileMeta: 'Entry 2291 expected', missing: true },
  { id: 'deed', name: 'Sale deed', meta: 'sale-deed-2015.pdf · 6 pages · 4.8 MB', mobileMeta: 'English detected · 18 pages', detected: 'मराठी, English' },
]

export type StepState = 'done' | 'active' | 'waiting'

/** GP-09 desktop rows. */
export const processingRows = [
  { name: 'Sale deed', state: 'done', meta: 'Marathi, English · 6 pages' },
  { name: '7/12 extract', state: 'active', page: 'Page 1 of 2' },
  { name: 'Property card', state: 'waiting' },
  { name: 'NA order', state: 'waiting' },
  { name: 'Draft agreement', state: 'waiting' },
] as const

/** GP-09 mobile cards. */
export const processingCards = [
  { name: '7/12 extract', status: 'Reading · Marathi · page 1 of 2', value: 50 },
  { name: 'Property card', status: 'Done', value: 100 },
  { name: 'NA order', status: 'Reading · Marathi · page 1 of 3', value: 20 },
  { name: 'Sale deed', status: 'Queued', value: 0 },
] as const

export type Resolution = 'confirmed' | 'corrected' | 'uploaded' | 'skipped'
export type ActionKind = 'confirm' | 'correct' | 'upload' | 'skip'

export interface ReviewAction { label: string; kind: ActionKind; primary?: boolean }
export interface Finding {
  id: 'A' | 'B' | 'C'
  title: string
  mobileTitle: string
  /** Value pre-filled when the owner chooses Correct. */
  value: string
  tone: 'danger' | 'warning'
  badge: string
  mobileBadge: string
  compare?: { k: string; v: string }[]
  single?: string
  source: string
  actions: ReviewAction[]
  mobile: { value: string; note: string; source?: string; actions: ReviewAction[] }
}

/** GP-10 flagged fields, in frame order. */
export const findings: Finding[] = [
  {
    id: 'A',
    title: 'A · Area',
    mobileTitle: 'Area',
    value: '418 sq m',
    tone: 'danger',
    badge: 'High · values differ',
    mobileBadge: 'Differs',
    compare: [{ k: '7/12 extract', v: '0.0418 ha (418 sq m)' }, { k: 'Draft agreement', v: '465 sq m' }],
    source: 'Source: 7/12 extract · page 1 · highlighted on the right',
    actions: [{ label: 'Confirm 418 sq m', kind: 'confirm' }, { label: 'Correct', kind: 'correct' }, { label: 'Upload corrected agreement', kind: 'upload' }],
    mobile: { value: '0.0418 ha (418 sq m)', note: 'Draft agreement says 465 sq m.', source: '7/12 extract · page 1', actions: [{ label: 'Confirm 418 sq m', kind: 'confirm' }, { label: 'Correct', kind: 'correct' }] },
  },
  {
    id: 'B',
    title: 'B · Mutation entry no. 2291',
    mobileTitle: 'Mutation entry',
    value: '2291',
    tone: 'warning',
    badge: 'Medium · not uploaded',
    mobileBadge: 'Missing',
    single: 'Referenced, but no document',
    source: 'Source: 7/12 extract · page 2 · "फेरफार क्र. २२९१"',
    actions: [{ label: 'Upload mutation entry', kind: 'upload', primary: true }, { label: "I don't have it", kind: 'skip' }],
    mobile: { value: 'No. 2291', note: 'Referenced but not uploaded.', actions: [{ label: 'Upload mutation entry', kind: 'upload' }, { label: "I don't have it", kind: 'skip' }] },
  },
  {
    id: 'C',
    title: 'C · Owner surname',
    mobileTitle: 'Owner surname',
    value: 'Kulkarni',
    tone: 'warning',
    badge: 'Medium · spelling differs',
    mobileBadge: 'Spelling',
    compare: [{ k: '7/12 extract', v: 'Kulkarni' }, { k: 'NA order', v: 'Kulkarny' }],
    source: 'Source: NA order · page 1',
    actions: [{ label: 'Confirm "Kulkarni"', kind: 'confirm' }, { label: 'Correct', kind: 'correct' }],
    mobile: { value: 'Kulkarni', note: 'NA order says "Kulkarny".', source: '7/12 · page 1 · NA order · page 2', actions: [{ label: 'Confirm Kulkarni', kind: 'confirm' }] },
  },
]

/** GP-10 desktop rows already confirmed or read cleanly. */
export const settledFields = [
  { k: 'Owner name', v: 'Prakash Kulkarni', confirmed: true },
  { k: 'Gat number · Village', v: '112/2 · Kusgaon', confirmed: true },
  { k: 'Land use', v: 'Non-agricultural (NA)', confirmed: false },
] as const

/** A document row as persisted under `property.documents`. Names, sizes and status only; never File objects. */
export interface StoredDoc {
  /** An `UploadDoc.id`, `'extra'` for other documents, or `'agreement'` for the corrected agreement from GP-10. */
  slot: string
  file: string
  size: string
  pages?: number
  langs?: string[]
  /** Server document id. Absent on the demo seed rows, which keep the simulated flow. */
  id?: string
  /** Server-side state; seed and not-yet-processed rows are 'uploaded'. */
  status: 'uploaded' | 'processing' | 'processed' | 'failed'
  /** Why processing failed, shown on the GP-09 row. */
  error?: string
}

/** Documents already on file when the owner reaches GP-08 (the frame's four uploaded rows). */
export const seedDocuments: StoredDoc[] = [
  { slot: 'extract', file: '7-12-kusgaon.pdf', size: '1.2 MB', pages: 2, langs: ['Marathi'], status: 'uploaded' },
  { slot: 'card', file: 'property-card.pdf', size: '640 KB', pages: 1, langs: ['Marathi'], status: 'uploaded' },
  { slot: 'na', file: 'na-order.pdf', size: '2.1 MB', pages: 3, langs: ['Marathi'], status: 'uploaded' },
  { slot: 'deed', file: 'sale-deed-2015.pdf', size: '4.8 MB', pages: 6, langs: ['Marathi', 'English'], status: 'uploaded' },
]

export const NATIVE: Record<string, string> = { Marathi: 'मराठी', English: 'English', Hindi: 'हिन्दी' }

/** Short names used in the GP-09 headline. */
export const SHORT: Record<string, string> = { extract: '7/12', card: 'Property card', na: 'NA order', deed: 'Sale deed', mutation: 'Mutation entry', agreement: 'Draft agreement' }
export const slotLabel = (slot: string) => uploadDocs.find((d) => d.id === slot)?.name ?? (slot === 'agreement' ? 'Corrected agreement' : 'Other document')
