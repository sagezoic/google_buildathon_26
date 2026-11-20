import { useSharedState } from './shared-state'

/**
 * `x.notifications` (localStorage `rd:x.notifications`): `NotifState[]`, one `{ id, read }` per notification.
 * Ids starting `w` are the 1440/834 list, ids starting `m` the 390 list; each list starts with 2 unread.
 * Bell badge: `useUnreadCount()` (or `unreadCount(list)`).
 */
export interface NotifState { id: string; read: boolean }
export const NOTIF_KEY = 'x.notifications'

export const NOTIF_INITIAL: NotifState[] = [
  { id: 'w1', read: true }, { id: 'w2', read: true }, { id: 'w3', read: true }, { id: 'w4', read: false }, { id: 'w5', read: false },
  { id: 'm1', read: false }, { id: 'm2', read: true }, { id: 'm3', read: true }, { id: 'm4', read: false },
]

/** Unread badge number: the larger of the two lists' unread counts (they are the same notifications at two sizes). */
export const unreadCount = (list: NotifState[]) => {
  const n = (p: string) => list.filter((x) => x.id.startsWith(p) && !x.read).length
  return Math.max(n('w'), n('m'))
}

export function useNotifications() {
  const [list, set] = useSharedState<NotifState[]>(NOTIF_KEY, NOTIF_INITIAL)
  const markRead = (id: string) => set((l) => l.map((x) => (x.id === id ? { ...x, read: true } : x)))
  const markAll = () => set((l) => l.map((x) => ({ ...x, read: true })))
  const isRead = (id: string) => list.find((x) => x.id === id)?.read ?? true
  return { list, isRead, markRead, markAll }
}

export const useUnreadCount = () => unreadCount(useSharedState<NotifState[]>(NOTIF_KEY, NOTIF_INITIAL)[0])
