import { Check, Heart, Mail, Phone, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId, SampleData } from '../../components/ui/record-id'
import { BK } from '../../lib/buyer-store'
import { cn } from '../../lib/cn'

/** F08-04 · Direct hit on a record ID. */
export default function DirectHitScreen() {
  const navigate = useNavigate()
  const [q, setQ] = useState('RA-PUN-001-A-18-04')
  const [shortlist, setShortlist] = usePersistentState<string[]>(BK.shortlist, ['RA-PUN-001-A-18-04'])
  const isShortlisted = shortlist.includes('RA-PUN-001-A-18-04')

  const toggleShortlist = () => {
    if (isShortlisted) {
      setShortlist(shortlist.filter((id) => id !== 'RA-PUN-001-A-18-04'))
    } else {
      setShortlist([...shortlist, 'RA-PUN-001-A-18-04'])
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim() === 'RA-PUN-001-A-18-04') {
      // stay here
    } else {
      navigate(`${path('F08-02')}?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <Screen id="F08-04" back={path('F08-01')} title="Record ID search">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-6 xl:py-10">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2.5">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12 flex-1 rounded-control border-2 border-primary bg-surface px-4 font-mono text-body text-text shadow-e1 outline-none"
            placeholder="Enter record ID..."
          />
          <Button type="submit" size="lg" icon={<Search className="size-4" />}>
            Search
          </Button>
        </form>

        {/* Exact match banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-primary/40 bg-primary-tint px-4 py-3 text-small text-primary">
          <span className="font-medium">Exact match on Realdha ID. Opened directly.</span>
          <Link to={path('F08-01')} className="font-semibold hover:underline">
            Not this one? Search by address
          </Link>
        </div>

        {/* Property Card */}
        <Card className="flex flex-col gap-5 p-6 xl:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RecordId id="RA-PUN-001-A-18-04" />
              <SampleData />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="success" icon={<Check className="size-3.5" />}>
                Signed off
              </Pill>
              <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                Anchored on-chain
              </Pill>
              <Pill tone="success">Available</Pill>
            </div>
          </div>

          <div>
            <h1 className="text-h1 font-semibold text-text">A-1804 · 3 BHK, Baner Heights</h1>
            <p className="text-body text-muted">Baner, Pune · Sahyadri Developers (sample)</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-line py-4 sm:grid-cols-4">
            <div>
              <span className="text-label text-muted">Carpet area</span>
              <div className="text-body font-semibold">1,180 sq ft</div>
            </div>
            <div>
              <span className="text-label text-muted">Facing</span>
              <div className="text-body font-semibold">East</div>
            </div>
            <div>
              <span className="text-label text-muted">View</span>
              <div className="text-body font-semibold">Hill</div>
            </div>
            <div>
              <span className="text-label text-muted">Price</span>
              <div className="text-body font-bold text-text">₹1,42,00,000</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button to={path('F09-03')}>
              Open full record
            </Button>
            <Button variant="secondary" to={`${path('F12-01')}?unit=RA-PUN-001-A-18-04`} icon={<Mail className="size-4" />}>
              Enquire
            </Button>
            <Button
              variant="secondary"
              onClick={toggleShortlist}
              icon={<Heart className={cn('size-4', isShortlisted && 'fill-danger text-danger')} />}
            >
              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>
            <Button variant="secondary" to={`${path('F13-01')}?unit=RA-PUN-001-A-18-04`} icon={<Phone className="size-4" />}>
              Book a call
            </Button>
          </div>
        </Card>

        <p className="text-overline text-muted">
          The official land register remains the legal record.
        </p>
      </div>
    </Screen>
  )
}
