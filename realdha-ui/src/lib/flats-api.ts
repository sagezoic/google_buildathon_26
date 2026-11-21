// Client for the Flat Finder API (/api/flats). Goes through the Vite / nginx proxy, never a hardcoded backend URL.

import { SAMPLE_SOCIETIES, getSampleSociety } from '../data/fixtures/sample-societies'

export type FlatMode = 'buy' | 'rent'
export type FlatSort = 'best' | 'price' | 'rent' | 'rating' | 'name'

export interface BhkPriceSummary {
  buy_median?: number | null
  rent_median?: number | null
  psf?: number | null
}

export interface SocietyCard {
  id: string
  city: string
  name: string
  developer: string | null
  locality: string | null
  pincode: string | null
  lat?: number | null
  lng?: number | null
  towers?: number | null
  acres?: number | null
  kind: string | null
  status: string | null
  possession: string | null
  units: number | null
  price_min: number | null
  price_max: number | null
  psf_now: number | null
  amenities: string[] | null
  images: Array<{ thumb: string; full: string }> | null
  rating: number | null
  review_count: number | null
  score: number | null
  prices: Record<string, BhkPriceSummary>
}

export interface SocietiesResponse {
  societies: SocietyCard[]
  total: number
  limit: number
  offset: number
}

export interface SocietyDetailData extends SocietyCard {
  lat: number | null
  lng: number | null
  towers: number | null
  acres: number | null
  rating_count: number | null
  rera_id?: string | null
  description?: string | null
  nearby: Record<string, { m: number; name?: string; n?: number }> | null
  unit_types: Array<{
    id?: number | string
    bhk: number | null
    size_sqft: number | null
    price_min?: number | null
    price_max?: number | null
  }>
  bhk_prices: Array<{
    bhk: number
    buy_median: number | null
    buy_min: number | null
    buy_max: number | null
    buy_n: number | null
    rent_median: number | null
    rent_min: number | null
    rent_max: number | null
    rent_n: number | null
    psf: number | null
  }>
  listings: Array<{
    id?: number | string
    mode: string
    bhk: number | null
    price: number | null
    sqft: number | null
    psf: number | null
    furnished: string | null
    floor: string | null
  }>
  reviews: Array<{
    id?: number | string
    title: string | null
    text: string | null
    author: string | null
    rating: number | null
    date: string | null
  }>
}

export interface CitySummary {
  slug: string
  name: string
  societies_count: number
  center?: [number, number] // [lng, lat]
  zoom?: number
}

export interface SocietyQuery {
  city?: string
  q?: string
  mode?: FlatMode
  kind?: string
  ready?: boolean
  sort?: FlatSort
  bhk?: number | number[]
  limit?: number
  offset?: number
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return (await res.json()) as T
}

export async function fetchSocieties(query: SocietyQuery, signal?: AbortSignal): Promise<SocietiesResponse> {
  try {
    const p = new URLSearchParams()
    if (query.city) p.set('city', query.city)
    if (query.q) p.set('q', query.q)
    if (query.mode) p.set('mode', query.mode)
    if (query.kind) p.set('kind', query.kind)
    if (query.ready !== undefined) p.set('ready', query.ready ? 'true' : 'false')
    if (query.bhk != null) {
      p.set('bhk', Array.isArray(query.bhk) ? query.bhk.join(',') : String(query.bhk))
    }
    if (query.sort) {
      // If in rent mode and sorting by price, send sort=rent to sort by monthly rent
      const effectiveSort = query.mode === 'rent' && query.sort === 'price' ? 'rent' : query.sort
      p.set('sort', effectiveSort)
    }
    p.set('limit', String(query.limit ?? 100))
    if (query.offset) p.set('offset', String(query.offset))
    return await getJson<SocietiesResponse>(`/api/flats/societies?${p}`, signal)
  } catch (err: unknown) {
    if (signal?.aborted) throw err
    // Graceful offline/local fallback
    const city = (query.city || 'pune').toLowerCase()
    let filtered = SAMPLE_SOCIETIES.filter((s) => s.city.toLowerCase() === city)
    if (query.q) {
      const q = query.q.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.developer && s.developer.toLowerCase().includes(q)) ||
          (s.locality && s.locality.toLowerCase().includes(q)),
      )
    }
    if (query.kind) {
      filtered = filtered.filter((s) => s.kind === query.kind)
    }
    if (query.ready) {
      filtered = filtered.filter((s) => s.status && s.status.toLowerCase().includes('ready'))
    }
    if (query.bhk) {
      const bhks = Array.isArray(query.bhk) ? query.bhk : [query.bhk]
      filtered = filtered.filter((s) => bhks.some((b) => s.prices && s.prices[String(b)] !== undefined))
    }
    const limit = query.limit ?? 20
    const offset = query.offset ?? 0
    return {
      societies: filtered.slice(offset, offset + limit),
      total: filtered.length,
      limit,
      offset,
    }
  }
}

export async function fetchSociety(id: string, signal?: AbortSignal): Promise<SocietyDetailData> {
  try {
    const r = await getJson<{ society: SocietyDetailData }>(`/api/flats/societies/${encodeURIComponent(id)}`, signal)
    if (r.society) return r.society
  } catch (err: unknown) {
    if (signal?.aborted) throw err
    const sample = getSampleSociety(id)
    if (sample) return sample
    throw err
  }
  const sample = getSampleSociety(id)
  if (sample) return sample
  throw new Error(`Society with ID ${id} was not found.`)
}

export async function fetchCities(signal?: AbortSignal): Promise<CitySummary[]> {
  try {
    const r = await getJson<{ cities: CitySummary[] }>('/api/flats/cities', signal)
    if (r.cities && r.cities.length) return r.cities
  } catch (err: unknown) {
    if (signal?.aborted) throw err
  }
  return [
    { slug: 'pune', name: 'Pune', societies_count: SAMPLE_SOCIETIES.length },
    { slug: 'gurgaon', name: 'Gurugram', societies_count: 2708 },
  ]
}

/** 14300000 -> "₹1.43 Cr", 3650000 -> "₹36.5 L", 36500 -> "₹36,500". */
export function formatInr(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '–'
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
const trim = (v: number) => v.toFixed(2).replace(/\.?0+$/, '')

/** Average gross rental yield (%) over BHKs that have both a buy and a rent median. */
export function grossYield(prices?: Record<string, BhkPriceSummary> | null): number | null {
  if (!prices || typeof prices !== 'object') return null
  try {
    const ys = Object.values(prices)
      .filter((p) => p && typeof p.buy_median === 'number' && typeof p.rent_median === 'number')
      .map((p) => (p.rent_median! * 12 * 100) / p.buy_median!)
    return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null
  } catch {
    return null
  }
}

/** Lowest monthly rent across BHKs, or null. */
export function lowestRent(prices?: Record<string, BhkPriceSummary> | null): number | null {
  if (!prices || typeof prices !== 'object') return null
  try {
    const rs = Object.values(prices)
      .map((p) => p?.rent_median)
      .filter((v): v is number => typeof v === 'number')
    return rs.length ? Math.min(...rs) : null
  } catch {
    return null
  }
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())

/** Up to three tag pills for a card: kind, status, top amenity. */
export function cardBadges(s: SocietyCard): string[] {
  const out: string[] = []
  if (s.kind) out.push(titleCase(s.kind))
  if (s.status) out.push(s.status)
  const amenity = s.amenities?.[0]
  if (amenity) out.push(amenity)
  return out.slice(0, 3)
}
