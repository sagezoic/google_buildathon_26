import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { PROJECTS } from '../../data/fixtures/f09-area'
import { PROPERTIES } from '../../data/fixtures/f08-search'
import { inr } from '../../data/fixtures/f11-buyer'
import { getPropertyThumbnail } from '../../data/property-images'
import { cn } from '../../lib/cn'

/** F09-02 · Area list of projects and properties in Baner. */
export default function AreaListScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'projects' | 'properties'>('projects')
  const [page, setPage] = useState(1)

  return (
    <Screen id="F09-02" back={path('F09-01')} title="Baner listings">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-1">
          <div className="text-small text-muted">
            India › Maharashtra › Pune › <b className="text-text">Baner</b>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <h1 className="text-h1 font-semibold text-text">Projects and properties in Baner</h1>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => navigate(path('F09-01'))}
                className="rounded-[4px] px-3.5 py-1.5 text-muted hover:text-text"
              >
                Map
              </button>
              <span className="rounded-[4px] bg-primary px-3.5 py-1.5 text-on-primary">
                List
              </span>
            </div>
          </div>
        </div>

        {/* Filter controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setTab('projects')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', tab === 'projects' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setTab('properties')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', tab === 'properties' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                Properties
              </button>
            </div>

            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Type
            </Button>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Status
            </Button>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Price
            </Button>
          </div>

          <span className="text-small text-muted">
            5 verified developments in Baner, Pune
          </span>
        </div>

        {/* Data Table */}
        <Card className="flex flex-col overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {tab === 'projects' ? (
                  PROJECTS.map((proj) => {
                    const thumb = getPropertyThumbnail(proj.id)
                    return (
                      <tr key={proj.id} className="hover:bg-canvas/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={thumb} alt="" className="size-11 rounded-control object-cover bg-sunken" />
                            <div>
                              <div className="font-semibold text-text">{proj.name}</div>
                              <div className="text-overline text-muted">{proj.sub}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-text">
                          {proj.id}
                        </td>
                        <td className="px-4 py-3">
                          <Pill tone={proj.status === 'checked' ? 'success' : 'neutral'}>
                            {proj.status === 'checked' ? 'Documents checked' : 'New launch'}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 font-medium text-text">
                          {proj.priceRange}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="secondary" size="sm" to={path('F09-03')}>
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  PROPERTIES.slice(0, 5).map((prop) => {
                    const thumb = getPropertyThumbnail(prop.id, prop.type)
                    return (
                      <tr key={prop.id} className="hover:bg-canvas/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={thumb} alt="" className="size-11 rounded-control object-cover bg-sunken" />
                            <div>
                              <div className="font-semibold text-text">{prop.label}</div>
                              <div className="text-overline text-muted">{prop.project}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-text">
                          {prop.id}
                        </td>
                        <td className="px-4 py-3">
                          <Pill tone={prop.status === 'signed-off' ? 'success' : 'warning'}>
                            {prop.status === 'signed-off' ? 'Signed off' : 'Lawyer review'}
                          </Pill>
                        </td>
                        <td className="px-4 py-3 font-medium text-text">
                          {inr(prop.price)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="secondary" size="sm" to={path('F09-03')}>
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line pt-4 text-small text-muted">
          <span>Page {page} of 83</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= 83}
              onClick={() => setPage((p) => Math.min(83, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}
