export type Severity = 'high' | 'medium' | 'clear'

export interface QuoteLine { lang: 'mr' | 'en'; text: string }
export interface Quote { lines: QuoteLine[]; source: string }
export interface Comparison { label: string; value: string }

export interface Finding {
  id: 'A' | 'B' | 'C'
  severity: Severity
  title: string
  titleM: string
  /** Desktop description (when the frame has one). */
  body?: string
  /** Mobile summary line. */
  bodyM: string
  compare?: Comparison[]
  quotes: Quote[]
  quotesM: Quote[]
}

export const plot = {
  recordId: 'RA-LON-004-P-112-2',
  title: 'Plot · Gat 112/2 · Kusgaon',
  titleM: 'NA plot · Gat 112/2 · Kusgaon',
  owner: 'Prakash Kulkarni',
}

const q712area: Quote = {
  lines: [
    { lang: 'mr', text: 'एकूण क्षेत्र: ०.०४१८ हे.आर' },
    { lang: 'en', text: 'Total area: 0.0418 hectare' },
  ],
  source: '7/12 extract · page 1',
}
const qDraft: Quote = { lines: [{ lang: 'en', text: '"…admeasuring approximately 465 sq m…"' }], source: 'Draft agreement · page 1' }
const qMutation: Quote = {
  lines: [
    { lang: 'mr', text: 'फेरफार क्र. २२९१' },
    { lang: 'en', text: 'Mutation entry no. 2291' },
  ],
  source: '7/12 extract · page 2',
}

export const findings: Finding[] = [
  {
    id: 'A',
    severity: 'high',
    title: 'Area differs between documents',
    titleM: 'Area differs between documents',
    bodyM: '418 sq m on the 7/12, 465 sq m in the draft agreement.',
    compare: [
      { label: '7/12 extract', value: '0.0418 ha (418 sq m)' },
      { label: 'Draft agreement', value: '465 sq m' },
      { label: 'Difference', value: '47 sq m (11%)' },
    ],
    quotes: [q712area, qDraft],
    quotesM: [{ lines: [q712area.lines[0], qDraft.lines[0]], source: qDraft.source }],
  },
  {
    id: 'B',
    severity: 'medium',
    title: 'Mutation entry 2291 is missing',
    titleM: 'Mutation entry 2291 missing',
    body: 'The 7/12 cites this entry, but it was not uploaded, so the ownership chain cannot be confirmed.',
    bodyM: 'The 7/12 cites this entry, but it was not uploaded.',
    quotes: [qMutation],
    quotesM: [qMutation],
  },
  {
    id: 'C',
    severity: 'medium',
    title: 'Owner surname spelled two ways',
    titleM: 'Owner surname spelling',
    bodyM: 'Kulkarni on the 7/12, Kulkarny on the NA order.',
    compare: [
      { label: '7/12 extract', value: 'Kulkarni' },
      { label: 'NA order', value: 'Kulkarny' },
    ],
    quotes: [{ lines: [{ lang: 'mr', text: 'प्रकाश कुलकर्णी' }], source: '7/12 extract · page 1' }],
    quotesM: [{ lines: [{ lang: 'en', text: 'Owner: Prakash Kulkarny' }], source: 'NA order · page 2' }],
  },
]

export const counts = { high: 1, medium: 2, clear: 5 }
export const clearChecks = 'Gat number, village, land use, owner name and NA order validity.'
