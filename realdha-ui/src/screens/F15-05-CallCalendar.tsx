import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Card } from '../components/ui/card'
import { cn } from '../lib/cn'

const DAYS = [
  { day: 'Mon', date: '23', events: [] },
  { day: 'Tue', date: '24', events: [{ time: '11:00', title: 'Video call · Priya (A-1804)' }, { time: '14:00', title: 'Site visit · Rohan (A-1202)' }] },
  { day: 'Wed', date: '25', events: [] },
  { day: 'Thu', date: '26', events: [{ time: '14:00', title: 'Video call · Rohan (B-0902)' }] },
  { day: 'Fri', date: '27', events: [] },
  { day: 'Sat', date: '28', events: [] },
  { day: 'Sun', date: '29', events: [] },
]

/** F15-05 · Sales-call calendar and availability. */
export default function CallCalendarScreen() {
  const [view, setView] = useState<'week' | 'month'>('week')

  return (
    <Screen id="F15-05" role="developer" back={path('F15-01')} title="Sales calls calendar">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Sales calls</h1>
            <p className="text-body text-muted">Week of 23 Nov 2026 · Baner Heights site visits & video consults</p>
          </div>
          <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
            <button
              type="button"
              onClick={() => setView('week')}
              className={cn('rounded-[4px] px-3 py-1 transition-colors', view === 'week' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView('month')}
              className={cn('rounded-[4px] px-3 py-1 transition-colors', view === 'month' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
            >
              Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main 7-day schedule */}
          <div className="grid grid-cols-1 divide-y divide-line rounded-card border border-line bg-surface sm:grid-cols-7 sm:divide-x sm:divide-y-0 xl:col-span-9">
            {DAYS.map((d) => (
              <div key={d.date} className="flex min-h-[220px] flex-col gap-2 p-3">
                <div className="flex items-baseline justify-between border-b border-line pb-2">
                  <span className="text-label font-semibold text-muted">{d.day}</span>
                  <span className="text-body font-bold text-text">{d.date}</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {d.events.map((ev, i) => (
                    <div
                      key={i}
                      className="flex flex-col rounded-control border border-primary/30 bg-primary-tint/40 p-1.5 text-overline text-primary"
                    >
                      <span className="font-bold">{ev.time}</span>
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Rail: Settings */}
          <div className="flex flex-col gap-4 xl:col-span-3">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-h3 font-semibold text-text">Availability</h2>
              <div className="flex flex-col gap-2 text-small">
                <div className="flex justify-between">
                  <span className="text-muted">Call length:</span>
                  <span className="font-medium">30 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Window:</span>
                  <span className="font-medium">Next 14 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Weekends:</span>
                  <span className="font-medium text-warning-ink">Site visits only</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
