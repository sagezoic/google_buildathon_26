import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { cn } from '../lib/cn'

/** F08-03 · No results and invalid ID states. */
export default function NoResultsInvalidScreen() {
  const [state, setState] = useDemoState(['no-results', 'invalid-id'] as const)
  const navigate = useNavigate()

  const handleResetFilters = () => {
    navigate(path('F08-02'))
  }

  return (
    <Screen id="F08-03" back={path('F08-01')} title="Search results">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <Link to={path('F08-01')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>Back to search</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-label text-muted">Demo state:</span>
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setState('no-results')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'no-results' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State A · No results
              </button>
              <button
                type="button"
                onClick={() => setState('invalid-id')}
                className={cn('rounded-[4px] px-3 py-1 transition-colors', state === 'invalid-id' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                State B · Invalid ID
              </button>
            </div>
          </div>
        </div>

        {state === 'no-results' ? (
          <Card className="flex flex-col items-start gap-4 p-6 xl:p-8">
            <Pill tone="neutral">No results</Pill>
            <h2 className="text-h1 font-semibold text-text">
              Nothing matches "Baner, 5 BHK, under ₹50 L"
            </h2>
            <p className="text-body text-muted">
              Try fewer filters or a wider area. These are the closest changes:
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Remove price filter
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Include Balewadi
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Try 4 BHK
              </Button>
            </div>

            <div className="pt-2">
              <Button onClick={handleResetFilters} icon={<RotateCcw className="size-4" />}>
                Reset all filters
              </Button>
            </div>

            <div className="border-t border-line pt-4 text-small text-muted">
              Not on Realdha yet?{' '}
              <Link to={path('F05-01')} className="font-medium text-primary hover:underline">
                Check documents for a property
              </Link>
              .
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-start gap-4 p-6 xl:p-8">
            <div className="w-full">
              <div className="flex h-control w-full items-center rounded-control border-2 border-danger bg-surface px-3 font-mono text-small text-danger">
                RA-PUN-001-A-18
              </div>
            </div>

            <div className="flex items-center gap-2 text-small font-semibold text-danger">
              <AlertCircle className="size-4" />
              <span>That ID is not complete</span>
            </div>

            <h2 className="text-h1 font-semibold text-text">
              We could not read this ID
            </h2>

            <p className="text-body text-muted">
              A full ID has 5 parts, for example <span className="font-mono font-medium text-text">RA-PUN-001-A-18-04</span>. Yours has 4. Check for a missing unit number.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <Button variant="secondary" to={`${path('F08-02')}?q=RA-PUN-001-A-18`}>
                Search "RA-PUN-001-A-18" as text
              </Button>
              <Button variant="secondary" to={path('F08-04')}>
                Did you mean RA-PUN-001-A-18-04?
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Screen>
  )
}
