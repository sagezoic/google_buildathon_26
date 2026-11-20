export interface Ticker {
  id: string
  name: string
  meta: string
  price: string
  pct: number
  spark: number[]
}

/** 1440 / 834 grid (GP-21). */
export const TICKERS: Ticker[] = [
  { id: 'RA-LON-004-P-112-2', name: 'Kusgaon Plot 112/2', meta: 'Lonavala · Plot', price: '1,250.00', pct: 1.84, spark: [20, 18, 21, 16, 17, 12, 13, 6] },
  { id: 'RA-PUN-001-A-18-04', name: 'Baner Tower A 1804', meta: 'Pune · Apartment', price: '8,420.00', pct: -0.62, spark: [6, 8, 7, 14, 12, 20, 18, 24] },
  { id: 'RA-PUN-002-B-07-02', name: 'Hinjewadi B 0702', meta: 'Pune · Apartment', price: '6,310.50', pct: 0.93, spark: [22, 20, 21, 16, 18, 12, 14, 9] },
  { id: 'RA-MUM-003-C-14-01', name: 'Bandra Shop 14', meta: 'Mumbai · Commercial', price: '21,500.00', pct: 2.41, spark: [24, 22, 18, 19, 12, 10, 8, 4] },
  { id: 'RA-MUM-007-C-11-03', name: 'Powai C 1103', meta: 'Mumbai · Apartment', price: '15,890.00', pct: -1.18, spark: [5, 7, 6, 12, 14, 18, 17, 25] },
  { id: 'RA-BLR-002-A-09-04', name: 'Whitefield A 0904', meta: 'Bengaluru · Apartment', price: '7,120.00', pct: 0.35, spark: [16, 18, 15, 17, 14, 15, 12, 12] },
  { id: 'RA-ALI-001-P-45-1', name: 'Alibag Plot 45', meta: 'Alibag · Plot', price: '980.00', pct: 3.12, spark: [26, 24, 22, 20, 16, 12, 8, 3] },
  { id: 'RA-GUR-004-O-07-00', name: 'Gurugram Office 7F', meta: 'Gurugram · Commercial', price: '12,040.00', pct: -0.27, spark: [10, 9, 12, 10, 14, 13, 15, 16] },
  { id: 'RA-PUN-006-D-15-06', name: 'Wakad D 1506', meta: 'Pune · Apartment', price: '5,870.00', pct: 0, spark: [16, 17, 15, 16, 16, 15, 16, 16] },
  { id: 'RA-NAS-002-P-88-1', name: 'Nashik Land 88', meta: 'Nashik · Plot', price: '430.00', pct: -2.05, spark: [4, 6, 9, 8, 14, 18, 20, 27] },
  { id: 'RA-THA-005-E-22-01', name: 'Thane E 2201', meta: 'Thane · Apartment', price: '9,360.00', pct: 1.12, spark: [20, 22, 18, 19, 14, 15, 11, 8] },
  { id: 'RA-PUN-008-S-03-00', name: 'Kothrud Shop 3', meta: 'Pune · Commercial', price: '9,980.00', pct: -0.44, spark: [8, 10, 9, 12, 13, 15, 14, 18] },
]

export const GAINERS = [
  { name: 'Alibag Plot 45', pct: 3.12 },
  { name: 'Bandra Shop 14', pct: 2.41 },
  { name: 'Kusgaon Plot 112/2', pct: 1.84 },
]
export const LOSERS = [
  { name: 'Nashik Land 88', pct: -2.05 },
  { name: 'Powai C 1103', pct: -1.18 },
  { name: 'Baner Tower A 1804', pct: -0.62 },
]

export interface MobileTicker {
  id: string
  name: string
  price: string
  pct: number
}

