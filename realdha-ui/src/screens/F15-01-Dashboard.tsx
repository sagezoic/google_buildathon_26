import { Building2, Calendar, MessageSquare, Plus, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { DEV_STATS } from '../data/fixtures/f15-devconsole'
import { cn } from '../lib/cn'

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

        {/* Console Hub Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="flex flex-col justify-between gap-4 p-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-text">
                <Building2 className="size-5 text-primary" />
                <span>Unit Inventory</span>
              </div>
              <p className="text-small text-muted">
                Inspect unit grid across towers, change prices inline, and manage release availability.
              </p>
            </div>
            <Button variant="secondary" to={path('F15-02')} icon={<ArrowUpRight className="size-3.5" />}>
              Manage inventory
            </Button>
          </Card>

          <Card className="flex flex-col justify-between gap-4 p-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-text">
                <MessageSquare className="size-5 text-primary" />
                <span>Enquiries Inbox</span>
              </div>
              <p className="text-small text-muted">
                Review buyer questions on Baner Heights, view loan requirements, and send direct replies.
              </p>
            </div>
            <Button variant="secondary" to={path('F15-04')} icon={<ArrowUpRight className="size-3.5" />}>
              Open inbox ({stats.newEnquiries})
            </Button>
          </Card>

          <Card className="flex flex-col justify-between gap-4 p-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-text">
                <Calendar className="size-5 text-primary" />
                <span>Sales Calls & Visits</span>
              </div>
              <p className="text-small text-muted">
                Calendar schedule of upcoming buyer video consultations and onsite sample flat visits.
              </p>
            </div>
            <Button variant="secondary" to={path('F15-05')} icon={<ArrowUpRight className="size-3.5" />}>
              View calendar
            </Button>
          </Card>

          <Card className="flex flex-col justify-between gap-4 p-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-text">
                <TrendingUp className="size-5 text-primary" />
                <span>Activity Heatmap</span>
              </div>
              <p className="text-small text-muted">
                Buyer demand analytics by tower floor, facing, and unit configuration.
              </p>
            </div>
            <Button variant="secondary" to={path('F15-06')} icon={<ArrowUpRight className="size-3.5" />}>
              View heatmap
            </Button>
          </Card>

          <Card className="flex flex-col justify-between gap-4 p-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-text">
                <Users className="size-5 text-primary" />
                <span>Channel Partners</span>
              </div>
              <p className="text-small text-muted">
                Authorize verified real estate brokers and track broker-assisted unit registrations.
              </p>
            </div>
            <Button variant="secondary" to={path('F15-07')} icon={<ArrowUpRight className="size-3.5" />}>
              Manage partners
            </Button>
          </Card>
        </div>
      </div>
    </Screen>
  )
}
