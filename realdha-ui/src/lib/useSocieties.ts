import { useCallback, useEffect, useState } from 'react'
import { fetchSocieties, type SocietiesResponse, type SocietyQuery } from './flats-api'

interface State {
  data: SocietiesResponse | null
  loading: boolean
  error: string | null
}

/** Fetches societies for a query; aborts stale requests and debounces text search. */
export function useSocieties(query: SocietyQuery) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const { city, q, mode, kind, ready, sort, bhk, limit, offset } = query

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))
    const timer = setTimeout(() => {
      fetchSocieties({ city, q, mode, kind, ready, sort, bhk, limit, offset }, controller.signal)
        .then((data) => setState({ data, loading: false, error: null }))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' })
        })
    }, q ? 300 : 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [city, q, mode, kind, ready, sort, bhk, limit, offset, attempt])

  return { ...state, retry }
}
