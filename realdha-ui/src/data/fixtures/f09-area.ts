/** F09 · Area view and list fixtures. Sample data only. */
export interface Area {
  name: string
  city: string
  avgPrice: number
  checked: number
  records: number
  signedOff: number
  onChain: number
  newLaunches: number
  clusters: { n: number; pos: string }[]
}
const POS = ['left-[140px] top-[120px]', 'left-[320px] top-[210px]', 'left-[520px] top-[90px]', 'left-[640px] top-[300px]', 'left-[230px] top-[340px]']
const c = (ns: number[]) => ns.map((n, i) => ({ n, pos: POS[i] }))
export const AREAS: Area[] = [
  { name: 'Baner', city: 'Pune', avgPrice: 11200, checked: 412, records: 142, signedOff: 96, onChain: 71, newLaunches: 6, clusters: c([24, 18, 9, 31, 6]) },
  { name: 'Balewadi', city: 'Pune', avgPrice: 10600, checked: 268, records: 97, signedOff: 61, onChain: 40, newLaunches: 4, clusters: c([12, 20, 7, 15, 5]) },
  { name: 'Aundh', city: 'Pune', avgPrice: 12100, checked: 305, records: 110, signedOff: 74, onChain: 52, newLaunches: 2, clusters: c([16, 22, 11, 19, 8]) },
  { name: 'Wakad', city: 'Pune', avgPrice: 9800, checked: 351, records: 126, signedOff: 80, onChain: 47, newLaunches: 9, clusters: c([21, 14, 17, 26, 10]) },
  { name: 'Hinjewadi', city: 'Pune', avgPrice: 8900, checked: 290, records: 104, signedOff: 66, onChain: 38, newLaunches: 7, clusters: c([13, 19, 8, 23, 9]) },
  { name: 'Kothrud', city: 'Pune', avgPrice: 13400, checked: 198, records: 73, signedOff: 55, onChain: 36, newLaunches: 1, clusters: c([10, 12, 6, 17, 4]) },
]
export const NEARBY_AREAS: Record<string, string[]> = {
  Baner: ['Balewadi', 'Aundh', 'Wakad'], Balewadi: ['Baner', 'Aundh', 'Wakad'], Aundh: ['Baner', 'Balewadi', 'Kothrud'],
  Wakad: ['Hinjewadi', 'Baner', 'Balewadi'], Hinjewadi: ['Wakad', 'Baner', 'Balewadi'], Kothrud: ['Aundh', 'Baner', 'Balewadi'],
}
export const areaByName = (n: string | null) => AREAS.find((a) => a.name.toLowerCase() === (n ?? '').toLowerCase()) ?? AREAS[0]

export interface Project { id: string; name: string; sub: string; area: string; status: 'checked' | 'new-launch'; priceRange: string; low: number; high: number }
export const PROJECTS: Project[] = [
  { id: 'RA-PUN-001-A', name: 'Baner Heights · 3 tower project', sub: 'Baner, Pune', area: 'Baner', status: 'checked', priceRange: '₹1.15 Cr to ₹1.9 Cr', low: 11500000, high: 19000000 },
  { id: 'RA-PUN-007-A', name: 'Skyline Residency · New launch', sub: 'Baner, Pune', area: 'Baner', status: 'new-launch', priceRange: '₹92 L to ₹1.4 Cr', low: 9200000, high: 14000000 },
  { id: 'RA-PUN-003-A', name: 'Balewadi Pool Court · 2 tower project', sub: 'Balewadi, Pune', area: 'Balewadi', status: 'checked', priceRange: '₹1.15 Cr to ₹1.58 Cr', low: 11500000, high: 15800000 },
  { id: 'RA-PUN-004-A', name: 'Wakad Greens · New launch', sub: 'Wakad, Pune', area: 'Wakad', status: 'new-launch', priceRange: '₹59 L to ₹89 L', low: 5900000, high: 8900000 },
  { id: 'RA-PUN-002-A', name: 'Hinjewadi Lake View · 2 tower project', sub: 'Hinjewadi, Pune', area: 'Hinjewadi', status: 'checked', priceRange: '₹84 L to ₹1.18 Cr', low: 8400000, high: 11800000 },
  { id: 'RA-PUN-016-A', name: 'Aundh Crest · 1 tower project', sub: 'Aundh, Pune', area: 'Aundh', status: 'checked', priceRange: '₹1.52 Cr', low: 15200000, high: 15200000 },
]