/** 834 / 390 grid, where the frame's copy differs from 1440. */
export const MOBILE_TICKERS: MobileTicker[] = [
  { id: 'RA-LON-004-P', name: 'Kusgaon NA plot', price: '5,120', pct: 2.4 },
  { id: 'RA-PUN-001-A', name: 'A-1804 Baner', price: '28,400', pct: -0.8 },
  { id: 'RA-PUN-003-A', name: 'A-0701 Balewadi', price: '26,100', pct: 1.2 },
  { id: 'RA-PUN-004-A', name: 'A-2106 Wakad', price: '22,900', pct: 3.1 },
  { id: 'RA-ALI-001-P', name: 'Alibag plot 45', price: '7,800', pct: -1.9 },
  { id: 'RA-PUN-008-S', name: 'Kothrud shop 03', price: '41,000', pct: 0.4 },
  { id: 'RA-PUN-006-D', name: 'Flat 902 Wakad', price: '21,700', pct: -0.3 },
  { id: 'RA-NSK-002-P', name: 'Nashik plot 12', price: '3,950', pct: 1.7 },
  { id: 'RA-PUN-002-A', name: 'B-0902 Skyline', price: '24,300', pct: 2.0 },
  { id: 'RA-MUM-001-A', name: 'Powai 14-03', price: '62,500', pct: -2.2 },
  { id: 'RA-PUN-011-C', name: 'Hinjewadi office', price: '38,200', pct: 0.9 },
  { id: 'RA-LON-007-P', name: 'Lonavala plot 9', price: '6,400', pct: -0.6 },
]
export const MOBILE_GAINERS = [
  { name: 'A-2106 Wakad', pct: 3.1 },
  { name: 'Kusgaon plot', pct: 2.4 },
  { name: 'B-0902', pct: 2.0 },
]
export const MOBILE_LOSERS = [
  { name: 'Powai 14-03', pct: -2.2 },
  { name: 'Alibag plot', pct: -1.9 },
  { name: 'A-1804', pct: -0.8 },
]

/** Sample rows kept for the Watchlist tab. */
export const WATCHLIST_IDS = ['RA-LON-004-P-112-2', 'RA-PUN-001-A-18-04']
export const WATCHLIST_MOBILE_IDS = ['RA-LON-004-P', 'RA-PUN-001-A']

export const CITIES = ['Lonavala', 'Pune', 'Mumbai', 'Bengaluru', 'Alibag', 'Gurugram', 'Nashik', 'Thane']
export const TYPES = ['Plot', 'Apartment', 'Commercial']

/** GP-22 chart, 1M. */
export const SERIES_1M = [1200, 1204, 1202, 1212, 1210, 1222, 1218, 1232, 1228, 1242, 1238, 1250, 1253, 1258, 1260]

export interface AdminTx {
  record: string
  type: string
  hash: string
  status: 'confirmed' | 'failed' | 'pending'
  reason?: string
  time: string
}
export const ADMIN_TX: AdminTx[] = [
  { record: 'RA-LON-004-P-112-2', type: 'Mint · 1,000 units', hash: '0xc4a1…19d2', status: 'confirmed', time: '14:45' },
  { record: 'RA-LON-004-P-112-2', type: 'Mint · 1,000 units', hash: '0x77ef…a031', status: 'failed', reason: 'gas low', time: '14:41' },
  { record: 'RA-LON-004-P-112-2', type: 'Anchor · 5 fingerprints', hash: '0x5b7d…e904', status: 'confirmed', time: '14:32' },
  { record: 'RA-PUN-002-B-07-02', type: 'Anchor · 4 fingerprints', hash: '0x3d02…f6a8', status: 'failed', reason: 'timeout', time: '13:10' },
  { record: 'RA-PUN-001-A-18-04', type: 'Anchor · 5 fingerprints', hash: '0xa90b…5e11', status: 'pending', time: '12:58' },
  { record: 'RA-MUM-003-C-14-01', type: 'Mint · 500 units', hash: '0x82c7…0b4d', status: 'confirmed', time: '11:20' },
]
export const ADMIN_TX_MOBILE = [
  { record: 'RA-LON-004-P-112-2', status: 'confirmed', kind: 'Mint', time: '15:12', hash: '0x5b7d…e904' },
  { record: 'RA-PUN-001-A-18-04', status: 'confirmed', kind: 'Anchor', time: '11:04', hash: '0x90cd…7e2a' },
  { record: 'RA-PUN-011-C-02-03', status: 'failed', kind: 'Mint', time: '10:41', hash: '0xaa31…02de' },
] as const

