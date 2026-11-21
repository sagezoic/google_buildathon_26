/** F08 / F09 · Sample properties for buyer search. Sample data only. */

export type PType = 'apartment' | 'villa' | 'plot' | 'commercial'
export type VStatus = 'signed-off' | 'lawyer-review'
export interface Property {
  id: string
  unit: string
  project: string
  type: PType
  bhk?: number
  /** Carpet area in sq ft. */
  area: number
  label: string
  locality: string
  city: string
  status: VStatus
  onChain: boolean
  newLaunch: boolean
  /** Indicative price in rupees. */
  price: number
  note: string
  facing: string
  view: string
  floor: string
  available: boolean
  developer: string
}

const P = (id: string, unit: string, project: string, type: PType, bhk: number | undefined, area: number, label: string, locality: string, city: string, status: VStatus, onChain: boolean, newLaunch: boolean, price: number, note: string, facing: string, view: string, floor: string): Property =>
  ({ id, unit, project, type, bhk, area, label, locality, city, status, onChain, newLaunch, price, note, facing, view, floor, available: true, developer: 'Sahyadri Developers' })
const S = 'signed-off' as const
const L = 'lawyer-review' as const
const apt = (bhk: number, area: number) => `${bhk} BHK · ${area.toLocaleString('en-IN')} sq ft`

/** The villa that carries the 360° tour. First verified record in every listing. */
export const VILLA_ID = 'RA-PUN-018-V-07-01'

