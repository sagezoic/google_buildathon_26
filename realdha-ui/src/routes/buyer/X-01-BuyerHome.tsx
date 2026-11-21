import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { useActiveRole } from '../../app/active-role'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import {
  LAUNCHES,
  PROFILE_DEFAULT,
  RECENT,
  SHORTLIST,
  type Launch,
  type Listing,
  type Profile,
} from '../../data/fixtures/x-flow'
import { getPropertyThumbnail } from '../../data/property-images'

function PropertyCard({ item }: { item: Listing }) {
  const thumb = getPropertyThumbnail(item.id)
  const isAnchored = item.status === 'anchored'

  return (
    <Link
      to={item.to}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface text-text no-underline shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
        <img
          src={thumb}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5">
          <RecordId id={item.id} className="mx-0 bg-surface px-2 py-1 text-[11px] text-text shadow-e1" />
          <Pill
            className="rounded-control bg-surface px-2 py-1 shadow-e1"
            tone={isAnchored ? 'chain' : 'success'}
            icon={isAnchored ? <ShieldCheck className="size-3" /> : <CheckCircle2 className="size-3" />}
          >
            {isAnchored ? 'On-chain' : 'Signed off'}
          </Pill>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4 gap-2">
        <div>
          <div className="font-semibold text-text group-hover:text-brand transition-colors line-clamp-1">
            {item.title}
          </div>
          <div className="text-chip text-muted">{item.locality}</div>
          <div className="mt-1 text-label text-muted">{item.specs}</div>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-2.5">
          <span className="text-body font-bold text-text">{item.price}</span>
          <span className="text-chip font-medium text-primary-text group-hover:underline">
            View passport →
          </span>
        </div>
      </div>
    </Link>
  )
}

function ProjectCard({ project }: { project: Launch }) {
  const thumb = getPropertyThumbnail(project.id)

  return (
    <Link
      to={project.to}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface text-text no-underline shadow-e1 transition-all duration-200 hover:border-line-hover hover:shadow-e2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
        <img
          src={thumb}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5">
          <span className="rounded-control bg-surface/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-text shadow-e1">
            {project.id}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4 gap-2">
        <div>
          <div className="font-semibold text-text group-hover:text-brand transition-colors line-clamp-1">
            {project.title}
          </div>
          <div className="text-chip text-muted">{project.sub}</div>
          <div className="mt-1 font-mono text-[11px] text-muted">RERA: {project.rera}</div>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-2.5">
          <span className="text-body font-bold text-text">{project.price}</span>
          <span className="text-chip font-medium text-primary-text group-hover:underline">
            Explore units →
          </span>
        </div>
      </div>
    </Link>
  )
}

/** X-01 · Buyer home / explore screen. */
export default function BuyerHome() {
  const [profile] = usePersistentState<Profile>('x.profile', PROFILE_DEFAULT)
  const [activeRole] = useActiveRole()
  const first = profile.name.trim().split(/\s+/)[0]


  if (activeRole === 'owner') return <Navigate to={path('GP-06')} replace />

  return (
    <Screen id="X-01">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-6 md:px-8 xl:py-10">
        {/* Distilled Hero Banner (Search bar removed in favor of global header search) */}
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex flex-col gap-2 max-w-3xl">
            <h1 className="text-h1 font-bold text-text sm:text-display tracking-tight">
              {profile.saved ? `Welcome back, ${first}` : 'Check a property before you pay'}
            </h1>
            <p className="text-body text-muted leading-relaxed">
              Every property here has AI-checked documents, a lawyer's sign-off and a fingerprint anchored on-chain.
              Check a title deed you already have, or search properties that are already verified.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button to={path('F05-01')} size="lg" className="h-11 px-6 font-semibold shadow-e1" icon={<ShieldCheck className="size-4" />}>
              Verify a title deed
            </Button>
            <Button to={path('F08-01')} variant="secondary" size="lg" className="h-11 px-5">
              Search verified properties
            </Button>
          </div>
        </div>

        {/* Active Title Check Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-e1 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-chain-tint text-chain-ink">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold text-text">Active title verification</span>
                <span className="font-mono text-label text-muted">#CK-2026-0412</span>
              </div>
              <p className="text-small text-muted">
                7/12 extracts and mutation entries under legal sign-off review by Adv. Meera Joshi.
              </p>
            </div>
          </div>
          <Button to={path('F05-03')} variant="secondary" size="sm" icon={<ArrowRight className="size-3.5" />}>
            View report status
          </Button>
        </div>

        {/* Section 1: Verified Properties */}
        <section aria-labelledby="h-verified" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="h-verified" className="text-h2 font-semibold text-text">
                Verified properties
              </h2>
              <p className="text-small text-muted">
                Anchored title deeds with 30-year revenue continuity and spatial digital twins.
              </p>
            </div>
            <Link
              to={path('F08-01')}
              className="text-small font-semibold text-primary-text no-underline hover:underline"
            >
              See all properties →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RECENT.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Section 2: New Builder Launches */}
        <section aria-labelledby="h-launches" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="h-launches" className="text-h2 font-semibold text-text">
                New project launches
              </h2>
              <p className="text-small text-muted">
                Verified residential and commercial developments with RERA approvals.
              </p>
            </div>
            <Link
              to={path('F10-06')}
              className="text-small font-semibold text-primary-text no-underline hover:underline"
            >
              Browse all launches →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LAUNCHES.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Section 3: Shortlist & Comparison Strip */}
        {SHORTLIST.length > 0 && (
          <section aria-labelledby="h-shortlist" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-e1 sm:p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-tint text-primary-text">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h3 id="h-shortlist" className="text-body font-semibold text-text">
                    Shortlisted properties ({SHORTLIST.length})
                  </h3>
                  <p className="text-small text-muted">
                    Compare unit dimensions, floor plans, legal sign-offs, and indicative prices side-by-side.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button to={path('F11-01')} variant="secondary" size="sm">
                  View shortlist
                </Button>
                <Button to={path('F11-02')} size="sm" icon={<ArrowRight className="size-3.5" />}>
                  Compare selected
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Section 4: Institutional Verification Standard */}
        <section
          aria-label="Institutional verification standard"
          className="rounded-card border border-line bg-surface p-6 shadow-e1 sm:p-8"
        >
          <div className="flex flex-col gap-1 pb-6 border-b border-line">
            <h2 className="text-h2 font-semibold text-text">
              How a record gets verified
            </h2>
            <p className="text-small text-muted max-w-xl">
              Three steps sit behind every verified property.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="flex size-9 items-center justify-center rounded-control bg-sunken text-primary-text">
                <FileCheck className="size-5" />
              </div>
              <h3 className="text-body font-semibold text-text">AI document check</h3>
              <p className="text-small text-muted">
                AI reads 7/12 extracts, mutation entries and NA orders in Marathi and English, and flags gaps.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex size-9 items-center justify-center rounded-control bg-sunken text-success-ink">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="text-body font-semibold text-text">Lawyer sign-off</h3>
              <p className="text-small text-muted">
                A land-title advocate reviews the findings and makes the legal call. The AI does not.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex size-9 items-center justify-center rounded-control bg-sunken text-chain-ink">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-body font-semibold text-text">On-chain proof</h3>
              <p className="text-small text-muted">
                Document fingerprints are anchored on the Sepolia test network, so any later change is detectable.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Screen>
  )
}
