import { AlertTriangle, RotateCcw } from 'lucide-react'
import { type ComponentType, lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import FlowIndex from './FlowIndex'
import { path } from './nav'
import { REGISTRY } from './registry'
import { SCREENS } from './screens'
import { Screen } from './Shell'

function NotBuilt({ id, title }: { id: string; title: string }) {
  return (
    <Screen id={id}>
      <div className="mx-auto w-full max-w-[640px] px-4 py-16">
        <Card className="flex flex-col gap-2 text-center">
          <span className="font-mono text-small text-muted">{id}</span>
          <h1 className="text-h2 font-semibold">{title}</h1>
          <p className="text-small text-muted">This screen is not available yet.</p>
        </Card>
      </div>
    </Screen>
  )
}

/** Error boundary component for caught route and dynamic import errors. */
function RouteErrorBoundary() {
  const error = useRouteError() as Error | null
  const errMsg = error?.message || String(error || '')
  const isChunkError =
    errMsg.includes('dynamically imported module') ||
    errMsg.includes('Failed to fetch') ||
    errMsg.includes('Loading chunk')

  return (
    <Screen id="X-04" title="Application Error">
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 px-4 py-16 text-center">
        <Card className="flex flex-col items-center gap-4 p-8 text-center shadow-e1">
          <div className="flex size-14 items-center justify-center rounded-full bg-warning-tint text-warning-ink">
            <AlertTriangle className="size-7" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-h2 font-semibold text-text">
              {isChunkError ? 'Application Updated' : 'Something went wrong'}
            </h1>
            <p className="max-w-md text-small text-muted">
              {isChunkError
                ? 'A screen module update was deployed. Please reload the page to access the latest verified version.'
                : 'An unexpected application error occurred while loading this view.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => {
                sessionStorage.removeItem('rd-chunk-reload')
                window.location.reload()
              }}
              icon={<RotateCcw className="size-4" />}
            >
              Reload application
            </Button>
            <Button variant="secondary" to={path('X-01')}>
              Return to home
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}

/** Resilient lazy loader that retries once or reloads on stale chunk cache. */
function resilientLazy<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const mod = await componentImport()
      sessionStorage.removeItem('rd-chunk-reload')
      return mod
    } catch (error) {
      console.warn('Dynamic import failed, attempting reload...', error)
      const reloaded = sessionStorage.getItem('rd-chunk-reload')
      if (!reloaded) {
        sessionStorage.setItem('rd-chunk-reload', '1')
        window.location.reload()
        return new Promise(() => {}) // Never resolves, page is reloading
      }
      sessionStorage.removeItem('rd-chunk-reload')
      throw error
    }
  })
}

const Start = lazy(() => import('../routes/Start'))

const routes = SCREENS.map((s) => {
  const loader = REGISTRY[s.slug]
  const El = loader ? resilientLazy(loader) : () => <NotBuilt id={s.id} title={s.title} />
  return {
    path: s.path,
    element: (
      <Suspense fallback={null}>
        <El />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  }
})

const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <Suspense fallback={null}><Start /></Suspense> },
      { path: '/dev/flows', element: <FlowIndex /> },
      ...routes,
      { path: '*', element: <NotBuilt id="X-04" title="Page not found" /> },
    ],
  },
])

export function Routes() {
  return <RouterProvider router={router} />
}