export const PROPERTIES: Property[] = [
  P(VILLA_ID, 'Villa 7', 'Sahyadri Meadows Villas', 'villa', 4, 2850, '4 BHK Villa · 2,850 sq ft', 'Baner', 'Pune', S, true, false, 38500000, 'East facing · Private garden', 'East', 'Garden', 'Ground + 1'),
  P('RA-PUN-001-A-18-04', 'A-1804', 'Baner Heights', 'apartment', 3, 1180, apt(3, 1180), 'Baner', 'Pune', S, true, false, 14200000, 'East facing · Hill view', 'East', 'Hill', '18 of 24'),
  P('RA-PUN-001-A-12-02', 'A-1202', 'Baner Heights', 'apartment', 2, 860, apt(2, 860), 'Baner', 'Pune', S, false, false, 9200000, 'North facing', 'North', 'Road', '12 of 24'),
  P('RA-PUN-001-A-09-01', 'A-0901', 'Baner Heights', 'apartment', 3, 1210, apt(3, 1210), 'Baner', 'Pune', S, false, false, 13400000, 'West facing · Garden view', 'West', 'Garden', '9 of 24'),
  P('RA-PUN-001-A-15-03', 'A-1503', 'Baner Heights', 'apartment', 3, 1150, apt(3, 1150), 'Baner', 'Pune', S, true, false, 13800000, 'South facing · Garden view', 'South', 'Garden', '15 of 24'),
  P('RA-PUN-001-A-05-02', 'A-0502', 'Baner Heights', 'apartment', 1, 640, apt(1, 640), 'Baner', 'Pune', S, false, false, 6800000, 'East facing', 'East', 'Road', '5 of 24'),
  P('RA-PUN-001-A-21-06', 'A-2106', 'Baner Heights', 'apartment', 4, 1650, apt(4, 1650), 'Baner', 'Pune', L, false, false, 21000000, 'Corner unit · Hill view', 'East', 'Hill', '21 of 24'),
  P('RA-PUN-007-A-03-01', 'A-0301', 'Skyline Residency', 'apartment', 2, 780, apt(2, 780), 'Baner', 'Pune', S, false, true, 9200000, 'Possession 2028', 'North', 'Garden', '3 of 18'),
  P('RA-PUN-007-A-08-04', 'A-0804', 'Skyline Residency', 'apartment', 3, 1090, apt(3, 1090), 'Baner', 'Pune', L, false, true, 14000000, 'Possession 2028', 'East', 'Pool', '8 of 18'),
  P('RA-PUN-011-C-02-03', 'C-0203', 'Baner Road Arcade', 'commercial', undefined, 320, 'Shop · 320 sq ft', 'Baner', 'Pune', L, false, false, 7800000, 'Ground floor', 'South', 'Road', '2 of 3'),
  P('RA-PUN-012-C-01-02', 'C-0102', 'Baner Business Park', 'commercial', undefined, 540, 'Office · 540 sq ft', 'Baner', 'Pune', S, true, false, 12500000, 'First floor', 'West', 'Road', '1 of 6'),
  P('RA-PUN-013-P-045-1', 'Plot 45', 'Baner Hills Layout', 'plot', undefined, 2400, 'Plot · 2,400 sq ft', 'Baner', 'Pune', S, false, false, 28000000, 'Corner plot', 'North', 'Hill', 'Plot'),
  P('RA-PUN-014-A-10-02', 'B-1002', 'Pashan Link Towers', 'apartment', 2, 905, apt(2, 905), 'Baner', 'Pune', S, false, false, 11000000, 'West facing', 'West', 'Road', '10 of 20'),
  P('RA-PUN-003-A-07-01', 'A-0701', 'Balewadi Pool Court', 'apartment', 3, 1320, apt(3, 1320), 'Balewadi', 'Pune', L, false, false, 15800000, 'Pool view', 'East', 'Pool', '7 of 15'),
  P('RA-PUN-003-A-11-02', 'A-1102', 'Balewadi Pool Court', 'apartment', 2, 950, apt(2, 950), 'Balewadi', 'Pune', S, true, false, 11500000, 'Pool view', 'North', 'Pool', '11 of 15'),
  P('RA-PUN-004-A-21-06', 'A-2106', 'Wakad Greens', 'apartment', 2, 910, apt(2, 910), 'Wakad', 'Pune', S, false, true, 8900000, 'Possession 2027', 'East', 'Garden', '21 of 22'),
  P('RA-PUN-004-A-04-01', 'A-0401', 'Wakad Greens', 'apartment', 1, 610, apt(1, 610), 'Wakad', 'Pune', S, false, true, 5900000, 'Possession 2027', 'South', 'Road', '4 of 22'),
  P('RA-PUN-015-A-06-03', 'C-0603', 'Sai Residency', 'apartment', 3, 1100, apt(3, 1100), 'Wakad', 'Pune', S, false, false, 12400000, 'North facing', 'North', 'Garden', '6 of 12'),
  P('RA-PUN-001-C-02-11', 'C-0211', 'Kothrud Market Plaza', 'commercial', undefined, 320, 'Shop · 320 sq ft', 'Kothrud', 'Pune', S, true, false, 8600000, 'Ground floor', 'East', 'Road', 'Ground'),
  P('RA-PUN-002-A-05-02', 'A-0502', 'Hinjewadi Lake View', 'apartment', 2, 890, apt(2, 890), 'Hinjewadi', 'Pune', S, false, false, 8400000, 'Lake view', 'West', 'Lake', '5 of 14'),
  P('RA-PUN-005-A-12-07', 'A-1207', 'Hinjewadi Lake View', 'apartment', 3, 1240, apt(3, 1240), 'Hinjewadi', 'Pune', L, false, false, 11800000, 'Lake view', 'West', 'Lake', '12 of 14'),
  P('RA-PUN-016-A-06-03', 'A-0603', 'Aundh Crest', 'apartment', 3, 1260, apt(3, 1260), 'Aundh', 'Pune', S, true, false, 15200000, 'East facing', 'East', 'Garden', '6 of 16'),
  P('RA-LON-004-P-112-2', 'Gat 112/2', 'Kusgaon NA plots', 'plot', undefined, 4300, 'Plot · Gat 112/2', 'Kusgaon', 'Lonavala', L, true, false, 5120000, 'Hill view', 'North', 'Hill', 'Plot'),
]

