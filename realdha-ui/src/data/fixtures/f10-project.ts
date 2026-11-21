/** F10 · New units. Sample project, towers and launches, taken from the frames. */

export const PROJECT_RECORD = 'RA-PUN-001'
export const DEVELOPER = 'Sahyadri Developers'

export interface Pin { x: number; y: number; lat?: number; lng?: number }
export interface Project {
  name: string
  rera: string
  city: string
  locality: string
  possession: string
  description: string
  /** Pin position on the map. */
  pin: Pin
  boundary?: [number, number][]
  savedAt: number | null
}
export const SAMPLE_PROJECT: Project = {
  name: 'Baner Heights',
  rera: 'P52100012345',
  city: 'Pune',
  locality: 'Baner',
  possession: 'Dec 2027',
  description: 'Two towers, 3 and 4 BHK.',
  pin: { x: 10, y: 9, lat: 18.559, lng: 73.7868 },
  boundary: [
    [73.7858, 18.5582],
    [73.7878, 18.5585],
    [73.7874, 18.5598],
    [73.7854, 18.5594],
  ],
  savedAt: null,
}

export interface Tower { name: string; floors: number; perFloor: number }
export const DEFAULT_TOWERS: Tower[] = [
  { name: 'A', floors: 24, perFloor: 6 },
  { name: 'B', floors: 24, perFloor: 6 },
  { name: 'C', floors: 18, perFloor: 4 },
]

export type Facing = 'East' | 'West' | 'North' | 'South'
export const FACINGS: Facing[] = ['East', 'West', 'North', 'South']
export type UnitStatus = 'available' | 'booked' | 'sold' | 'not-released'
export const STATUS_LABEL: Record<UnitStatus, string> = { available: 'Available', booked: 'Booked', sold: 'Sold', 'not-released': 'Not released' }
export const STATUS_LETTER: Record<UnitStatus, string> = { available: 'A', booked: 'B', sold: 'S', 'not-released': 'N' }
export const STATUSES: UnitStatus[] = ['available', 'booked', 'sold', 'not-released']
export const BHKS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK']

export interface Unit {
  id: string
  tower: string
  floor: number
  no: number
  bhk: string
  carpet: number
  /** Empty string = not set yet. */
  facing: Facing | ''
  price: number
  status: UnitStatus
}

/** Units the frames draw as sold, booked or without a facing. Everything else starts available. */
export const SEED_STATUS: Record<string, UnitStatus> = {
  'A-2005': 'sold', 'A-1901': 'sold', 'A-1906': 'sold', 'A-1802': 'sold', 'A-1703': 'sold',
  'A-1602': 'booked', 'A-1503': 'booked', 'A-1204': 'not-released',
}
export const SEED_NO_FACING = ['C-1801', 'C-1802', 'C-1803']

export interface PlanFile { name: string; size: string }
export interface Plans { floor: PlanFile | null; brochure: PlanFile | null; model: PlanFile | null }
export const SAMPLE_PLANS: Plans = {
  floor: { name: 'tower-a-floor-plan.pdf', size: '1.2 MB' },
  brochure: { name: 'baner-heights-brochure.pdf', size: '3.4 MB' },
  model: null,
}

export type PublishStage = 'review' | 'approvals' | 'anchor' | 'published'
export interface PublishState {
  stage: PublishStage
  signoffAt: number | null
  lawyerOk: boolean
  publishedAt: number | null
  tx: string | null
  records: number
}
export const INITIAL_PUBLISH: PublishState = { stage: 'review', signoffAt: null, lawyerOk: false, publishedAt: null, tx: null, records: 0 }

/** New-launch feed. Prices are rupees; `bhks` drive the BHK filter. */
export interface Launch {
  id: string
  name: string
  locality: string
  city: string
  min: number
  max: number
  bhks: number[]
  launched: string
}
export const LAUNCHES: Launch[] = [
  { id: 'skyline', name: 'Skyline Residency', locality: 'Baner', city: 'Pune', min: 9200000, max: 14000000, bhks: [2, 3], launched: '18 Nov 2026' },
  { id: 'baner-2', name: 'Baner Heights Phase 2', locality: 'Baner', city: 'Pune', min: 11500000, max: 19000000, bhks: [2, 3, 4], launched: '12 Nov 2026' },
  { id: 'lakeview', name: 'Lakeview Towers', locality: 'Hinjewadi', city: 'Pune', min: 7800000, max: 11000000, bhks: [1, 2], launched: '5 Nov 2026' },
  { id: 'green', name: 'Green Arcade', locality: 'Wakad', city: 'Pune', min: 8500000, max: 12000000, bhks: [2, 3], launched: '1 Nov 2026' },
  { id: 'orchid-sq', name: 'Orchid Square', locality: 'Kothrud', city: 'Pune', min: 13000000, max: 21000000, bhks: [3, 4], launched: '28 Oct 2026' },
  { id: 'palm', name: 'Palm Court', locality: 'Aundh', city: 'Pune', min: 11000000, max: 16000000, bhks: [2, 3], launched: '22 Oct 2026' },
]

/** The phone frame lists three other projects with their own record IDs and phases. */
export interface MobileLaunch { id: string; record: string; name: string; locality: string; city: string; min: number; bhks: number[]; phase: 'pre-launch' | 'open' }
export const MOBILE_LAUNCHES: MobileLaunch[] = [
  { id: 'lakeview-res', record: 'RA-PUN-004', name: 'Lakeview Residency', locality: 'Wakad', city: 'Pune', min: 7800000, bhks: [1, 2], phase: 'pre-launch' },
  { id: 'orchid-park', record: 'RA-PUN-009', name: 'Orchid Park', locality: 'Hinjewadi', city: 'Pune', min: 6400000, bhks: [1, 2], phase: 'open' },
  { id: 'terraces', record: 'RA-PUN-011', name: 'The Terraces', locality: 'Kothrud', city: 'Pune', min: 11000000, bhks: [3, 4], phase: 'pre-launch' },
]

export const BUDGETS = [
  { id: 'any', label: 'Budget', lo: 0, hi: Infinity },
  { id: 'u1', label: 'Under ₹1 Cr', lo: 0, hi: 9999999 },
  { id: 'm', label: '₹1 Cr to ₹1.5 Cr', lo: 10000000, hi: 15000000 },
  { id: 'o', label: 'Above ₹1.5 Cr', lo: 15000001, hi: Infinity },
] as const
export interface LaunchFilters { city: string; budget: string; bhk: string }
export const INITIAL_FILTERS: LaunchFilters = { city: 'Pune', budget: 'any', bhk: 'any' }

export interface PickerState { tower: string; floor: number; selected: string }
export const INITIAL_PICKER: PickerState = { tower: 'A', floor: 18, selected: 'A-1804' }
export interface GridState { tower: string; selected: string }
export const INITIAL_GRID: GridState = { tower: 'A', selected: 'A-1804' }
