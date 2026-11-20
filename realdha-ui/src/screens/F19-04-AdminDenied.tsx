import { Screen } from '../app/Shell'
import { useSessionRole } from '../lib/access'
import { DeniedCard } from './parts/AdminGate'

/** F19-04 · Admin access denied. Shows the visitor's own nav (owner by default); ?as=<role> picks another. */
export default function AdminDenied() {
  const role = useSessionRole()
  const shown = role && role !== 'admin' ? role : 'owner'
  return <Screen id="F19-04" role={shown}><DeniedCard role={shown} /></Screen>
}
