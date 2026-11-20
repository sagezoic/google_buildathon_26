import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LayoutGrid,
  List,
  Map as MapIcon,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  cardBadges,
  fetchCities,
  formatInr,
  grossYield,
  lowestRent,
  type CitySummary,
  type FlatMode,
  type FlatSort,
  type SocietyCard,
} from '../lib/flats-api'
import { useSocieties } from '../lib/useSocieties'

interface PropertySearchProps {
  searchQuery: string
  onOpenSociety: (id: string) => void
  onOpenAssistant?: () => void
}

const CATEGORIES = [
  { id: 'all', label: 'All Homes', icon: LayoutGrid },
  { id: 'apartment', label: 'Apartments', icon: Building2 },
  { id: 'villa', label: 'Villas', icon: Home },
  { id: 'builder floor', label: 'Builder Floors', icon: Building2 },
  { id: 'plot', label: 'Plots', icon: MapIcon },
  { id: 'ready', label: 'Ready to Move', icon: CheckCircle2 },
  { id: 'favorites', label: 'Favorites', icon: Heart },
] as const

const SORTS: Array<{ id: FlatSort; label: string }> = [
  { id: 'best', label: 'Best match' },
  { id: 'price', label: 'Price' },
  { id: 'rating', label: 'Rating' },
]

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'

