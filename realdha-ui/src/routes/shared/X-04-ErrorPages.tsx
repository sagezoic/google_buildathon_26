import { ErrorPage } from '../../components/error-page'
import { useDemoState } from '../../app/useDemoState'

const STATES = ['notfound', 'denied', 'offline', 'error'] as const

/** X-04 · 404, permission denied, offline, error. One state at a time via ?state=. */
export default function ErrorPages() {
  const [state] = useDemoState(STATES)
  return <ErrorPage kind={state} />
}
