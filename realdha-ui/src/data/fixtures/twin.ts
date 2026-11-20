/** Sample data for Prakash's plot (GP-16 to GP-19). Values are verbatim from the frames. */
export const PLOT = {
  recordId: 'RA-LON-004-P-112-2',
  title: 'NA plot, Gat 112/2',
  titleCompact: 'NA plot · Gat 112/2',
  location: 'Village Kusgaon, Maval, Pune · near Lonavala · 418 sq m',
  boundaryLabel: 'Boundary · 418 sq m',
  overview: [
    { k: 'Type', v: 'Plot · NA' },
    { k: 'Area', v: '418 sq m (0.0418 ha)' },
    { k: 'Gat / survey no.', v: '112/2' },
    { k: 'Owner', v: 'Prakash Kulkarni' },
    { k: 'Village', v: 'Kusgaon' },
    { k: 'Taluka · District', v: 'Maval · Pune' },
    { k: 'GPS', v: '18.7546° N, 73.4062° E', mono: true },
    { k: 'Price', v: 'Not listed' },
  ],
} as const

export interface TwinDoc { name: string; pages: string; hash: string }
export const DOCS: readonly TwinDoc[] = [
  { name: '7/12 extract', pages: '2 pages', hash: '0x9f3a…c21e' },
  { name: 'Property card', pages: '1 page', hash: '0x14be…77a0' },
  { name: 'NA order', pages: '3 pages', hash: '0xa205…3f19' },
  { name: 'Mutation entry 2291', pages: '1 page', hash: '0x6dc8…b402' },
  { name: 'Sale deed', pages: '6 pages', hash: '0xe71c…0d85' },
]

export const PROOF = {
  network: 'Sepolia testnet',
  fingerprints: '5 anchored',
  txHash: '0x5b7d…e904',
  anchored: '20 Nov 2026, 14:32 IST',
}

export const CHECK = {
  verifiedOn: '20 Nov 2026',
  match: { file: '7-12-kusgaon.pdf', matched: '7/12 extract', fingerprint: '0x9f3a…c21e', anchored: 'Sepolia testnet · 20 Nov 2026' },
  changed: { file: '7-12-kusgaon-edited.pdf', comparedWith: '7/12 extract', yourFile: '0x3c90…ae17', anchored: '0x9f3a…c21e' },
}

export const ASK = {
  placeholder: 'Ask about this property…',
  cited: {
    question: 'Who owned this plot before 2015?',
    suggestions: ['Who is the current owner?', 'What is the area?'],
  },
  missing: {
    question: 'Is there a bank loan on this plot?',
    suggestions: ['Who owned this plot before 2015?', 'What is the area?'],
  },
}

export const TOKENISE = {
  title: 'Tokenise · Plot, Gat 112/2',
  units: '1,000',
  unitPrice: '1,250.00',
  totalValue: '₹ 12,50,000.00',
  fundPartner: '[Fund partner name]',
}

/** Demo fingerprint of a file: hashes name and size only (the file is never read or stored). Shape matches the anchored ones. */
export function fingerprint(name: string, size: number): string {
  let h = 0x811c9dc5
  for (const c of `${name.toLowerCase()}|${size}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0
  const a = h.toString(16).padStart(8, '0')
  const b = (Math.imul(h, 0x9e3779b1) >>> 0).toString(16).padStart(8, '0')
  return `0x${a.slice(0, 4)}…${b.slice(-4)}`
}

const DOC_KEYS: [RegExp, string][] = [
  [/7[-_ /]?12|satbara/i, '7/12 extract'],
  [/property[-_ ]?card/i, 'Property card'],
  [/na[-_ ]?order|\bna\b/i, 'NA order'],
  [/mutation|ferfar/i, 'Mutation entry 2291'],
  [/sale[-_ ]?deed|deed/i, 'Sale deed'],
]
const EDIT_MARK = /edit|v2|copy|modified|altered|changed|\(\d\)/i

export interface CheckResult { result: 'matches' | 'changed'; doc: TwinDoc; yourFingerprint: string }

/** Compare a picked file with the anchored fingerprints. Demo rule: the file name picks the document; edit markers mean it differs. */
export function compareFile(name: string, size: number): CheckResult {
  const key = DOC_KEYS.find(([re]) => re.test(name))?.[1]
  const doc = DOCS.find((d) => d.name === key) ?? DOCS[0]
  const changed = EDIT_MARK.test(name) || !key
  return { result: changed ? 'changed' : 'matches', doc, yourFingerprint: changed ? fingerprint(name, size) : doc.hash }
}

export interface CheckRecord { id: string; file: string; size: number; doc: string; result: 'matches' | 'changed'; fingerprint: string; at: string }

export interface Answer { kind: 'cited' | 'missing'; text: string; bold?: string; cites: string[]; marathi?: boolean }

/** Ask AI fixture logic: answers come only from the verified documents; anything else is a not-found. */
export function answerFor(q: string): Answer {
  const t = q.toLowerCase()
  if (/before 2015|previous|earlier|prior|history|shankar/.test(t))
    return { kind: 'cited', bold: 'Shankar Dattatray Kulkarni', text: 'Before 2015 the plot was held by {b}. Mutation entry 2291 records its sale to Prakash Kulkarni, and the sale deed is dated 12 March 2015.', cites: ['Mutation 2291 · p1', 'Sale deed · p2'], marathi: true }
  if (/owner|who owns|belongs|prakash/.test(t))
    return { kind: 'cited', bold: 'Prakash Kulkarni', text: 'The current owner is {b}, recorded since the sale deed of 12 March 2015 and Mutation entry 2291.', cites: ['7/12 extract · p1', 'Sale deed · p2'] }
  if (/area|size|sq|hectare|how big|large/.test(t))
    return { kind: 'cited', bold: '418 sq m (0.0418 ha)', text: 'The plot measures {b}, as stated in the 7/12 extract and the property card.', cites: ['7/12 extract · p1', 'Property card · p1'] }
  if (/gat|survey|village|where|location|taluka|district|gps/.test(t))
    return { kind: 'cited', bold: 'Gat 112/2', text: 'The plot is {b} in Village Kusgaon, Maval taluka, Pune district.', cites: ['7/12 extract · p1'] }
  if (/\bna\b|non[- ]?agri|zone|use/.test(t))
    return { kind: 'cited', bold: 'NA (non-agricultural)', text: 'The land use is {b}, as set by the NA order.', cites: ['NA order · p1'] }
  return { kind: 'missing', text: '', cites: [] }
}
export const MISSING_TEXT = 'None of the 5 verified documents mention a loan or mortgage. That does not mean there is none. Upload a bank NOC or ask your lawyer.'
export function missingText(q: string): string {
  return /loan|mortgage|bank|encumbr/i.test(q)
    ? MISSING_TEXT
    : 'None of the 5 verified documents answer this. That does not mean there is no answer. Upload a supporting document or ask your lawyer.'
}