export function PropertySearch({ searchQuery, onOpenSociety, onOpenAssistant }: PropertySearchProps) {
  const [city, setCity] = useState('pune')
  const [cities, setCities] = useState<CitySummary[]>([])
  const [mode, setMode] = useState<FlatMode>('buy')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const [sortIdx, setSortIdx] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [imageIdx, setImageIdx] = useState<Record<string, number>>({})

  useEffect(() => {
    const c = new AbortController()
    fetchCities(c.signal)
      .then((list) => setCities(list.filter((x) => x.societies_count > 0)))
      .catch(() => {})
    return () => c.abort()
  }, [])

  const sort = SORTS[sortIdx]
  const kind = category !== 'all' && category !== 'ready' && category !== 'favorites' ? category : undefined
  const { data, loading, error, retry } = useSocieties({
    city,
    q: searchQuery.trim() || undefined,
    mode,
    kind,
    ready: category === 'ready',
    sort: sort.id,
    limit: 100,
  })

  const societies = useMemo(() => {
    const all = data?.societies ?? []
    return category === 'favorites' ? all.filter((s) => favorites[s.id]) : all
  }, [data, category, favorites])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const stepImage = (id: string, len: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setImageIdx((prev) => ({ ...prev, [id]: (((prev[id] || 0) + delta) % len + len) % len }))
  }

  const resetFilters = () => {
    setCategory('all')
    setMode('buy')
  }

  return (
    <div className="lofty-marketplace-root">
      {/* 1. Filter bar */}
      <div className="lofty-filter-header">
        <div className="lofty-filter-container">
          <div className="lofty-filter-top-row">
            <div className="lofty-dropdown-wrap">
              <select
                className="lofty-pill-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Filter by city"
              >
                {(cities.length ? cities : [{ slug: 'pune', name: 'Pune', societies_count: 0 }]).map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="lofty-category-scroller">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`lofty-cat-pill ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <Icon size={18} className="cat-icon" />
                    <span className="cat-text">{cat.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="lofty-filter-actions">
              <div className="lofty-view-toggle" role="group" aria-label="Buy or rent">
                <button
                  type="button"
                  className={`view-toggle-btn ${mode === 'buy' ? 'active' : ''}`}
                  onClick={() => setMode('buy')}
                >
                  <span>Buy</span>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${mode === 'rent' ? 'active' : ''}`}
                  onClick={() => setMode('rent')}
                >
                  <span>Rent</span>
                </button>
              </div>

              <button
                type="button"
                className="lofty-action-pill-btn"
                onClick={() => setSortIdx((i) => (i + 1) % SORTS.length)}
                aria-label={`Sort by ${sort.label}`}
              >
                <ArrowUpDown size={14} />
                <span>{sort.label}</span>
              </button>

              <div className="lofty-view-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={15} />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary bar */}
      <div className="lofty-social-proof-bar">
        <div className="social-proof-item">
          <strong>{data ? data.total.toLocaleString('en-IN') : '–'}</strong>
          <span>{mode === 'buy' ? 'homes for sale' : 'homes for rent'}</span>
        </div>
        <span className="proof-dot">·</span>
        <div className="social-proof-item">
          <span>Prices from scraped Magicbricks listings</span>
        </div>
      </div>

      {/* 3. Grid */}
      <div className="lofty-grid-container">
        {error ? (
          <div className="lofty-empty-state" role="alert">
            <h3>Could not load homes</h3>
            <p>{error}</p>
            <button type="button" className="lofty-btn-primary" onClick={retry}>Try again</button>
          </div>
        ) : loading && !data ? (
          <div className={`lofty-cards-grid ${viewMode}`} aria-busy="true">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="lofty-card lofty-card-skeleton" />
            ))}
          </div>
        ) : societies.length === 0 ? (
          <div className="lofty-empty-state">
            <h3>No homes found</h3>
            <p>
              {category === 'favorites'
                ? 'You have not saved any homes yet. Use the heart on a card to save one.'
                : `No homes ${mode === 'rent' ? 'for rent' : 'for sale'} match these filters. Try another category or clear the search.`}
            </p>
            <button type="button" className="lofty-btn-primary" onClick={resetFilters}>Reset filters</button>
          </div>
        ) : (
          <div className={`lofty-cards-grid ${viewMode}`} aria-busy={loading}>
            {societies.map((s) => (
              <SocietyTile
                key={s.id}
                society={s}
                mode={mode}
                favorite={!!favorites[s.id]}
                imageIndex={imageIdx[s.id] || 0}
                onOpen={() => onOpenSociety(s.id)}
                onFavorite={(e) => toggleFavorite(s.id, e)}
                onStep={(delta, len, e) => stepImage(s.id, len, delta, e)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="lofty-floating-ai-fab"
        onClick={onOpenAssistant}
        aria-label="Ask Vertex AI Property Assistant"
        title="Ask Vertex AI Property Assistant"
      >
        <Sparkles size={22} />
      </button>
    </div>
  )
}

interface SocietyTileProps {
  society: SocietyCard
  mode: FlatMode
  favorite: boolean
  imageIndex: number
  onOpen: () => void
  onFavorite: (e: React.MouseEvent) => void
  onStep: (delta: number, len: number, e: React.MouseEvent) => void
}

function SocietyTile({ society: s, mode, favorite, imageIndex, onOpen, onFavorite, onStep }: SocietyTileProps) {
  const thumbs = (s.images ?? []).map((i) => i.thumb).filter(Boolean)
  const images = thumbs.length ? thumbs : [PLACEHOLDER_IMG]
  const badges = cardBadges(s)
  const yieldPct = grossYield(s.prices)
  const rent = lowestRent(s.prices)
  const subtitle = [s.locality, s.pincode ? `Pune ${s.pincode}` : 'Pune'].filter(Boolean).join(', ')

  const priceLine =
    mode === 'rent'
      ? rent != null ? `from ${formatInr(rent)}/mo` : 'Rent on request'
      : s.price_min != null
        ? s.price_max && s.price_max !== s.price_min
          ? `${formatInr(s.price_min)} – ${formatInr(s.price_max)}`
          : formatInr(s.price_min)
        : 'Price on request'

  return (
    <div
      className="lofty-card"
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}
    >
      <div className="lofty-card-image-wrap">
        <img src={images[imageIndex % images.length]} alt={s.name} className="lofty-card-img" loading="lazy" />

        <div className="lofty-card-tag-pills">
          {badges.map((b, i) => (
            <span key={b} className={`card-badge-pill ${i === 0 ? 'badge-purple' : i === 1 && s.status?.toLowerCase().includes('ready') ? 'badge-emerald' : 'badge-dark'}`}>
              {b}
            </span>
          ))}
        </div>

        <button
          type="button"
          className={`lofty-card-fav-btn ${favorite ? 'favorited' : ''}`}
          onClick={onFavorite}
          aria-label={favorite ? `Remove ${s.name} from favorites` : `Save ${s.name} to favorites`}
          aria-pressed={favorite}
        >
          <Heart size={16} fill={favorite ? '#EF4444' : 'none'} color={favorite ? '#EF4444' : '#FFFFFF'} />
        </button>

        {images.length > 1 && (
          <>
            <div className="carousel-nav-arrows">
              <button type="button" className="caro-arrow left" onClick={(e) => onStep(-1, images.length, e)} aria-label="Previous photo">
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="caro-arrow right" onClick={(e) => onStep(1, images.length, e)} aria-label="Next photo">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="lofty-card-dots">
              {images.map((_, dot) => (
                <span key={dot} className={`card-dot ${dot === imageIndex % images.length ? 'active' : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="lofty-card-info">
        <h3 className="lofty-card-title">{s.name}</h3>
        <p className="lofty-card-location">{subtitle}</p>

        <div className="lofty-card-metrics-row">
          <div className="metrics-left">
            <strong className="lofty-price n">{priceLine}</strong>
            {mode === 'buy' && s.psf_now != null && (
              <>
                <span className="bullet">·</span>
                <span className="n">{formatInr(s.psf_now)}/sqft</span>
              </>
            )}
            {yieldPct != null && (
              <>
                <span className="bullet">·</span>
                <span className="lofty-yield n" title="Gross yield: annual median rent / median price">
                  {yieldPct.toFixed(1)}% gross yield
                </span>
              </>
            )}
            {s.score != null && (
              <>
                <span className="bullet">·</span>
                <span className="lofty-valuation val-clear n" title="Flat Finder score">
                  {s.score.toFixed(1)}/10
                </span>
              </>
            )}
          </div>
        </div>

        <div className="lofty-card-investors">
          <Star size={13} className="investors-icon" />
          <span className="n">
            {s.rating != null ? `${s.rating.toFixed(1)} · ` : ''}
            {s.review_count ?? 0} {s.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
    </div>
  )
}