export const byId = (id: string) => PROPERTIES.find((p) => p.id.toLowerCase() === id.trim().toLowerCase())
export const CITIES = ['Pune', 'Lonavala']
export const NEARBY: Record<string, string> = { Baner: 'Balewadi', Balewadi: 'Baner', Wakad: 'Hinjewadi', Hinjewadi: 'Wakad', Aundh: 'Baner', Kothrud: 'Aundh', Kusgaon: 'Lonavala' }
export const LOCALITIES = ['Baner', 'Balewadi', 'Wakad', 'Hinjewadi', 'Aundh', 'Kothrud', 'Kusgaon']

export interface Filters {
  types: PType[]
  bhk: number[]
  /** Free text such as "60 L" or "1.5 Cr". */
  priceMin: string
  priceMax: string
  signedOff: boolean
  onChain: boolean
  lawyerReview: boolean
  newOnly: boolean
}
export const NO_FILTERS: Filters = { types: [], bhk: [], priceMin: '', priceMax: '', signedOff: false, onChain: false, lawyerReview: false, newOnly: false }
/** The filters drawn in the F08-02 frame. */
export const FRAME_FILTERS: Filters = { ...NO_FILTERS, types: ['apartment'], bhk: [3], signedOff: true, onChain: true, priceMin: '60 L', priceMax: '1.5 Cr' }

export interface SearchState { q: string; filters: Filters }
export const INITIAL_SEARCH: SearchState = { q: '', filters: NO_FILTERS }
export const INITIAL_RECENT = ['RA-PUN-001-A-18-04', 'Baner, Pune', 'Kusgaon, Lonavala', 'RA-PUN-002-A-05-02']

/** "60 L" -> 6000000, "1.5 Cr" -> 15000000, "9000000" -> 9000000. NaN when it cannot be read. */
export function parsePrice(s: string): number {
  const m = s.trim().replace(/[₹,\s]+/g, '').match(/^(\d+(?:\.\d+)?)(l|lakh|lac|cr|crore)?$/i)
  if (!m) return NaN
  const n = parseFloat(m[1])
  const u = (m[2] ?? '').toLowerCase()
  return Math.round(u.startsWith('c') ? n * 1e7 : u ? n * 1e5 : n)
}
export const priceError = (s: string) => (s.trim() && Number.isNaN(parsePrice(s)) ? 'Use a number like 60 L or 1.5 Cr.' : '')
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
export const priceShort = (n: number) => (n >= 1e7 ? `₹${+(n / 1e7).toFixed(2)} Cr` : `₹${+(n / 1e5).toFixed(0)} L`)

export type Kind = 'empty' | 'id-hit' | 'id-invalid' | 'text'
export interface Parsed { kind: Kind; q: string; ids?: Property[]; parts?: number; city?: string; terms: string[]; bhk?: number; maxPrice?: number }

const ID_RE = /^RA-/i
const PROJECT_IDS = Array.from(new Set(PROPERTIES.map((p) => p.id.split('-').slice(0, 4).join('-'))))
/** A Realdha ID has 5 parts after "RA": city, zone, type, floor or block, unit. */
export const idParts = (q: string) => q.trim().split('-').slice(1).filter(Boolean).length

/** Reads "Baner, 5 BHK, under ₹50 L" into locality terms, a city, a BHK and a price cap. */
export function parseQuery(raw: string): Parsed {
  const q = raw.trim()
  if (!q) return { kind: 'empty', q, terms: [] }
  if (ID_RE.test(q)) {
    const hit = byId(q)
    if (hit) return { kind: 'id-hit', q, ids: [hit], terms: [] }
    const prefix = q.toUpperCase().replace(/-+$/, '')
    if (PROJECT_IDS.includes(prefix)) return { kind: 'text', q, terms: [], ids: PROPERTIES.filter((p) => p.id.startsWith(prefix + '-')) }
    const parts = idParts(q)
    if (parts !== 5) return { kind: 'id-invalid', q, parts, terms: [] }
    return { kind: 'text', q, terms: [], ids: [] }
  }
  const out: Parsed = { kind: 'text', q, terms: [] }
  for (const part of q.split(',').map((s) => s.trim()).filter(Boolean)) {
    const bhk = part.match(/^(\d)\+?\s*bhk$/i)
    const price = part.match(/^(?:under|below|upto|up to|max)\s*(.+)$/i)
    const city = CITIES.find((c) => c.toLowerCase() === part.toLowerCase())
    if (bhk) out.bhk = +bhk[1]
    else if (price && !Number.isNaN(parsePrice(price[1]))) out.maxPrice = parsePrice(price[1])
    else if (city) out.city = city
    else out.terms.push(part)
  }
  return out
}

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
const matchesTerm = (p: Property, term: string) => {
  const hay = words([p.locality, p.city, p.project, p.unit, p.label, p.note, p.type].join(' '))
  const tw = words(term)
  return tw.length > 0 && tw.every((t) => hay.some((h) => h === t || (t.length >= 3 && h.startsWith(t))))
}