export const AUDIT_EVENTS = [
  { title: 'Mint failed · gas balance too low', meta: '20 Nov 14:41:08 · system', bad: true },
  { title: 'Mint submitted', meta: '20 Nov 14:41:02 · owner Prakash Kulkarni' },
  { title: 'Risk acknowledgement recorded', meta: '20 Nov 14:40:51 · owner' },
  { title: 'Anchored · 5 fingerprints', meta: '20 Nov 14:32:19 · system' },
  { title: 'Lawyer signed off', meta: '20 Nov 14:10:44 · Adv. Meera Joshi' },
]

/** Sample transaction history behind the 63 in the admin console: the 6 drawn rows first, then a deterministic backlog. */
const BACKLOG_TYPES = ['Anchor · 5 fingerprints', 'Mint · 500 units', 'Anchor · 4 fingerprints', 'Mint · 1,000 units', 'Anchor · 3 fingerprints']
const hex = (n: number) => ((n * 2654435761) >>> 0).toString(16).padStart(8, '0')
const BACKLOG: AdminTx[] = Array.from({ length: 57 }, (_, i) => {
  const mins = 11 * 60 + 20 - (i + 1) * 17
  const status: AdminTx['status'] = i % 9 === 4 ? 'failed' : i % 13 === 7 ? 'pending' : 'confirmed'
  return {
    record: TICKERS[(i + 2) % TICKERS.length].id,
    type: BACKLOG_TYPES[i % BACKLOG_TYPES.length],
    hash: `0x${hex(i + 11).slice(0, 4)}…${hex(i + 97).slice(4)}`,
    status,
    reason: status === 'failed' ? (i % 2 ? 'timeout' : 'gas low') : undefined,
    time: `${String(Math.floor((((mins % 1440) + 1440) % 1440) / 60)).padStart(2, '0')}:${String((((mins % 60) + 60) % 60)).padStart(2, '0')}`,
  }
})
export const ADMIN_TX_ALL: AdminTx[] = [...ADMIN_TX, ...BACKLOG]

export type Range = '1D' | '1W' | '1M' | '1Y' | 'All'
export const RANGES: readonly Range[] = ['1D', '1W', '1M', '1Y', 'All']
const POINTS: Record<Range, number> = { '1D': 24, '1W': 14, '1M': 15, '1Y': 12, All: 16 }
/** Change over each range, in percent, used to anchor the start of the sample series. */
const RANGE_PCT: Record<Range, number> = { '1D': 1.84, '1W': 2.1, '1M': 4.17, '1Y': -0.8, All: 12.5 }
export const X_LABELS: Record<Range, string[]> = {
  '1D': ['09:00', '12:00', '15:00', 'Now'],
  '1W': ['14 Nov', '16 Nov', '18 Nov', '20 Nov'],
  '1M': ['20 Oct', '30 Oct', '9 Nov', '20 Nov'],
  '1Y': ['Nov 2025', 'Mar 2026', 'Jul 2026', 'Nov 2026'],
  All: ['2023', '2024', '2025', '2026'],
}

/** Deterministic sample price series for a ticker and range. The Kusgaon plot's 1M series is the one drawn in the frame. */
export function seriesFor(id: string, price: number, range: Range): number[] {
  if (id === TICKERS[0].id && range === '1M') return SERIES_1M
  let seed = 0
  for (const c of id + range) seed = (seed * 31 + c.charCodeAt(0)) >>> 0
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32 - 0.5)
  const n = POINTS[range]
  const start = price / (1 + RANGE_PCT[range] / 100)
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const noise = i === 0 || i === n - 1 ? 0 : rnd() * 0.012 * price
    return +(start + (price - start) * t + noise).toFixed(2)
  })
}
