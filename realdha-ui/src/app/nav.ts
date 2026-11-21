import { SCREENS, type Role, type ScreenDef } from './screens'

export function path(id: string, params?: Record<string, string>): string {
  const s = screenById(id)
  if (!s) return `/${id.toLowerCase()}`
  let p = s.path
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      p = p.replace(`:${k}`, v)
    }
  }
  return p
    .replace(':propertyId', 'RA-PUN-001-A-18-04')
    .replace(':recordId', 'RA-LON-004-P-112-2')
    .replace(':docId', '7_12_extract')
    .replace(':areaId', 'baner')
    .replace(':unitId', 'A-1804')
    .replace(':shareToken', 'sample-token')
    .replace(':code', '404')
    .replace(':id', 'RA-LON-004-P-112-2')
}

export function screenIndex(id: string) {
  return SCREENS.findIndex((s) => s.id === id)
}
export function screenById(id: string): ScreenDef | undefined {
  return SCREENS.find((s) => s.id === id)
}
export function flowScreens(flow: string) {
  return SCREENS.filter((s) => s.flow === flow)
}
/** Prototype navigation: Next/Prev follow spec order across the whole index (P-00). */
export function neighbours(id: string) {
  const i = screenIndex(id)
  return { prev: SCREENS[i - 1], next: SCREENS[i + 1] }
}

export interface NavItem {
  label: string
  /** Short label for the 390 tab bar. */
  tab?: string
  to: string
}

/** Top-nav items per role, from C3 and the frames. Edit here, not per screen. */
export const NAV: Record<Role, NavItem[]> = {
  public: [],
  owner: [
    { label: 'Home', to: path('X-01') },
    { label: 'My properties', tab: 'Properties', to: path('F03-03') },
    { label: 'Search', to: path('F08-01') },
    { label: 'Market', to: path('GP-21') },
    { label: 'Watchlist', to: path('F18-01') },
  ],
  buyer: [
    { label: 'Home', to: path('X-01') },
    { label: 'Search', to: path('F08-01') },
    { label: 'Market', to: path('GP-21') },
    { label: 'Watchlist', to: path('F18-01') },
  ],
  // Open question V-OpenQuestions: lawyer and valuer items are assumed.
  lawyer: [
    { label: 'Queue', to: path('GP-13') },
    { label: 'Reviews', to: path('GP-14') },
    { label: 'Signed off', to: path('F06-02') },
  ],
  developer: [
    { label: 'Dashboard', to: path('F15-01') },
    { label: 'Inventory', to: path('F15-02') },
    { label: 'Enquiries', to: path('F15-04') },
    { label: 'Calls', to: path('F15-05') },
    { label: 'Partners', to: path('F15-07') },
  ],
  partner: [
    { label: 'Availability', to: path('F16-01') },
    { label: 'Clients', to: path('F16-04') },
    { label: 'Calls', to: path('F16-05') },
  ],
  admin: [
    { label: 'Console', to: path('GP-23') },
    { label: 'Transactions', to: path('F19-01') },
    { label: 'Contracts', to: path('F19-02') },
    { label: 'Audit log', to: path('F19-03') },
    { label: 'Settings', to: path('X-03') },
  ],
  government: [
    { label: 'Lookup', to: path('F20-01') },
    { label: 'Records', to: path('F20-02') },
    { label: 'Audit trail', to: path('F20-04') },
  ],
}

/** Which nav item is active on a screen, where the screen is not the item's own route. */
const ACTIVE_OVERRIDE: Record<string, string> = {
  'GP-06': 'X-01',
  'GP-07': 'F03-03', 'GP-08': 'F03-03', 'GP-09': 'F03-03', 'GP-10': 'F03-03', 'GP-11': 'F03-03', 'GP-12': 'F03-03',
  'GP-15': 'F03-03', 'GP-16': 'F03-03', 'GP-17': 'F03-03', 'GP-18': 'F03-03', 'GP-19': 'F03-03', 'GP-20': 'GP-21', 'GP-22': 'GP-21',
  'GP-14': 'GP-13',
  'F19-01': 'GP-23',
  'F20-03': 'F20-02',
}
export function activePath(id: string) {
  return path(ACTIVE_OVERRIDE[id] ?? id)
}
export const INITIALS: Record<Role, string> = { public: '', owner: 'PK', buyer: 'PK', developer: 'DV', partner: 'CP', lawyer: 'MJ', admin: 'AD', government: 'GV' }
