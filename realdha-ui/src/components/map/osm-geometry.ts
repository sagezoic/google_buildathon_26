/**
 * Geodesic geometry and area calculation utilities for OpenStreetMap components.
 * Supports standard area units in India: sq ft, sq m, guntha, and acre.
 */

export type AreaUnit = 'sqft' | 'sqm' | 'guntha' | 'acre'

export type LngLat = [number, number] // [lng, lat] (GeoJSON standard)

export interface GeoPoint {
  lng: number
  lat: number
}

export const AREA_UNITS: ReadonlyArray<{ value: AreaUnit; label: string; sqm: number }> = [
  { value: 'sqft', label: 'sq ft', sqm: 0.092903 },
  { value: 'sqm', label: 'sq m', sqm: 1 },
  { value: 'guntha', label: 'guntha', sqm: 101.17 },
  { value: 'acre', label: 'acre', sqm: 4046.86 },
]

const R = 6378137 // Earth radius in meters (WGS84)
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

export const toLngLat = (p: GeoPoint | LngLat): LngLat =>
  Array.isArray(p) ? [p[0], p[1]] : [p.lng, p.lat]

export const toGeoPoint = (p: GeoPoint | LngLat): GeoPoint =>
  Array.isArray(p) ? { lng: p[0], lat: p[1] } : { lng: p.lng, lat: p.lat }

/**
 * Spherical Haversine distance in meters between two coordinates.
 */
export function distMeters(a: GeoPoint | LngLat, b: GeoPoint | LngLat): number {
  const [lng1, lat1] = toLngLat(a)
  const [lng2, lat2] = toLngLat(b)

  const dLat = (lat2 - lat1) * DEG2RAD
  const dLng = (lng2 - lng1) * DEG2RAD
  const lat1R = lat1 * DEG2RAD
  const lat2R = lat2 * DEG2RAD

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Spherical polygon area in square meters using spherical excess formula.
 * Ring should be a list of coordinates (can be closed or open).
 */
export function sphericalPolygonArea(ring: (GeoPoint | LngLat)[]): number {
  if (ring.length < 3) return 0

  const pts: LngLat[] = ring.map(toLngLat)
  // Ensure closed ring for loop
  const coords =
    pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]
      ? pts
      : [...pts, pts[0]]

  if (coords.length < 4) return 0

  let total = 0
  const len = coords.length - 1

  for (let i = 0; i < len; i++) {
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const lam1 = p1[0] * DEG2RAD
    const lam2 = p2[0] * DEG2RAD
    const phi1 = p1[1] * DEG2RAD
    const phi2 = p2[1] * DEG2RAD

    total += (lam2 - lam1) * (2 + Math.sin(phi1) + Math.sin(phi2))
  }

  const area = Math.abs((total * R * R) / 4)
  return Math.round(area * 100) / 100
}

/**
 * Converts area in square meters to specified unit.
 */
export function sqmToUnit(sqm: number, unit: AreaUnit): number {
  const factor = AREA_UNITS.find((u) => u.value === unit)?.sqm ?? 1
  return sqm / factor
}

/**
 * Converts area in specified unit to square meters.
 */
export function unitToSqm(value: number, unit: AreaUnit): number {
  const factor = AREA_UNITS.find((u) => u.value === unit)?.sqm ?? 1
  return value * factor
}

/**
 * Formats square meters in a given unit with localized number formatting.
 */
export function formatArea(sqm: number, unit: AreaUnit): string {
  const val = sqmToUnit(sqm, unit)
  const u = AREA_UNITS.find((x) => x.value === unit)
  const formatted =
    val >= 100
      ? Math.round(val).toLocaleString('en-IN')
      : +(Math.round(val * 100) / 100).toFixed(2)

  return `${formatted} ${u?.label ?? unit}`
}

/**
 * Calculates midpoint between two coordinates.
 */
export function midpoint(a: GeoPoint | LngLat, b: GeoPoint | LngLat): LngLat {
  const [lng1, lat1] = toLngLat(a)
  const [lng2, lat2] = toLngLat(b)
  return [(lng1 + lng2) / 2, (lat1 + lat2) / 2]
}

/**
 * Computes bounding box [[minLng, minLat], [maxLng, maxLat]] for a collection of points.
 */
export function boundsFromCoords(points: (GeoPoint | LngLat)[]): [[number, number], [number, number]] | null {
  if (!points.length) return null
  const pts = points.map(toLngLat)
  let minLng = pts[0][0]
  let maxLng = pts[0][0]
  let minLat = pts[0][1]
  let maxLat = pts[0][1]

  for (let i = 1; i < pts.length; i++) {
    const [lng, lat] = pts[i]
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/**
 * Computes centroid point of a polygon ring.
 */
export function centroid(points: (GeoPoint | LngLat)[]): LngLat {
  if (!points.length) return [0, 0]
  const pts = points.map(toLngLat)
  let sumLng = 0
  let sumLat = 0
  const n = pts.length

  for (const [lng, lat] of pts) {
    sumLng += lng
    sumLat += lat
  }

  return [sumLng / n, sumLat / n]
}

/**
 * Generates an illustrative rectangular polygon given a center point, target area, and unit.
 * Default aspect ratio 4:3 with slight orientation angle.
 */
export function generateRectPolygon(
  center: GeoPoint | LngLat,
  areaValue: number,
  unit: AreaUnit,
  angleRad = (-6 * Math.PI) / 180
): LngLat[] {
  const sqm = unitToSqm(areaValue, unit)
  if (sqm <= 0) return []

  const [clng, clat] = toLngLat(center)
  const ratio = 4 / 3
  const w = Math.sqrt(sqm * ratio)
  const d = sqm / w

  const mPerDegLat = 111320
  const k = mPerDegLat * Math.cos(clat * DEG2RAD)
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  const halfW = w / 2
  const halfD = d / 2

  const corners: [number, number][] = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [halfW, halfD],
    [-halfW, halfD],
  ]

  const ring: LngLat[] = corners.map(([dx, dy]) => [
    Math.round((clng + (dx * cos - dy * sin) / k) * 1e6) / 1e6,
    Math.round((clat + (dx * sin + dy * cos) / mPerDegLat) * 1e6) / 1e6,
  ])

  ring.push(ring[0]) // Close ring
  return ring
}
