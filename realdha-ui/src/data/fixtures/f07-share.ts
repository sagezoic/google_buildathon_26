/** F07 · Share Link management fixtures. */

export interface ShareLinkRecord {
  id: string
  code: string
  url: string
  access: 'Documents included' | 'Summary only'
  includeDocs: boolean
  showOwner: boolean
  status: 'Active' | 'Expired' | 'Revoked'
  expiryLabel: string
  views: number
  createdAt: string
  log: { time: string; ip: string; city: string }[]
}

export const SEED_SHARE_LINKS: ShareLinkRecord[] = [
  {
    id: 'l1',
    code: '9fK2mQx7',
    url: 'realdha.example/s/9fK2mQx7',
    access: 'Documents included',
    includeDocs: true,
    showOwner: false,
    status: 'Active',
    expiryLabel: 'Expires 27 Nov 2026',
    views: 12,
    createdAt: '20 Nov 2026',
    log: [
      { time: '21 Nov 2026, 14:10', ip: '103.21.201.44', city: 'Pune' },
      { time: '21 Nov 2026, 11:05', ip: '157.34.18.92', city: 'Mumbai' },
      { time: '20 Nov 2026, 19:42', ip: '49.36.120.15', city: 'Pune' },
    ],
  },
  {
    id: 'l2',
    code: 'Lp81vTc3',
    url: 'realdha.example/s/Lp81vTc3',
    access: 'Summary only',
    includeDocs: false,
    showOwner: true,
    status: 'Active',
    expiryLabel: 'Expires 21 Nov 2026',
    views: 3,
    createdAt: '14 Nov 2026',
    log: [
      { time: '18 Nov 2026, 09:12', ip: '103.50.160.10', city: 'Bengaluru' },
    ],
  },
  {
    id: 'l3',
    code: 'Zt40aRn9',
    url: 'realdha.example/s/Zt40aRn9',
    access: 'Documents included',
    includeDocs: true,
    showOwner: false,
    status: 'Expired',
    expiryLabel: 'Expired 10 Nov 2026',
    views: 5,
    createdAt: '3 Nov 2026',
    log: [
      { time: '09 Nov 2026, 16:30', ip: '49.36.118.204', city: 'Pune' },
    ],
  },
]
