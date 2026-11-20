import { useMemo } from 'react'
import {
  BHKS, DEFAULT_TOWERS, FACINGS, INITIAL_GRID, INITIAL_PICKER, INITIAL_PUBLISH, PROJECT_RECORD, SAMPLE_PLANS, SAMPLE_PROJECT,
  SEED_NO_FACING, SEED_STATUS, STATUSES, STATUS_LABEL,
  type Facing, type GridState, type PickerState, type PlanFile, type Plans, type Project, type PublishState, type Tower, type Unit, type UnitStatus,
} from '../data/fixtures/f10-project'
import { readShared, useSharedState, writeShared } from './shared-state'

/* ---------- formatting ---------- */
export const pad2 = (n: number) => String(n).padStart(2, '0')
export const inrFull = (n: number) => n.toLocaleString('en-IN')
const trim = (n: number) => String(Number(n.toFixed(2)))
export const inrShort = (n: number) => (n >= 1e7 ? `₹${trim(n / 1e7)} Cr` : n >= 1e5 ? `₹${trim(n / 1e5)} L` : `₹${inrFull(n)}`)
export const parseMoney = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0
export const recordId = (u: Pick<Unit, 'tower' | 'floor' | 'no'>) => `${PROJECT_RECORD}-${u.tower}-${pad2(u.floor)}-${pad2(u.no)}`
export const unitId = (tower: string, floor: number, no: number) => `${tower}-${floor}${pad2(no)}`
export const fileSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/* ---------- units ---------- */
function seedUnit(tower: string, floor: number, no: number): Unit {
  const id = unitId(tower, floor, no)
  const three = no % 2 === 1
  const u: Unit = {
    id, tower, floor, no,
    bhk: three ? '3 BHK' : '2 BHK',
    carpet: three ? 1180 : 860,
    facing: SEED_NO_FACING.includes(id) ? '' : FACINGS[(no - 1) % 4],
    price: three ? 14000000 : 9500000,
    status: SEED_STATUS[id] ?? 'available',
  }
  // Apartment A-1804 as the frames draw it in the edit panel and the stack picker.
  if (id === 'A-1804') Object.assign(u, { bhk: '3 BHK', carpet: 1180, facing: 'East' as Facing, price: 14200000 })
  return u
}

/** Units for a set of towers. Units that already exist keep their edits. */
export function generateUnits(towers: Tower[], prev: Unit[] = []): Unit[] {
  const had = new Map(prev.map((u) => [u.id, u]))
  const out: Unit[] = []
  for (const t of towers) {
    for (let f = t.floors; f >= 1; f--) {
      for (let n = 1; n <= t.perFloor; n++) out.push(had.get(unitId(t.name, f, n)) ?? seedUnit(t.name, f, n))
    }
  }
  return out
}

/* ---------- shared state hooks (f10.*) ---------- */
const EMPTY_UNITS: Unit[] = []
export const useProject = () => useSharedState<Project>('f10.project', SAMPLE_PROJECT)
export const useTowers = () => useSharedState<Tower[]>('f10.towers', DEFAULT_TOWERS)
export const useGrid = () => useSharedState<GridState>('f10.grid', INITIAL_GRID)
export const usePicker = () => useSharedState<PickerState>('f10.picker', INITIAL_PICKER)
export const usePlans = () => useSharedState<Plans>('f10.plans', SAMPLE_PLANS)
export const usePublish = () => useSharedState<PublishState>('f10.publish', INITIAL_PUBLISH)

/** `f10.units`. Until the visitor saves a change it is generated from the towers, so it is never empty. */
export function useUnits() {
  const [stored, setStored] = useSharedState<Unit[]>('f10.units', EMPTY_UNITS)
  const [towers] = useTowers()
  const units = useMemo(() => (stored.length ? stored : generateUnits(towers)), [stored, towers])
  const update = (fn: (u: Unit[]) => Unit[]) =>
    setStored((prev) => fn(prev.length ? prev : generateUnits(readShared('f10.towers', DEFAULT_TOWERS))))
  return [units, update] as const
}

/** Regenerate `f10.units` from `f10.towers` (keeps edits of units that still exist). */
export function syncUnits() {
  const towers = readShared<Tower[]>('f10.towers', DEFAULT_TOWERS)
  writeShared<Unit[]>('f10.units', (prev) => generateUnits(towers, prev), EMPTY_UNITS)
}

export const towerTotals = (towers: Tower[]) => ({
  floors: towers.reduce((s, t) => s + t.floors, 0),
  units: towers.reduce((s, t) => s + t.floors * t.perFloor, 0),
})

export function unitStats(units: Unit[]) {
  const released = units.filter((u) => u.status !== 'not-released')
  const avail = units.filter((u) => u.status === 'available')
  const pool = avail.length ? avail : released
  const prices = (pool.length ? pool : units).map((u) => u.price).filter((p) => p > 0)
  const cheapest = pool.reduce<Unit | null>((m, u) => (u.price > 0 && (!m || u.price < m.price) ? u : m), null)
  return {
    total: units.length,
    available: avail.length,
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
    cheapest,
    unpriced: units.filter((u) => !(u.price > 0)).length,
    noFacing: units.filter((u) => !u.facing).length,
    towers: new Set(units.map((u) => u.tower)).size,
    floors: new Set(units.map((u) => `${u.tower}${u.floor}`)).size,
  }
}

