import { usePersistentState } from '../app/persist'
import { createProperty, updateProperty, type PropertyPayload } from './property-api'
import type { AreaUnit } from './plot-shape'
import { plot, seedDocuments, type PropertyType, type Resolution, type StoredDoc } from '../data/fixtures/property-intake'

/** Shared add-property state (GP-06 to GP-11). Keys: property.draft, property.documents, property.findings, property.check. */
export type Stage = 'details' | 'documents' | 'checked'

export interface GeoPin { lng: number; lat: number }
export const isGeoPin = (p: unknown): p is GeoPin => typeof (p as GeoPin)?.lng === 'number' && typeof (p as GeoPin)?.lat === 'number'

export interface PropertyDraft {
  /** Server property id, set once the draft has been saved to the API. */
  id?: string
  type: PropertyType
  gat: string
  village: string
  taluka: string
  district: string
  address: string
  /** Map pin. Supports both { x, y } (legacy sketch) and GeoPin { lng, lat }. */
  pin: { x: number; y: number } | GeoPin
  /** Plot area as typed, with its unit. Drives the shape drawn on the map. */
  area: string
  areaUnit: AreaUnit
  /** Custom parcel boundary polygon coordinates [[lng, lat], ...] */
  boundary?: [number, number][]
  moved: boolean
  /** True once the owner pressed Save draft or Continue: GP-06 then lists the property. */
  saved: boolean
  stage: Stage
}

export const defaultDraft: PropertyDraft = {
  type: 'plot', gat: plot.gat, village: plot.village, taluka: plot.taluka, district: plot.district, address: plot.address,
  pin: { lng: plot.gps.lng, lat: plot.gps.lat }, area: plot.area, areaUnit: plot.areaUnit, moved: false, saved: false, stage: 'details',
}

export const TYPE_LABEL: Record<PropertyType, string> = { apartment: 'Apartment', plot: 'Plot', commercial: 'Commercial' }

/** Drafts saved before `area` / `areaUnit` existed lack them; an unknown area stays empty instead of borrowing the demo plot's. */
const migrateDraft = (d: PropertyDraft): PropertyDraft => ({ ...defaultDraft, ...{ area: '', areaUnit: 'sqm' as AreaUnit }, ...(d as Partial<PropertyDraft>) })

export const usePropertyDraft = () => usePersistentState<PropertyDraft>('property.draft', defaultDraft, migrateDraft)
export const usePropertyDocuments = () => usePersistentState<StoredDoc[]>('property.documents', seedDocuments)

export interface StoredFinding { decision: Resolution; value?: string }
export type StoredFindings = Partial<Record<'A' | 'B' | 'C', StoredFinding>>
const noFindings: StoredFindings = {}
export const usePropertyFindings = () => usePersistentState<StoredFindings>('property.findings', noFindings)

export const propertyTitle = (d: PropertyDraft) => `${d.village} ${TYPE_LABEL[d.type]} ${d.gat}`.replace(/\s+/g, ' ').trim()
export const propertyPlace = (d: PropertyDraft) => [d.village, d.taluka, d.district].filter(Boolean).join(', ')

/** Creates the property on the server on first save, updates it afterwards. Returns the server id. */
export async function syncDraft(d: PropertyDraft): Promise<string> {
  const payload: PropertyPayload = {
    type: d.type, gat: d.gat, village: d.village, taluka: d.taluka, district: d.district, address: d.address,
    area: d.area, area_unit: d.areaUnit, stage: d.stage,
    ...(isGeoPin(d.pin) ? { lat: d.pin.lat, lng: d.pin.lng } : {}),
  }
  if (d.id) {
    try { return (await updateProperty(d.id, payload)).id } catch (e) {
      // The server may have lost this id (fresh database): fall through and create it again.
      if (!/not found/i.test(e instanceof Error ? e.message : '')) throw e
    }
  }
  return (await createProperty(payload)).id
}

export function fileSize(b: number) { return b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB` }

/** Returns an error message, or null when the file is acceptable. */
export function checkFile(f: { name: string; size: number }): string | null {
  if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return `${f.name} is not a PDF, JPG or PNG.`
  if (f.size > 20e6) return `${f.name} is larger than 20 MB.`
  return null
}
