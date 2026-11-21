import { useEffect, useState } from 'react'
import { useSharedState } from './shared-state'

/** A place picked from OpenStreetMap search. Stored once (`f08.place`) and read by every search surface. */
export interface Place {
  id: string
  name: string
  /** District, city and state, e.g. "Pune, Maharashtra". */
  area: string
  kind: string
  lng: number
  lat: number
}

export const usePlace = () => useSharedState<Place | null>('f08.place', null)

// Photon is the OpenStreetMap geocoder built for type-ahead; public Nominatim forbids autocomplete.
const ENDPOINT = 'https://photon.komoot.io/api/'
const INDIA_BBOX = '68.1,6.7,97.4,35.7'
const PUNE = { lat: 18.5204, lon: 73.8567 }
const MIN_CHARS = 2
const DEBOUNCE_MS = 300

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    osm_id: number
    osm_type: string
    osm_value?: string
    name?: string
    street?: string
    district?: string
    county?: string
    city?: string
    state?: string
  }
}

const cache = new Map<string, Place[]>()

function toPlace(f: PhotonFeature): Place | null {
  const p = f.properties
  const name = p.name ?? p.street
  if (!name) return null
  const area = [...new Set([p.district ?? p.county, p.city, p.state].filter((x): x is string => !!x && x !== name))].join(', ')
  return {
    id: `${p.osm_type}${p.osm_id}`,
    name,
    area,
    kind: (p.osm_value ?? 'place').replace(/_/g, ' '),
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }
}

async function fetchPlaces(q: string, signal: AbortSignal): Promise<Place[]> {
  const key = q.toLowerCase()
  const hit = cache.get(key)
  if (hit) return hit
  const url = `${ENDPOINT}?${new URLSearchParams({ q, limit: '8', lang: 'en', bbox: INDIA_BBOX, lat: String(PUNE.lat), lon: String(PUNE.lon), location_bias_scale: '0.4' })}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`geocoder ${res.status}`)
  const json = (await res.json()) as { features: PhotonFeature[] }
  const seen = new Set<string>()
  const places = json.features.map(toPlace).filter((p): p is Place => {
    if (!p) return false
    const k = `${p.name}|${p.area}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  cache.set(key, places)
  return places
}

export type SuggestState = { status: 'idle' | 'loading' | 'ready' | 'error'; places: Place[] }

/** Debounced OpenStreetMap place suggestions for `query`. Stale requests are aborted. */
export function usePlaceSuggestions(query: string): SuggestState {
  const q = query.trim()
  const active = q.length >= MIN_CHARS
  const [state, setState] = useState<SuggestState>({ status: 'idle', places: [] })

  useEffect(() => {
    if (!active) return
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      setState((s) => ({ status: 'loading', places: s.places }))
      fetchPlaces(q, ctrl.signal)
        .then((places) => setState({ status: 'ready', places }))
        .catch((e) => { if (e?.name !== 'AbortError') setState({ status: 'error', places: [] }) })
    }, DEBOUNCE_MS)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q, active])

  return active ? state : { status: 'idle', places: [] }
}
