import { Box, Building2, Calendar, FolderPlus, MessageSquare, Plus, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router'
import { useState } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { DEV_STATS } from '../../../data/fixtures/f15-devconsole'
import { cn } from '../../../lib/cn'

const GROUPS = [
  {
    title: 'Set up a project',
    sub: 'Put each unit on a verified record and give buyers something to walk through.',
    items: [
      { Icon: FolderPlus, name: 'Create a project', desc: 'Towers, floors and units, by form or CSV.', to: path('F10-01'), cta: 'Start a project' },
      { Icon: Box, name: '3D digital twin', desc: 'Upload a model or request one.', to: path('F14-01'), cta: 'Add a 3D twin' },
      { Icon: Building2, name: 'Unit inventory', desc: 'Change prices inline and release availability.', to: path('F15-02'), cta: 'Manage inventory' },
    ],
  },
  {
    title: 'See buyer interest',
    sub: 'Who is asking, when they want a call, and which units draw attention.',
    items: [
      { Icon: MessageSquare, name: 'Enquiries', desc: 'Buyer questions and loan requirements.', to: path('F15-04'), cta: 'Open inbox' },
      { Icon: Calendar, name: 'Calls and visits', desc: 'Upcoming video calls and site visits.', to: path('F15-05'), cta: 'View calendar' },
      { Icon: TrendingUp, name: 'Demand heatmap', desc: 'Interest by floor, facing and configuration.', to: path('F15-06'), cta: 'View heatmap' },
      { Icon: Users, name: 'Channel partners', desc: 'Authorise brokers and track their bookings.', to: path('F15-07'), cta: 'Manage partners' },
    ],
  },
]

const RANGES = ['Today', '7 days', '30 days']

/** F15-01 · Developer dashboard. */
export default function DevDashboardScreen() {
  const [range, setRange] = useState('7 days')
  const stats = DEV_STATS

  return (
    <Screen id="F15-01" role="developer" title="Developer dashboard">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-label text-muted">Sahyadri Developers (sample)</span>
            <h1 className="text-h1 font-bold text-text">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded-[4px] px-3 py-1 transition-colors',
                    range === r ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button to={path('F10-01')} icon={<Plus className="size-3.5" />}>
              Create project
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="flex flex-col gap-1 p-5">
            <span className="text-label text-muted">Available</span>
            <span className="text-h1 font-bold text-text">{stats.available}</span>
            <span className="text-small text-muted">of {stats.total} units</span>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <span className="text-label text-muted">Booked</span>
            <span className="text-h1 font-bold text-warning-ink">{stats.booked}</span>
            <span className="text-small text-muted">units</span>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <span className="text-label text-muted">Sold</span>
            <span className="text-h1 font-bold text-success-ink">{stats.sold}</span>
            <span className="text-small text-muted">units</span>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <span className="text-label text-muted">New enquiries</span>
            <span className="text-h1 font-bold text-primary">{stats.newEnquiries}</span>
            <span className="text-small text-success-ink">{stats.enquiriesChange}</span>
          </Card>
        </div>

        {GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={`h-${g.title}`} className="flex flex-col gap-3">
            <div>
              <h2 id={`h-${g.title}`} className="text-h3 font-semibold text-text">{g.title}</h2>
              <p className="text-small text-muted">{g.sub}</p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map(({ Icon, name, desc, to, cta }) => (
                <li key={name}>
                  <Link to={to} className="flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 text-text no-underline transition-colors hover:border-line-hover hover:bg-sunken">
                    <Icon className="mt-0.5 size-5 flex-none text-primary-text" aria-hidden />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-semibold">{name}</span>
                      <span className="text-small text-muted">{desc}</span>
                      <span className="pt-1 text-chip font-medium text-primary-text">{cta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  )
}
