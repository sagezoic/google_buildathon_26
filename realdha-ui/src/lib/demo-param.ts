import { useSearchParams } from 'react-router'
import { usePersistentState } from '../app/persist'

/** `?state=` forces a drawn state; otherwise the persisted choice (key) is used. */
export function usePersistedDemo<T extends string>(key: string, states: readonly T[]) {
  const [sp, setSp] = useSearchParams()
  const [saved, setSaved] = usePersistentState<T>(key, states[0])
  const raw = sp.get('state') as T | null
  const forced = raw && states.includes(raw) ? raw : null
  const value = forced ?? (states.includes(saved) ? saved : states[0])
  const set = (v: T) => {
    setSaved(v)
    if (forced) setSp((p) => { const n = new URLSearchParams(p); n.delete('state'); return n }, { replace: true })
  }
  return [value, set] as const
}

export function useIsWide() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 80rem)').matches
}
