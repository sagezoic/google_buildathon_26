import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { ERRORS, type ErrorKind } from '../data/fixtures/x-flow'
import { Button } from './ui/button'
import { Card } from './ui/card'

export type { ErrorKind }

/**
 * Full-page 404 / permission denied / offline / error (X-04). Mount `<ErrorPage />` for unknown routes;
 * pass `kind` for the other states. Wrapped in the app shell.
 */
export function ErrorPage({ kind = 'notfound' }: { kind?: ErrorKind }) {
  const e = ERRORS[kind]
  const nav = useNavigate()
  const [requested, setRequested] = usePersistentState('x.accessRequested', false)
  const [retrying, setRetrying] = useState(false)
  const [stillOffline, setStillOffline] = useState(false)
  const home = path('X-01')

  const act = () => {
    if (kind === 'notfound') nav(home)
    else if (kind === 'denied') {
      if (window.innerWidth < 1440) nav(-1)
      else setRequested(true)
    } else if (kind === 'offline') {
      setRetrying(true); setStillOffline(false)
      setTimeout(() => {
        setRetrying(false)
        if (navigator.onLine) nav(home)
        else setStillOffline(true)
      }, 900)
    } else location.reload()
  }
  const label = <><span className="xl:hidden">{e.narrowAction}</span><span className="max-xl:hidden">{e.wideAction}</span></>
  const narrowSecondary = kind === 'denied'

  return (
    <Screen id="X-04" noTabs>
      <div className="flex flex-1 items-start justify-center p-4 xl:px-12 xl:py-8">
        <Card role="alert" aria-labelledby="err-title" className="flex w-full max-w-[640px] flex-col gap-3 p-6 xl:max-w-[664px] xl:p-7">
          {kind === 'offline' && <p className="flex items-center gap-2 rounded-control border border-warning bg-warning-tint p-3 text-warning-ink xl:hidden"><TriangleAlert className="size-5 flex-none" aria-hidden /><span><b className="block text-h3">{e.narrowTitle}</b>{e.narrowBody}</span></p>}
          <span aria-hidden className="font-mono text-h1 text-muted max-xl:hidden">{e.code}</span>
          <h1 id="err-title" className={kind === 'offline' ? 'text-h2 max-xl:sr-only' : 'text-h2'}>
            <span className="xl:hidden">{e.narrowTitle}</span><span className="max-xl:hidden">{e.wideTitle}</span>
          </h1>
          <p className="text-small text-muted xl:text-control">
            {kind === 'offline' || kind === 'error' ? <><span className={kind === 'offline' ? 'sr-only' : 'xl:hidden'}>{e.narrowBody}</span><span className="max-xl:hidden">{e.body}</span></> : <span className="max-xl:hidden">{e.body}</span>}
          </p>
          <div role="status" aria-live="polite" className="text-small">
            {requested && kind === 'denied' && <span className="flex items-center gap-1.5 text-success-ink max-xl:hidden"><CircleCheck className="size-4" aria-hidden />Access requested</span>}
            {stillOffline && <span className="flex items-center gap-1.5 text-danger-ink"><TriangleAlert className="size-4" aria-hidden />Still offline</span>}
          </div>
          <div>
            <Button onClick={act} loading={retrying} className={narrowSecondary ? 'max-xl:w-full max-xl:bg-surface max-xl:border-line-strong max-xl:text-primary-text' : 'max-xl:h-12 max-xl:w-full'}>{label}</Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
