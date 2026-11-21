/** F18 · Watchlist & Register Interest fixtures. */

export interface WatchlistItem {
  id: string
  recordId: string
  name: string
  sub: string
  type?: 'plot' | 'apartment' | 'commercial'
  price: number
  priceLabel: string
  delta: string
  deltaTone: 'up' | 'down' | 'neutral'
  yieldLabel: string
  status: string
}

export const SEED_WATCHLIST: WatchlistItem[] = [
  {
    id: 'w1',
    recordId: 'RA-LON-004-P-112-2',
    name: 'Kusgaon NA plot',
    sub: 'Plot 112/2 · Lonavala',
    type: 'plot',
    price: 5120,
    priceLabel: '₹5,120 / sq yd',
    delta: '+2.4%',
    deltaTone: 'up',
    yieldLabel: '—',
    status: 'Anchored on-chain',
  },
  {
    id: 'w2',
    recordId: 'RA-PUN-001-A-18-04',
    name: 'A-1804 · Baner',
    sub: 'Baner Heights · Pune',
    type: 'apartment',
    price: 28400,
    priceLabel: '₹28,400 token price',
    delta: '−0.8%',
    deltaTone: 'down',
    yieldLabel: '4.6% p.a.',
    status: 'Anchored on-chain',
  },
  {
    id: 'w3',
    recordId: 'RA-PUN-016-A-06-03',
    name: 'A-0603 · Aundh Crest',
    sub: '3 BHK · Aundh, Pune',
    type: 'apartment',
    price: 15200000,
    priceLabel: '₹1.52 Cr',
    delta: '+1.5%',
    deltaTone: 'up',
    yieldLabel: '5.1% p.a.',
    status: 'Signed off',
  },
]

export interface RegisteredInterest {
  id: string
  propertyId: string
  propertyName: string
  name: string
  phone: string
  updates: boolean
  contactMe: boolean
  registeredAt: number
}
