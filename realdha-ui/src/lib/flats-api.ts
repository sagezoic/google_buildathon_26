// Client for the Flat Finder API (/api/flats). Goes through the Vite / nginx proxy, never a hardcoded backend URL.

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
}

export interface SocietyQuery {
  city?: string
  q?: string
  mode?: FlatMode
  kind?: string
  ready?: boolean
  sort?: FlatSort
  limit?: number
  offset?: number
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return (await res.json()) as T
}

export function fetchSocieties(query: SocietyQuery, signal?: AbortSignal) {
  const p = new URLSearchParams()
  if (query.city) p.set('city', query.city)
  if (query.q) p.set('q', query.q)
  if (query.mode) p.set('mode', query.mode)
  if (query.kind) p.set('kind', query.kind)
  if (query.ready) p.set('ready', 'true')
  if (query.sort) p.set('sort', query.sort)
  p.set('limit', String(query.limit ?? 100))
  if (query.offset) p.set('offset', String(query.offset))
  return getJson<SocietiesResponse>(`/api/flats/societies?${p}`, signal)
}

export async function fetchSociety(id: string, signal?: AbortSignal) {
  const r = await getJson<{ society: SocietyDetailData }>(`/api/flats/societies/${encodeURIComponent(id)}`, signal)
  return r.society
}

export async function fetchCities(signal?: AbortSignal) {
  const r = await getJson<{ cities: CitySummary[] }>('/api/flats/cities', signal)
  return r.cities
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
export function grossYield(prices: Record<string, BhkPriceSummary>): number | null {
  const ys = Object.values(prices)
    .filter((p) => p.buy_median && p.rent_median)
    .map((p) => (p.rent_median! * 12 * 100) / p.buy_median!)
  return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null
}

/** Lowest monthly rent across BHKs, or null. */
export function lowestRent(prices: Record<string, BhkPriceSummary>): number | null {
  const rs = Object.values(prices)
    .map((p) => p.rent_median)
    .filter((v): v is number => typeof v === 'number')
  return rs.length ? Math.min(...rs) : null
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
