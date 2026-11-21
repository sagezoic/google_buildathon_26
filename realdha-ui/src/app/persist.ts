import { useCallback, useState } from 'react'

const NS = 'rd:'

/**
 * useState that survives navigation and reload (localStorage, JSON). Keys are shared across
 * screens on purpose: the phone number typed on GP-02 is the same `identity.phone` that GP-04 shows.
 * Only plain JSON values: store file names and sizes, never File objects.
 * Writes happen synchronously in the setter, so a click that saves and then navigates
 * never loses the value (an effect would not run once the screen unmounts).
 */
export function usePersistentState<T>(key: string, initial: T, migrate?: (stored: T) => T) {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(NS + key)
      if (raw === null) return initial
      const stored = JSON.parse(raw) as T
      // `migrate` fills in fields that were added after the value was saved.
      return migrate ? migrate(stored) : stored
    } catch {
      return initial
    }
  }
  const [value, setValue] = useState<T>(read)

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try { localStorage.setItem(NS + key, JSON.stringify(v)) } catch { /* storage blocked or full: keep working in memory */ }
        return v
      })
    },
    [key],
  )
  const reset = useCallback(() => { localStorage.removeItem(NS + key); setValue(initial) }, [key, initial])
  return [value, set, reset] as const
}

/** Clear every persisted sample value (used by the Flow index). */
export function clearPersisted() {
  Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k))
}