export const RERA_RE = /^P\d{11}$/
export const planCount = (p: Plans) => [p.floor, p.brochure, p.model].filter(Boolean).length

/** Put a file into the plan slot it belongs to. Returns the slot or null when the type is not accepted. */
export function planSlot(file: { name: string }, plans: Plans): keyof Plans | null {
  const n = file.name.toLowerCase()
  const ext = n.split('.').pop() ?? ''
  if (['glb', 'gltf', 'obj', 'usdz'].includes(ext)) return 'model'
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return null
  if (n.includes('brochure')) return 'brochure'
  if (n.includes('plan')) return 'floor'
  if (!plans.floor) return 'floor'
  if (!plans.brochure && ext === 'pdf') return 'brochure'
  return 'floor'
}
export const asPlan = (f: { name: string; size: number }): PlanFile => ({ name: f.name, size: fileSize(f.size) })

/* ---------- CSV ---------- */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++ } else quoted = false } else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim() !== '')) rows.push(row)
  return rows
}
const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
export const toCsv = (rows: string[][]) => rows.map((r) => r.map(q).join(',')).join('\n') + '\n'

export interface CsvTarget { key: string; label: string; required?: boolean }
export const CSV_TARGETS: CsvTarget[] = [
  { key: 'tower', label: 'Tower', required: true },
  { key: 'floor', label: 'Floor', required: true },
  { key: 'unit_no', label: 'Unit number', required: true },
  { key: 'bhk', label: 'Configuration' },
  { key: 'carpet', label: 'Carpet area (sq ft)' },
  { key: 'price', label: 'Price (₹)' },
  { key: 'facing', label: 'Facing' },
  { key: 'status', label: 'Status' },
]
const ALIAS: Record<string, string> = {
  tower: 'tower', building: 'tower', wing: 'tower', floor: 'floor', level: 'floor',
  unitno: 'unit_no', unit: 'unit_no', unitnumber: 'unit_no', flat: 'unit_no', flatno: 'unit_no',
  bhk: 'bhk', configuration: 'bhk', config: 'bhk', carpet: 'carpet', carpetarea: 'carpet', area: 'carpet',
  price: 'price', priceinr: 'price', cost: 'price', facing: 'facing', direction: 'facing', status: 'status',
}
/** Guess each CSV column's target field from its header. A target is used once. */
export function autoMap(headers: string[]): string[] {
  const used = new Set<string>()
  return headers.map((h) => {
    const k = ALIAS[h.toLowerCase().replace(/[^a-z0-9]/g, '')] ?? ''
    if (!k || used.has(k)) return ''
    used.add(k)
    return k
  })
}

export interface CsvFile { name: string; size: string; headers: string[]; rows: string[][]; map: string[]; imported?: number }
export interface CsvError { row: number; column: string; problem: string }
export interface CsvRow { row: number; tower: string; floor: number; no: number; bhk?: string; carpet?: number; price?: number; facing?: Facing | ''; status?: UnitStatus }
export const MAX_CSV_ROWS = 5000

export function makeCsv(name: string, size: string, grid: string[][]): CsvFile | string {
  if (grid.length < 2) return 'The file has no data rows.'
  if (grid.length - 1 > MAX_CSV_ROWS) return `The file has more than ${MAX_CSV_ROWS} rows.`
  const headers = grid[0].map((h) => h.trim())
  return { name, size, headers, rows: grid.slice(1), map: autoMap(headers) }
}

const num = (s: string) => (/^\d[\d,]*(\.\d+)?$/.test(s.trim()) ? Number(s.replace(/,/g, '')) : NaN)
const wholeNum = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN)

