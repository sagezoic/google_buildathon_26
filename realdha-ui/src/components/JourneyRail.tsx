import { Link } from 'react-router'
import { journeyFor, locate } from '../app/journeys'
import { cn } from '../lib/cn'

/**
 * Names the stages of the visitor's walk-through and the capability each one shows.
 * Position only: it never claims a stage is complete, since screens can be opened in any order.
 */
export function JourneyRail({ role, screenId }: { role: string; screenId: string }) {
  const journey = journeyFor(role)
  const here = journey ? locate(journey, screenId) : null
  if (!journey || !here) return null

  return (
    <nav
      aria-label={`${journey.name}: stages`}
      className="sticky top-16 z-30 flex-none border-b border-line bg-surface/95 backdrop-blur-xs"
    >
      <ol className="mx-auto flex w-full max-w-[1240px] gap-1 overflow-x-auto px-3 py-2 md:px-6 [scrollbar-width:none]">
        {journey.stages.map((s, i) => {
          const current = i === here.stage
          return (
            <li key={s.label} className="min-w-0 flex-none md:flex-1 md:basis-0">
              <Link
                to={s.to}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex h-full min-h-11 flex-col justify-center gap-0.5 rounded-control border px-3 py-1.5 no-underline transition-colors',
                  current
                    ? 'border-primary bg-primary-tint text-primary-text'
                    : 'border-transparent text-muted hover:bg-sunken hover:text-text',
                )}
              >
                <span className="flex items-center gap-2 whitespace-nowrap text-chip font-semibold">
                  <span
                    aria-hidden
                    className={cn(
                      'grid size-5 flex-none place-items-center rounded-full border text-[11px] font-semibold tabular-nums',
                      current ? 'border-primary bg-primary text-on-primary' : 'border-line-strong',
                    )}
                  >
                    {i + 1}
                  </span>
                  {s.label}
                </span>
                <span className={cn('line-clamp-1 text-label max-xl:hidden', current && 'text-text')}>{s.feature}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
