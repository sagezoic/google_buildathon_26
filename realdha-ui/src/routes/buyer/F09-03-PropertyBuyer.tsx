import { Check, Compass, Eye, Heart, Layers, Mail, MapPin, MessageSquare, Phone, Rotate3d, Share2, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { RecordId } from '../../components/ui/record-id'
import { Tour360 } from '../../components/ui/tour-360'
import { getPropertyPhotos } from '../../data/property-images'
import { BK } from '../../lib/buyer-store'
import { cn } from '../../lib/cn'
import OsmMap from '../../components/map/OsmMap'
import OsmMarker from '../../components/map/OsmMarker'

/** F09-03 · Single property buyer view (A-1804). */
export default function PropertyBuyerScreen() {
  const [shortlist, setShortlist] = usePersistentState<string[]>(BK.shortlist, ['RA-PUN-001-A-18-04'])
  const [activeMedia, setActiveMedia] = useState<'photos' | 'floorplan' | 'tour' | 'map'>('photos')
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const isShortlisted = shortlist.includes('RA-PUN-001-A-18-04')
  const photos = getPropertyPhotos('RA-PUN-001-A-18-04')

  const toggleShortlist = () => {
    if (isShortlisted) {
      setShortlist(shortlist.filter((id) => id !== 'RA-PUN-001-A-18-04'))
    } else {
      setShortlist([...shortlist, 'RA-PUN-001-A-18-04'])
    }
  }

  return (
    <Screen id="F09-03" back={path('F09-02')} title="A-1804 · Baner Heights">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-small text-muted">
          <nav aria-label="Breadcrumb">
            Baner › Baner Heights › <b className="text-text">Unit A-1804</b>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" to={path('F11-03')} icon={<MessageSquare className="size-4" />}>
              Ask AI about this property
            </Button>
            <Button variant="ghost" size="sm" to={`${path('F07-01')}?record=RA-PUN-001-A-18-04`} icon={<Share2 className="size-4" />}>
              Share
            </Button>
          </div>
        </div>

        {/* Media Gallery / Split View */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium shadow-e1">
              <button
                type="button"
                onClick={() => setActiveMedia('photos')}
                className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 transition-colors', activeMedia === 'photos' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                <Eye className="size-3.5" /> Photos ({photos.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMedia('floorplan')}
                className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 transition-colors', activeMedia === 'floorplan' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                <Layers className="size-3.5" /> Floor Plan & Walkthrough
              </button>
              <button
                type="button"
                onClick={() => setActiveMedia('tour')}
                className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 transition-colors', activeMedia === 'tour' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                <Rotate3d className="size-3.5" /> 360° Tour
              </button>
              <button
                type="button"
                onClick={() => setActiveMedia('map')}
                className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 transition-colors', activeMedia === 'map' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                <MapPin className="size-3.5" /> Neighborhood Map
              </button>
            </div>
            <span className="text-label text-muted max-md:hidden">Sahyadri Hills Facing · Verified Architectural Layout</span>
          </div>

          {activeMedia === 'photos' ? (
            <div className="grid grid-cols-1 gap-2.5 overflow-hidden rounded-card md:grid-cols-4 md:grid-rows-2 md:h-[460px]">
              {/* Primary Large Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-sunken md:col-span-2 md:row-span-2 md:aspect-auto">
                <img
                  src={photos[activePhotoIdx]}
                  alt="Baner Heights Unit A-1804 Primary View"
                  className="size-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 rounded-control bg-surface/90 px-2.5 py-1 text-label font-semibold text-text shadow-e1 backdrop-blur-xs">
                  Photo {activePhotoIdx + 1} of {photos.length}
                </div>
              </div>
              {/* Thumbnail Grid */}
              {photos.slice(0, 4).map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={cn(
                    'relative hidden aspect-[16/10] cursor-pointer overflow-hidden bg-sunken transition-opacity hover:opacity-90 md:block md:aspect-auto',
                    activePhotoIdx === idx && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  <img src={p} alt={`Thumbnail ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : activeMedia === 'floorplan' ? (
            <div className="relative flex min-h-[380px] flex-col items-center justify-center rounded-card border border-line bg-surface p-6 shadow-e1">
              <svg viewBox="0 0 700 360" className="max-h-[320px] w-full max-w-[620px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Master Bed */}
                <rect x="40" y="40" width="220" height="150" rx="4" className="fill-canvas stroke-line-strong" strokeWidth="2" />
                <text x="150" y="110" textAnchor="middle" className="fill-text text-sm font-semibold">Master Bedroom</text>
                <text x="150" y="130" textAnchor="middle" className="fill-muted text-xs">14' x 12' · Wooden Floor</text>
                {/* Living & Dining */}
                <rect x="280" y="40" width="360" height="200" rx="4" className="fill-canvas stroke-line-strong" strokeWidth="2" />
                <text x="460" y="130" textAnchor="middle" className="fill-text text-base font-semibold">Living & Dining Hall</text>
                <text x="460" y="152" textAnchor="middle" className="fill-muted text-xs">22' x 16' · Marble Tiles</text>
                {/* Hill Balcony */}
                <rect x="280" y="250" width="360" height="70" rx="4" className="fill-primary/10 stroke-primary" strokeWidth="2" strokeDasharray="4 4" />
                <text x="460" y="290" textAnchor="middle" className="fill-primary text-xs font-semibold">Private Balcony · Unobstructed Hill View (18th Floor)</text>
                {/* Kitchen */}
                <rect x="40" y="200" width="220" height="120" rx="4" className="fill-canvas stroke-line-strong" strokeWidth="2" />
                <text x="150" y="255" textAnchor="middle" className="fill-text text-sm font-semibold">Modular Kitchen</text>
                <text x="150" y="275" textAnchor="middle" className="fill-muted text-xs">10' x 8' · Dry Balcony</text>
              </svg>
              <div className="mt-2 text-label text-muted">Architectural Sanctioned Plan · Unit A-1804 (1,180 sq ft carpet)</div>
            </div>
          ) : activeMedia === 'tour' ? (
            <Tour360 height="460px" />
          ) : (
            <div className="relative min-h-[460px] overflow-hidden rounded-card border border-line bg-sunken">
              <OsmMap center={[73.7868, 18.5590]} zoom={15} showThemeToggle className="size-full min-h-[460px]">
                <OsmMarker position={[73.7868, 18.5590]}>
                  <div className="flex flex-col items-center">
                    <div className="rounded-control border-2 border-white bg-primary px-2.5 py-1 text-chip font-bold text-on-primary shadow-e2 whitespace-nowrap">
                      Baner Heights · A-1804
                    </div>
                    <div className="size-2 -translate-y-1 rotate-45 border-r border-b border-white bg-primary" />
                  </div>
                </OsmMarker>

                {/* Nearby landmarks */}
                {[
                  { name: 'Baner Hill Reserve', dist: '350 m', coord: [73.7830, 18.5550] as [number, number] },
                  { name: 'Balewadi High St', dist: '1.2 km', coord: [73.7780, 18.5720] as [number, number] },
                  { name: 'The Orchid School', dist: '1.4 km', coord: [73.7920, 18.5630] as [number, number] },
                  { name: 'Metro Station Line 3', dist: '2.1 km', coord: [73.7710, 18.5800] as [number, number] },
                ].map((item) => (
                  <OsmMarker key={item.name} position={item.coord}>
                    <div className="flex items-center gap-1 rounded-pill border border-line bg-surface/95 px-2 py-0.5 text-[10px] font-medium text-text shadow-sm backdrop-blur-xs whitespace-nowrap">
                      <span>{item.name}</span>
                      <span className="text-muted">· {item.dist}</span>
                    </div>
                  </OsmMarker>
                ))}

                <div className="absolute bottom-3 left-3 z-10 rounded-control border border-line bg-surface/90 px-3 py-1.5 text-label font-medium text-text shadow-e1 backdrop-blur-xs">
                  Baner Hill Reserve, Baner, Pune 411045 · Sahyadri Developers
                </div>
              </OsmMap>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main property details */}
          <div className="flex flex-col gap-6 xl:col-span-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <RecordId id="RA-PUN-001-A-18-04" copyable />
                <Pill tone="success" icon={<Check className="size-3.5" />}>
                  Lawyer Signed Off
                </Pill>
                <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>
                  Anchored on-chain
                </Pill>
                <Pill tone="brand" icon={<Sparkles className="size-3.5" />}>MahaRERA Sanctioned</Pill>
              </div>
              <h1 className="text-h1 font-bold text-text">Unit A-1804 · 3 BHK Luxury Apartment</h1>
              <p className="text-body text-muted">
                Baner Heights, Tower A, 18th Floor · Baner, Pune 411045
              </p>
            </div>

            {/* Overview Card */}
            <Card className="flex flex-col gap-4">
              <h2 className="text-h2 font-semibold text-text">Property Specifications</h2>
              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                <div>
                  <span className="text-label text-muted">Carpet area</span>
                  <div className="text-body font-semibold">1,180 sq ft</div>
                </div>
                <div>
                  <span className="text-label text-muted">Super built-up</span>
                  <div className="text-body font-semibold">1,420 sq ft</div>
                </div>
                <div>
                  <span className="text-label text-muted">Facing</span>
                  <div className="text-body font-semibold">East (Vaastu Compliant)</div>
                </div>
                <div>
                  <span className="text-label text-muted">Balcony view</span>
                  <div className="text-body font-semibold">Baner Hill Reserve</div>
                </div>
                <div>
                  <span className="text-label text-muted">Floor</span>
                  <div className="text-body font-semibold">18 of 24</div>
                </div>
                <div>
                  <span className="text-label text-muted">Parking</span>
                  <div className="text-body font-semibold">1 Covered Basement (P-118)</div>
                </div>
                <div>
                  <span className="text-label text-muted">Possession</span>
                  <div className="text-body font-semibold">Ready to Move</div>
                </div>
                <div>
                  <span className="text-label text-muted">MahaRERA ID</span>
                  <div className="font-mono text-body font-semibold">P52100018892</div>
                </div>
              </div>
            </Card>

            {/* 30-Year Chain of Title Verification */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-h2 font-semibold text-text">30-Year Title Chain & Legal Status</h2>
                <Pill tone="chain" icon={<ShieldCheck className="size-3.5" />}>Chain Complete</Pill>
              </div>
              <div className="flex flex-col divide-y divide-line">
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-body font-medium">MahaRERA Sanctioned Plan & Registration</div>
                    <div className="text-chip text-muted">Registration certificate verified against MahaRERA portal</div>
                  </div>
                  <Pill tone="success" icon={<Check className="size-3" />}>Verified</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-body font-medium">Occupancy Certificate (OC)</div>
                    <div className="text-chip text-muted">Issued by PMC Pune Municipal Corporation</div>
                  </div>
                  <Pill tone="success" icon={<Check className="size-3" />}>Verified</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-body font-medium">Mutation Entries (Ferfar #2291)</div>
                    <div className="text-chip text-muted">Maharashtra Revenue Department · 7/12 land title clear</div>
                  </div>
                  <Pill tone="success" icon={<Check className="size-3" />}>No Encumbrance</Pill>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-body font-medium">Advocate Legal Search Report</div>
                    <div className="text-chip text-muted">Adv. Meera Joshi · Signed off 18 Nov 2026</div>
                  </div>
                  <Pill tone="success" icon={<Check className="size-3" />}>Signed Off</Pill>
                </div>
              </div>
              <div className="rounded-control bg-canvas p-3 text-small text-muted">
                Anchored to Ethereum Sepolia Ledger via Google Cloud KMS. SHA-256 fingerprint: <span className="font-mono text-text">0x9f3a…c21e</span>
              </div>
            </Card>
          </div>

          {/* Sticky sidebar */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Card className="sticky top-6 flex flex-col gap-5 p-6 shadow-e2">
              <div className="flex flex-col">
                <span className="text-label text-muted">All-inclusive asking price</span>
                <span className="text-h1 font-bold text-text">₹1,42,00,000</span>
                <span className="text-small text-muted">₹12,034 / sq ft · Transparent builder pricing</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button size="lg" to={`${path('F12-01')}?unit=RA-PUN-001-A-18-04`} icon={<Mail className="size-4" />}>
                  Enquire with builder
                </Button>
                <Button size="lg" variant="secondary" to={`${path('F13-01')}?unit=RA-PUN-001-A-18-04`} icon={<Phone className="size-4" />}>
                  Book verified visit
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={toggleShortlist}
                  icon={<Heart className={cn('size-4', isShortlisted && 'fill-danger text-danger')} />}
                >
                  {isShortlisted ? 'Saved to shortlist' : 'Add to shortlist'}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  to={path('GP-16')}
                  icon={<Compass className="size-4" />}
                >
                  View digital twin passport
                </Button>
              </div>

              <div className="border-t border-line pt-3 text-overline text-muted">
                Listed by Sahyadri Developers · Direct verified developer inventory · 100% verified documents.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
