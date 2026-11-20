// Turns a plot's stated area into an illustrative rectangle on the map. Not survey data.
import type { Feature, Polygon } from 'geojson'
import { rect } from './society-shapes'

export type AreaUnit = 'sqft' | 'sqm' | 'guntha' | 'acre'

export const AREA_UNITS: ReadonlyArray<{ value: AreaUnit; label: string; sqm: number }> = [
  { value: 'sqft', label: 'sq ft', sqm: 0.092903 },
  { value: 'sqm', label: 'sq m', sqm: 1 },
  { value: 'guntha', label: 'guntha', sqm: 101.17 },
  { value: 'acre', label: 'acre', sqm: 4046.86 },
]

const MIN_SQM = 5
const MAX_SQM = 200 * 4046.86
const RATIO = 4 / 3 // width : depth when only the area is known
const ANGLE = (-6 * Math.PI) / 180

/** Parses "4,800" or "1.5". Returns null for empty, zero, negative or non-numeric input. */
export function parseArea(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(n) && n > 0 ? n : null
}

export function areaToSqm(value: string, unit: AreaUnit): number | null {
  const n = parseArea(value)
  if (n === null) return null
  const sqm = n * (AREA_UNITS.find((u) => u.value === unit)?.sqm ?? 1)
  return sqm >= MIN_SQM && sqm <= MAX_SQM ? sqm : null
}

/** A closed lng/lat ring of the right size centred on `center`, or null when the area is not usable. */
export function plotFeature(center: { lng: number; lat: number }, value: string, unit: AreaUnit): Feature<Polygon> | null {
  const sqm = areaToSqm(value, unit)
  if (sqm === null) return null
  const w = Math.sqrt(sqm * RATIO)
  const d = sqm / w
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [rect([center.lng, center.lat], w, d, ANGLE)] } }
}