export function matchFilters(p: Property, f: Filters): boolean {
  if (f.types.length && !f.types.includes(p.type)) return false
  if (f.bhk.length && !(p.bhk !== undefined && f.bhk.some((b) => (b >= 4 ? p.bhk! >= 4 : p.bhk === b)))) return false
  const lo = parsePrice(f.priceMin)
  const hi = parsePrice(f.priceMax)
  if (!Number.isNaN(lo) && f.priceMin.trim() && p.price < lo) return false
  if (!Number.isNaN(hi) && f.priceMax.trim() && p.price > hi) return false
  if (f.signedOff || f.onChain || f.lawyerReview) {
    const ok = (f.signedOff && p.status === 'signed-off') || (f.onChain && p.onChain) || (f.lawyerReview && p.status === 'lawyer-review')
    if (!ok) return false
  }
  return !(f.newOnly && !p.newLaunch)
}

/** Really filters the sample dataset: query text, city, BHK and price from the query, then the drawer filters. */
export function runSearch(q: string, f: Filters, extra: string[] = []): { parsed: Parsed; results: Property[] } {
  const parsed = parseQuery(q)
  if (parsed.kind === 'id-hit') return { parsed, results: parsed.ids ?? [] }
  if (parsed.kind === 'id-invalid') return { parsed, results: [] }
  const base = parsed.ids ?? PROPERTIES
  const terms = [...parsed.terms, ...extra]
  const results = base.filter((p) => {
    if (parsed.city && p.city !== parsed.city) return false
    if (terms.length && !terms.some((t) => matchesTerm(p, t))) return false
    if (parsed.bhk !== undefined && p.bhk !== parsed.bhk) return false
    if (parsed.maxPrice !== undefined && p.price > parsed.maxPrice) return false
    return matchFilters(p, f)
  })
  return { parsed, results }
}

export const activeFilters = (f: Filters): { key: string; label: string }[] => [
  ...f.types.map((t) => ({ key: `type:${t}`, label: t === 'apartment' ? 'Apartment' : t === 'villa' ? 'Villa' : t === 'plot' ? 'Plot' : 'Commercial' })),
  ...f.bhk.map((b) => ({ key: `bhk:${b}`, label: `${b >= 4 ? '4+' : b} BHK` })),
  ...(f.priceMin.trim() || f.priceMax.trim() ? [{ key: 'price', label: 'Price' }] : []),
  ...(f.signedOff ? [{ key: 'signedOff', label: 'Signed off' }] : []),
  ...(f.onChain ? [{ key: 'onChain', label: 'Anchored on-chain' }] : []),
  ...(f.lawyerReview ? [{ key: 'lawyerReview', label: 'Lawyer review' }] : []),
  ...(f.newOnly ? [{ key: 'newOnly', label: 'New launch' }] : []),
]
export function dropFilter(f: Filters, key: string): Filters {
  if (key.startsWith('type:')) return { ...f, types: f.types.filter((t) => t !== key.slice(5)) }
  if (key.startsWith('bhk:')) return { ...f, bhk: f.bhk.filter((b) => b !== +key.slice(4)) }
  if (key === 'price') return { ...f, priceMin: '', priceMax: '' }
  return { ...f, [key]: false }
}
