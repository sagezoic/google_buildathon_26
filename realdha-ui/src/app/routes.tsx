import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { SCREENS } from './screens'
import { path } from './nav'
import { REGISTRY } from './registry'
import { Screen } from './Shell'
import FlowIndex from './FlowIndex'
import { Card } from '../components/ui/card'

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

const routes = SCREENS.map((s) => {
  const loader = REGISTRY[s.slug]
  const El = loader ? lazy(loader) : () => <NotBuilt id={s.id} title={s.title} />
  return { path: path(s.id), element: <Suspense fallback={null}><El /></Suspense> }
})

// API-backed marketplace (Flat Finder data). Lazy so its global stylesheet loads only when visited.
const Marketplace = lazy(() => import('../components/App').then((m) => ({ default: m.App })))

const router = createBrowserRouter([
  { path: '/', element: <Navigate to={path('GP-01')} replace /> },
  { path: '/marketplace', element: <Suspense fallback={null}><Marketplace /></Suspense> },
  { path: '/dev/flows', element: <FlowIndex /> },
  ...routes,
  { path: '*', element: <NotBuilt id="X-04" title="Page not found" /> },
])

export function Routes() {
  return <RouterProvider router={router} />
}
