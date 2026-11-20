import { useSearchParams } from 'react-router'

/**
 * States drawn inside a frame (OTP wrong, KYC failed, mint failed …) are reachable with
 * `?state=<name>`. The first entry of `states` is the default.
 */
export function useDemoState<T extends string>(states: readonly T[]) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('state') as T | null
  const state = raw && states.includes(raw) ? raw : states[0]
  const set = (next: T) =>
    setParams((p) => {
      const n = new URLSearchParams(p)
      n.set('state', next)
      return n
    }, { replace: true })
  return [state, set] as const
}