export function validateCsv(csv: CsvFile): { errors: CsvError[]; valid: CsvRow[]; missing: string[] } {
  const col = (key: string) => csv.map.indexOf(key)
  const idx = Object.fromEntries(CSV_TARGETS.map((t) => [t.key, col(t.key)])) as Record<string, number>
  const missing = CSV_TARGETS.filter((t) => t.required && idx[t.key] < 0).map((t) => t.label)
  if (missing.length) return { errors: [], valid: [], missing }
  const errors: CsvError[] = []
  const valid: CsvRow[] = []
  const seen = new Map<string, number>()
  const head = (key: string) => csv.headers[idx[key]]
  csv.rows.forEach((r, i) => {
    const n = i + 1
    const get = (key: string) => (idx[key] >= 0 ? (r[idx[key]] ?? '').trim() : '')
    const bad: CsvError[] = []
    const need = (key: string, label: string, parse: (s: string) => number) => {
      const v = get(key)
      if (v === '') { bad.push({ row: n, column: head(key), problem: `${label} is empty` }); return NaN }
      const x = parse(v)
      if (!Number.isFinite(x) || x <= 0) bad.push({ row: n, column: head(key), problem: Number.isFinite(x) ? 'Must be more than 0' : `Not a number: "${v}"` })
      return x
    }
    const tower = get('tower')
    if (!tower) bad.push({ row: n, column: head('tower'), problem: 'Tower is empty' })
    const floor = need('floor', 'Floor', wholeNum)
    const no = need('unit_no', 'Unit number', wholeNum)
    let bhk: string | undefined
    if (get('bhk')) {
      const m = /^([1-6])(\s*bhk)?$/i.exec(get('bhk'))
      if (m) bhk = `${m[1]} BHK`
      else bad.push({ row: n, column: head('bhk'), problem: 'Allowed: 1 BHK to 6 BHK' })
    }
    let carpet: number | undefined
    if (idx.carpet >= 0) { const c = need('carpet', 'Carpet area', num); if (Number.isFinite(c)) carpet = c }
    let price: number | undefined
    if (idx.price >= 0) { const p = need('price', 'Price', num); if (Number.isFinite(p)) price = p }
    let facing: Facing | '' | undefined
    if (get('facing')) {
      const f = FACINGS.find((x) => x.toLowerCase() === get('facing').toLowerCase())
      if (f) facing = f
      else bad.push({ row: n, column: head('facing'), problem: 'Allowed: East, West, North, South' })
    }
    let status: UnitStatus | undefined
    if (get('status')) {
      const s = STATUSES.find((x) => STATUS_LABEL[x].toLowerCase() === get('status').toLowerCase().replace(/-/g, ' '))
      if (s) status = s
      else bad.push({ row: n, column: head('status'), problem: 'Allowed: Available, Booked, Sold, Not released' })
    }
    if (tower && Number.isFinite(floor) && Number.isFinite(no)) {
      const key = `${tower.toUpperCase()}|${floor}|${no}`
      const first = seen.get(key)
      if (first !== undefined) bad.push({ row: n, column: head('unit_no'), problem: `Duplicate of row ${first}` })
      else seen.set(key, n)
    }
    if (bad.length) errors.push(...bad)
    else valid.push({ row: n, tower: tower.toUpperCase(), floor, no, bhk, carpet, price, facing, status })
  })
  return { errors, valid, missing }
}

/** Merge validated CSV rows into the units; unknown units are added, unknown towers too. */
export function importRows(rows: CsvRow[]) {
  writeShared<Unit[]>('f10.units', (prev) => {
    const base = prev.length ? prev : generateUnits(readShared('f10.towers', DEFAULT_TOWERS))
    const map = new Map(base.map((u) => [u.id, u]))
    for (const r of rows) {
      const id = unitId(r.tower, r.floor, r.no)
      const cur = map.get(id) ?? seedUnit(r.tower, r.floor, r.no)
      map.set(id, {
        ...cur,
        bhk: r.bhk && BHKS.includes(r.bhk) ? r.bhk : r.bhk ?? cur.bhk,
        carpet: r.carpet ?? cur.carpet,
        price: r.price ?? cur.price,
        facing: r.facing ?? cur.facing,
        status: r.status ?? cur.status,
      })
    }
    const all = [...map.values()]
    writeShared<Tower[]>('f10.towers', (towers) => {
      const next = [...towers]
      for (const name of new Set(all.map((u) => u.tower))) {
        const mine = all.filter((u) => u.tower === name)
        const floors = Math.max(...mine.map((u) => u.floor))
        const perFloor = Math.max(...mine.map((u) => u.no))
        const i = next.findIndex((t) => t.name === name)
        if (i < 0) next.push({ name, floors, perFloor })
        else next[i] = { ...next[i], floors: Math.max(next[i].floors, floors), perFloor: Math.max(next[i].perFloor, perFloor) }
      }
      return next
    }, DEFAULT_TOWERS)
    const towerOrder = readShared<Tower[]>('f10.towers', DEFAULT_TOWERS).map((t) => t.name)
    return all.sort((a, b) => towerOrder.indexOf(a.tower) - towerOrder.indexOf(b.tower) || b.floor - a.floor || a.no - b.no)
  }, EMPTY_UNITS)
}

export const CSV_HEADERS = ['tower', 'floor', 'unit_no', 'bhk', 'carpet', 'price', 'facing', 'status', 'remarks']
export const csvRow = (u: Unit) => [u.tower, String(u.floor), String(u.no), u.bhk, String(u.carpet), String(u.price), u.facing, STATUS_LABEL[u.status], '']

/** The sample file behind the drawn state: 336 rows, 9 columns, 3 errors (rows 14, 29, 57). */
export function sampleCsv(): CsvFile {
  const rows = generateUnits(DEFAULT_TOWERS).sort((a, b) => a.tower.localeCompare(b.tower) || b.floor - a.floor || a.no - b.no).slice(0, 336).map(csvRow)
  rows[13][5] = '1.4 Cr'
  rows[28][0] = rows[11][0]; rows[28][1] = rows[11][1]; rows[28][2] = rows[11][2]
  rows[56][6] = 'Northeast'
  const file = makeCsv('units_baner_heights.csv', '', [CSV_HEADERS, ...rows]) as CsvFile
  return file
}

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
