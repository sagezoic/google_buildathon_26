import { useCallback, useSyncExternalStore } from 'react'

/**
 * Shared persisted state in the same `rd:` localStorage namespace as `usePersistentState`, but written
 * synchronously in the setter. That matters when a click both saves and navigates: the old screen unmounts
 * before an effect-based write could run. Every consumer of one key stays in sync.
 */
const NS = 'rd:'
const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; val: unknown }>()

function rawOf(key: string): string | null {
  try { return localStorage.getItem(NS + key) } catch { return cache.get(key)?.raw ?? null }
}

export function readShared<T>(key: string, initial: T): T {
  const raw = rawOf(key)
  const c = cache.get(key)
  if (c && c.raw === raw) return c.val as T
  let val: unknown = initial
  if (raw !== null) { try { val = JSON.parse(raw) } catch { val = initial } }
  cache.set(key, { raw, val })
  return val as T
}

export function writeShared<T>(key: string, next: T | ((prev: T) => T), initial: T) {
  const value = typeof next === 'function' ? (next as (p: T) => T)(readShared(key, initial)) : next
  const raw = JSON.stringify(value)
  try { localStorage.setItem(NS + key, raw) } catch { /* blocked: keep in memory */ }
  cache.set(key, { raw, val: value })
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key.startsWith(NS)) cb() }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage) }
}

export function useSharedState<T>(key: string, initial: T) {
  const value = useSyncExternalStore(subscribe, () => readShared(key, initial), () => initial)
  const set = useCallback((next: T | ((prev: T) => T)) => writeShared(key, next, initial), [key, initial])
  return [value, set] as const
}
