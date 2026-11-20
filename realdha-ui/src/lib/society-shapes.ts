// Approximate society footprints for the 3D map, ported from Flat Finder (pipeline/build_city.py + geo.py).
// Shapes are illustrative, not survey data: a site circle sized from acres, with towers spread inside it.
import type { FeatureCollection, Point, Polygon } from 'geojson'
import type { SocietyCard } from './flats-api'

type Pos = [number, number] // [lng, lat]
type Ring = Pos[]

const M_PER_DEG_LAT = 111_320
const TOWER_H = 55 // visual default height (m) for apartment towers
const mPerDegLng = (lat: number) => M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)
const r6 = (n: number) => Math.round(n * 1e6) / 1e6

export type GeoSociety = SocietyCard & { lat: number; lng: number }
export const hasCoords = (s: SocietyCard): s is GeoSociety => typeof s.lat === 'number' && typeof s.lng === 'number'

/** Deterministic PRNG (mulberry32) seeded from the society id, so towers do not jump between renders. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353) << 13 | h >>> 19
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const distM = (a: Pos, b: Pos) => Math.hypot((a[0] - b[0]) * mPerDegLng((a[1] + b[1]) / 2), (a[1] - b[1]) * M_PER_DEG_LAT)

function circle([lng, lat]: Pos, radius: number, n = 24): Ring {
  const k = mPerDegLng(lat)
  const ring: Ring = Array.from({ length: n }, (_, i) => [
    r6(lng + (radius * Math.cos((2 * Math.PI * i) / n)) / k),
    r6(lat + (radius * Math.sin((2 * Math.PI * i) / n)) / M_PER_DEG_LAT),
  ])
  return [...ring, ring[0]]
}

export function rect([lng, lat]: Pos, w: number, d: number, angle: number): Ring {
  const k = mPerDegLng(lat)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const pts = ([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]] as Pos[]).map(([dx, dy]): Pos => [
    r6(lng + (dx * c - dy * s) / k),
    r6(lat + (dx * s + dy * c) / M_PER_DEG_LAT),
  ])
  return [...pts, pts[0]]
}

function inRing([x, y]: Pos, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-15) + xi) inside = !inside
  }
  return inside
}

/** Spread `count` tower footprints inside `ring` by farthest-point sampling from a seeded start. */
function generateTowers(ring: Ring, count: number, seed: string, w: number, d: number): Ring[] {
  const rnd = rng(seed)
  const xs = ring.map((p) => p[0])
  const ys = ring.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const k = mPerDegLng((y0 + y1) / 2)
  const cands: Pos[] = []
  for (let y = y0; y <= y1; y += 12 / M_PER_DEG_LAT) {
    for (let x = x0; x <= x1; x += 12 / k) if (inRing([x, y], ring)) cands.push([x, y])
  }
  if (!cands.length) cands.push([(x0 + x1) / 2, (y0 + y1) / 2])
  const chosen: Pos[] = [cands[Math.floor(rnd() * cands.length)]]
  while (chosen.length < count) {
    let best = cands[0]
    let bestD = -1
    for (const c of cands) {
      const dm = Math.min(...chosen.map((q) => distM(c, q)))
      if (dm > bestD) { best = c; bestD = dm }
    }
    if (bestD < 10) break // site too small for more
    chosen.push(best)
  }
  const angle = rnd() * (Math.PI / 2)
  return chosen.map((c) => rect(c, w, d, angle))
}

export interface SocietyShapes {
  points: FeatureCollection<Point>
  shapes: FeatureCollection<Polygon>
}

export function generateShapes(societies: GeoSociety[]): SocietyShapes {
  const points: SocietyShapes['points']['features'] = []
  const shapes: SocietyShapes['shapes']['features'] = []
  for (const s of societies) {
    const center: Pos = [s.lng, s.lat]
    points.push({ type: 'Feature', id: s.id, properties: { sid: s.id, name: s.name }, geometry: { type: 'Point', coordinates: center } })
    const acres = s.acres ?? 0
    const r = acres > 0 && acres < 200 ? Math.sqrt((acres * 4047) / Math.PI) : acres >= 200 ? 120 : Math.sqrt((3 * 4047) / Math.PI)
    const site = circle(center, Math.max(40, Math.min(r, 400)))
    shapes.push({ type: 'Feature', id: `${s.id}:site`, properties: { sid: s.id, role: 'site' }, geometry: { type: 'Polygon', coordinates: [site] } })
    const kind = (s.kind ?? '').toLowerCase()
    if (kind === 'plot') continue
    const tall = kind === 'apartment' || kind === ''
    const n = Math.round(s.towers ?? 0) || (tall ? Math.max(2, Math.min(12, Math.round((s.units ?? 300) / 120))) : 8)
    const [w, d] = tall ? [24, 18] : [12, 10]
    generateTowers(site, n, s.id, w, d).forEach((t, i) => {
      shapes.push({ type: 'Feature', id: `${s.id}:b${i}`, properties: { sid: s.id, role: 'bld', h: tall ? TOWER_H : 10 }, geometry: { type: 'Polygon', coordinates: [t] } })
    })
  }
  return {
    points: { type: 'FeatureCollection', features: points },
    shapes: { type: 'FeatureCollection', features: shapes },
  }
}
