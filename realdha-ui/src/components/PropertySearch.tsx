import { useState, useMemo } from 'react'
import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Heart,
  Banknote,
  Home,
  Building2,
  Palmtree,
  Store,
  UserCheck,
  ShoppingBag,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface PropertySearchProps {
  scenarios: Scenario[]
  activeScenario: Scenario
  onSelectScenario: (s: Scenario) => void
  onNavigate: (view: 'landing' | 'search' | 'passport' | 'upload') => void
  onOpenAssistant?: () => void
}

export function PropertySearch({
  scenarios,
  onSelectScenario,
  onNavigate,
}: PropertySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMarket, setSelectedMarket] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('default')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({})

  // Category navigation tabs with icons (matching Lofty Screenshot 2)
  const categoryFilters = [
    { id: 'all', label: 'All Assets', icon: LayoutGrid },
    { id: 'cash-flowing', label: 'Cash Flowing', icon: Banknote },
    { id: 'high-rise', label: 'Multi Family', icon: Building2 },
    { id: 'single-family', label: 'Single Family', icon: Home },
    { id: 'vacation', label: 'Vacation Rentals', icon: Palmtree },
    { id: 'commercial', label: 'Commercial', icon: Store },
    { id: 'owner-occupied', label: 'Owner Occupied', icon: UserCheck },
    { id: 'seller-buyback', label: 'Seller Buyback', icon: ShoppingBag },
    { id: 'no-mortgage', label: 'No Mortgage', icon: ShieldCheck },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ]

  const markets = [
    { id: 'all', label: 'All Markets' },
    { id: 'pune', label: 'Pune, MH' },
    { id: 'mumbai', label: 'Mumbai MMR, MH' },
    { id: 'lonavala', label: 'Lonavala, MH' },
    { id: 'thane', label: 'Thane / Bhiwandi, MH' },
  ]

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleNextImage = (id: string, imagesLength: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndices((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % imagesLength,
    }))
  }

  const handlePrevImage = (id: string, imagesLength: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndices((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + imagesLength) % imagesLength,
    }))
  }

  const handleOpenProperty = (s: Scenario) => {
    onSelectScenario(s)
    onNavigate('passport')
  }

  const filteredProperties = useMemo(() => {
    return scenarios.filter((s) => {
      // Search matching
      const matchesSearch =
        searchTerm === '' ||
        (s.streetAddress && s.streetAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.cityStateZip && s.cityStateZip.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.realdhaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())

      // Market dropdown matching
      let matchesMarket = true
      if (selectedMarket === 'pune') matchesMarket = s.location.toLowerCase().includes('pune')
      else if (selectedMarket === 'mumbai') matchesMarket = s.location.toLowerCase().includes('mumbai') || s.location.toLowerCase().includes('mmr')
      else if (selectedMarket === 'lonavala') matchesMarket = s.location.toLowerCase().includes('lonavala')
      else if (selectedMarket === 'thane') matchesMarket = s.location.toLowerCase().includes('thane') || s.location.toLowerCase().includes('bhiwandi')

      // Category icon matching
      let matchesCategory = true
      if (selectedCategory === 'favorites') {
        matchesCategory = !!favorites[s.id]
      } else if (selectedCategory === 'cash-flowing') {
        matchesCategory = !!s.categoryPills?.includes('Cash Flowing') || s.floorPlan.type === 'warehouse'
      } else if (selectedCategory === 'high-rise') {
        matchesCategory = s.floorPlan.type === 'highrise' || !!s.categoryPills?.includes('High-Rise')
      } else if (selectedCategory === 'single-family') {
        matchesCategory = !!s.categoryPills?.includes('Single Family')
      } else if (selectedCategory === 'vacation') {
        matchesCategory = !!s.categoryPills?.includes('Vacation Rental') || s.floorPlan.type === 'plot'
      } else if (selectedCategory === 'commercial') {
        matchesCategory = s.floorPlan.type === 'warehouse' || !!s.categoryPills?.includes('Commercial')
      } else if (selectedCategory === 'owner-occupied') {
        matchesCategory = !!s.categoryPills?.includes('Owner Occupied')
      } else if (selectedCategory === 'seller-buyback') {
        matchesCategory = !!s.categoryPills?.includes('Seller Buyback')
      } else if (selectedCategory === 'no-mortgage') {
        matchesCategory = s.stamp.type === 'clear' || !!s.categoryPills?.includes('No Mortgage')
      }

      return matchesSearch && matchesMarket && matchesCategory
    })
  }, [scenarios, searchTerm, selectedMarket, selectedCategory, favorites])

  return (
    <div className="lofty-marketplace-root">
      {/* 1. Category Filter Navigation Bar (Screenshot 2 Reference) */}
      <div className="lofty-filter-header">
        <div className="lofty-filter-container">
          <div className="lofty-filter-top-row">
            {/* Markets Dropdown */}
            <div className="lofty-dropdown-wrap">
              <select
                className="lofty-pill-select"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                aria-label="Filter by market location"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Horizontal Category Icons List */}
            <div className="lofty-category-scroller">
              {categoryFilters.map((cat) => {
                const IconComponent = cat.icon
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`lofty-cat-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <IconComponent size={18} className="cat-icon" />
                    <span className="cat-text">{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Control Bar */}
            <div className="lofty-filter-actions">
              <button type="button" className="lofty-action-pill-btn">
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              <button
                type="button"
                className="lofty-action-pill-btn"
                onClick={() => setSortBy(sortBy === 'default' ? 'yield' : 'default')}
              >
                <ArrowUpDown size={14} />
                <span>{sortBy === 'default' ? 'Default' : 'Yield'}</span>
              </button>

              {/* Grid / List View Toggle */}
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

      {/* 2. Social Proof / Metrics Banner (Screenshot 2 Reference) */}
      <div className="lofty-social-proof-bar">
        <div className="social-proof-item">
          <strong>₹240Cr+</strong>
          <span>indexed</span>
        </div>
        <span className="proof-dot">·</span>
        <div className="social-proof-item">
          <strong>₹36Cr+</strong>
          <span>due diligence completed</span>
        </div>
        <span className="proof-dot">·</span>
        <div className="social-proof-item">
          <strong>1,420+</strong>
          <span>verified units</span>
        </div>
        <span className="proof-dot">·</span>
      </div>

      {/* 3. Property Grid Section (Screenshot 2 Reference) */}
      <div className="lofty-grid-container">
        {filteredProperties.length === 0 ? (
          <div className="lofty-empty-state">
            <h3>No Properties Found</h3>
            <p>No verified properties match your selected filters. Try choosing "All Assets" or clearing the search query.</p>
            <button
              type="button"
              className="lofty-btn-primary"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedMarket('all')
                setSearchTerm('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`lofty-cards-grid ${viewMode}`}>
            {filteredProperties.map((s) => {
              const images = s.images || [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
              ]
              const currentImgIdx = activeImageIndices[s.id] || 0
              const isFav = !!favorites[s.id]
              const address = s.streetAddress || s.unit
              const cityZip = s.cityStateZip || `${s.project}, ${s.location}`
              const tokenPrice = s.tokenPrice || '$50.00 /share'
              const yieldVal = s.avgRentalYield || '5.1%'
              const valuation = s.valuationDelta || (s.stamp.type === 'clear' ? 'Clean Title' : 'Flagged')
              const investors = s.investorCount || 271

              return (
                <div
                  key={s.id}
                  className="lofty-card"
                  onClick={() => handleOpenProperty(s)}
                >
                  {/* Image Carousel */}
                  <div className="lofty-card-image-wrap">
                    <img
                      src={images[currentImgIdx]}
                      alt={address}
                      className="lofty-card-img"
                      loading="lazy"
                    />

                    {/* Tag Pills Overlay (Top Left) */}
                    <div className="lofty-card-tag-pills">
                      {s.categoryPills && s.categoryPills.length > 0 ? (
                        s.categoryPills.slice(0, 3).map((pill, i) => (
                          <span
                            key={i}
                            className={`card-badge-pill ${
                              pill === 'Commercial' ? 'badge-blue' :
                              pill === 'Cash Flowing' ? 'badge-purple' :
                              pill === 'No Mortgage' || pill === 'Verified Title' ? 'badge-emerald' :
                              pill === 'Vacation Rental' ? 'badge-teal' :
                              'badge-dark'
                            }`}
                          >
                            {pill}
                          </span>
                        ))
                      ) : (
                        <span className="card-badge-pill badge-emerald">Verified Title</span>
                      )}
                    </div>

                    {/* Favorite Heart (Top Right) */}
                    <button
                      type="button"
                      className={`lofty-card-fav-btn ${isFav ? 'favorited' : ''}`}
                      onClick={(e) => toggleFavorite(s.id, e)}
                      aria-label="Save property to favorites"
                    >
                      <Heart size={16} fill={isFav ? '#EF4444' : 'none'} color={isFav ? '#EF4444' : '#FFFFFF'} />
                    </button>

                    {/* Left/Right Carousel Controls (visible on hover) */}
                    {images.length > 1 && (
                      <div className="carousel-nav-arrows">
                        <button
                          type="button"
                          className="caro-arrow left"
                          onClick={(e) => handlePrevImage(s.id, images.length, e)}
                          aria-label="Previous photo"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          className="caro-arrow right"
                          onClick={(e) => handleNextImage(s.id, images.length, e)}
                          aria-label="Next photo"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* Pagination Dots (Bottom Center) */}
                    {images.length > 1 && (
                      <div className="lofty-card-dots">
                        {images.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`card-dot ${dotIdx === currentImgIdx ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="lofty-card-info">
                    {/* Street Address */}
                    <h3 className="lofty-card-title">{address}</h3>

                    {/* City, State Zip */}
                    <p className="lofty-card-location">{cityZip}</p>

                    {/* Price & Yield Metrics Row */}
                    <div className="lofty-card-metrics-row">
                      <div className="metrics-left">
                        <strong className="lofty-price n">{tokenPrice}</strong>
                        <span className="bullet">·</span>
                        <span className="lofty-yield n">{yieldVal} avg yield</span>
                        <span className="bullet">·</span>
                        <span className={`lofty-valuation ${valuation.includes('Undervalued') ? 'val-undervalued' : valuation.includes('Overvalued') ? 'val-overvalued' : 'val-clear'}`}>
                          {valuation}
                        </span>
                      </div>
                    </div>

                    {/* Investor / Views Count */}
                    <div className="lofty-card-investors">
                      <Users size={13} className="investors-icon" />
                      <span className="n">{investors} investors</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
