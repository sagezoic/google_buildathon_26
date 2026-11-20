import { useState, useMemo, useEffect, useRef } from 'react'
import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Heart,
  Banknote,
  Home,
  Building2,
  Trees,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Sparkles,
  RotateCcw,
  Check,
  ArrowRight,
} from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface PropertySearchProps {
  scenarios: Scenario[]
  activeScenario: Scenario
  onSelectScenario: (s: Scenario) => void
  onNavigate: (view: 'landing' | 'search' | 'passport' | 'upload') => void
  onOpenAssistant?: () => void
  searchQuery?: string
  onSearchQueryChange?: (q: string) => void
}

function parsePriceToNum(priceStr: string | undefined): number {
  if (!priceStr) return 0
  const clean = priceStr.replace(/[₹,\s]/g, '')
  if (clean.includes('Cr')) {
    return parseFloat(clean.replace('Cr', '')) * 10000000
  }
  if (clean.includes('L')) {
    return parseFloat(clean.replace('L', '')) * 100000
  }
  const val = parseFloat(clean)
  return isNaN(val) ? 0 : val
}

function parseYieldToNum(yieldStr: string | undefined): number {
  if (!yieldStr) return 0
  const clean = yieldStr.replace(/[%\s]/g, '')
  const val = parseFloat(clean)
  return isNaN(val) ? 0 : val
}

function formatTokenPrice(s: Scenario): string {
  if (s.tokenPrice && !s.tokenPrice.startsWith('$')) {
    return s.tokenPrice
  }
  return '₹1,000 /token'
}

function getPropertySpecsSummary(s: Scenario): string {
  if (s.floorPlan?.type === 'plot') {
    return `${s.carpet || '4,500 sq ft'} · ${s.facing || 'East'} Facing · Residential NA`
  }
  if (s.floorPlan?.type === 'warehouse') {
    return `${s.carpet || '22,500 sq ft'} · Grade-A Logistics · Arterial Access`
  }
  const parts: string[] = []
  if (s.beds && s.beds > 0) parts.push(`${s.beds} Bed${s.beds > 1 ? 's' : ''}`)
  if (s.baths && s.baths > 0) parts.push(`${s.baths} Bath${s.baths > 1 ? 's' : ''}`)
  if (s.carpet) parts.push(s.carpet)
  if (s.floor) parts.push(s.floor)
  return parts.join(' · ')
}

function getTitleVerdict(s: Scenario) {
  if (s.stamp?.type === 'clear') {
    return {
      type: 'clear',
      label: 'Clean 30-Yr Title',
      icon: CheckCircle2,
      detail: '30-year unbroken chain · Zero encumbrance',
      badgeClass: 'badge-verdict-clear',
    }
  }
  if (s.stamp?.type === 'mortgage') {
    return {
      type: 'mortgage',
      label: 'Active Mortgage',
      icon: AlertCircle,
      detail: 'Commercial bank mortgage flagged on property card',
      badgeClass: 'badge-verdict-mortgage',
    }
  }
  if (s.stamp?.type === 'defect') {
    return {
      type: 'defect',
      label: 'Missing Legal Heir',
      icon: AlertTriangle,
      detail: 'Ferfar mutation #4120: relinquishment deed unrecorded',
      badgeClass: 'badge-verdict-defect',
    }
  }
  return {
    type: 'warning',
    label: 'Area Discrepancy',
    icon: AlertTriangle,
    detail: '47 sq m discrepancy between 7/12 & seller draft',
    badgeClass: 'badge-verdict-warning',
  }
}

export function PropertySearch({
  scenarios,
  onSelectScenario,
  onNavigate,
  searchQuery = '',
  onSearchQueryChange,
}: PropertySearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMarket, setSelectedMarket] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('default')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Essential filters
  const [filterTitleStatus, setFilterTitleStatus] = useState<'all' | 'clean' | 'maharera'>('all')
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | 'under-1cr' | '1cr-2.5cr' | '2.5cr-5cr' | 'above-5cr'>('all')
  const [filterMinYield, setFilterMinYield] = useState<number>(0)
  const [filterBedrooms, setFilterBedrooms] = useState<'all' | '1-2' | '3' | '4plus'>('all')

  // Persistent favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('realdha_favorites')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({})

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFilterModalOpen) {
        setIsFilterModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFilterModalOpen])

  const categoryFilters = [
    { id: 'all', label: 'All Assets', icon: LayoutGrid },
    { id: 'verified', label: 'Verified Title', icon: ShieldCheck },
    { id: 'high-rise', label: 'High-Rise', icon: Building2 },
    { id: 'plot', label: 'NA Plots', icon: Trees },
    { id: 'resale', label: 'Resale Flats', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Store },
    { id: 'cash-flowing', label: 'Cash Flowing', icon: Banknote },
    { id: 'no-mortgage', label: 'No Mortgage', icon: CheckCircle2 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ]

  const markets = [
    { id: 'all', label: 'All Markets' },
    { id: 'pune', label: 'Pune, MH' },
    { id: 'mumbai', label: 'Mumbai MMR, MH' },
    { id: 'lonavala', label: 'Lonavala, MH' },
    { id: 'thane', label: 'Thane / Bhiwandi, MH' },
  ]

  const sortOptions = [
    { id: 'default', label: 'Featured & Verified' },
    { id: 'yield-desc', label: 'Yield: High to Low' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'title-health', label: 'Title: Clean First' },
    { id: 'investors-desc', label: 'Most Active' },
  ]

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem('realdha_favorites', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
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

  const handleDotClick = (id: string, dotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImageIndices((prev) => ({
      ...prev,
      [id]: dotIdx,
    }))
  }

  const handleOpenProperty = (s: Scenario) => {
    onSelectScenario(s)
    onNavigate('passport')
  }

  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0
    if (filterTitleStatus !== 'all') count++
    if (filterPriceRange !== 'all') count++
    if (filterMinYield > 0) count++
    if (filterBedrooms !== 'all') count++
    return count
  }, [filterTitleStatus, filterPriceRange, filterMinYield, filterBedrooms])

  const totalActiveFilterCount = useMemo(() => {
    let count = activeAdvancedFilterCount
    if (selectedMarket !== 'all') count++
    if (selectedCategory !== 'all') count++
    if (searchQuery.trim() !== '') count++
    return count
  }, [activeAdvancedFilterCount, selectedMarket, selectedCategory, searchQuery])

  const resetAllFilters = () => {
    if (onSearchQueryChange) onSearchQueryChange('')
    setSelectedCategory('all')
    setSelectedMarket('all')
    setFilterTitleStatus('all')
    setFilterPriceRange('all')
    setFilterMinYield(0)
    setFilterBedrooms('all')
    setSortBy('default')
  }

  const filteredProperties = useMemo(() => {
    const filtered = scenarios.filter((s) => {
      // 1. Text search matching
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = (s.streetAddress || '').toLowerCase().includes(query)
        const matchUnit = (s.unit || '').toLowerCase().includes(query)
        const matchCity = (s.cityStateZip || '').toLowerCase().includes(query)
        const matchProject = (s.project || '').toLowerCase().includes(query)
        const matchLoc = (s.location || '').toLowerCase().includes(query)
        const matchId = (s.realdhaId || '').toLowerCase().includes(query)
        const matchRera = (s.mahaRera || '').toLowerCase().includes(query)
        if (!(matchTitle || matchUnit || matchCity || matchProject || matchLoc || matchId || matchRera)) {
          return false
        }
      }

      // 2. Market filter
      if (selectedMarket !== 'all') {
        const loc = (s.location || '').toLowerCase()
        if (selectedMarket === 'pune' && !loc.includes('pune')) return false
        if (selectedMarket === 'mumbai' && !(loc.includes('mumbai') || loc.includes('mmr') || loc.includes('alibaug'))) return false
        if (selectedMarket === 'lonavala' && !loc.includes('lonavala')) return false
        if (selectedMarket === 'thane' && !(loc.includes('thane') || loc.includes('bhiwandi'))) return false
      }

      // 3. Category tab filter
      if (selectedCategory === 'favorites') {
        if (!favorites[s.id]) return false
      } else if (selectedCategory === 'verified') {
        if (s.stamp?.type !== 'clear' && !s.categoryPills?.includes('Verified Title')) return false
      } else if (selectedCategory === 'high-rise') {
        if (s.floorPlan?.type !== 'highrise' && !s.categoryPills?.some((p) => p.toLowerCase().includes('high-rise'))) return false
      } else if (selectedCategory === 'plot') {
        if (s.floorPlan?.type !== 'plot' && !s.categoryPills?.some((p) => p.toLowerCase().includes('plot') || p.toLowerCase().includes('land'))) return false
      } else if (selectedCategory === 'resale') {
        if (!s.categoryPills?.some((p) => p.toLowerCase().includes('resale'))) return false
      } else if (selectedCategory === 'commercial') {
        if (s.floorPlan?.type !== 'warehouse' && !s.categoryPills?.some((p) => p.toLowerCase().includes('commercial'))) return false
      } else if (selectedCategory === 'cash-flowing') {
        const yieldVal = parseYieldToNum(s.avgRentalYield)
        if (yieldVal <= 0 && !s.categoryPills?.includes('Cash Flowing')) return false
      } else if (selectedCategory === 'no-mortgage') {
        if (s.stamp?.type === 'mortgage' || (!s.categoryPills?.includes('No Mortgage') && s.stamp?.type !== 'clear')) return false
      }

      // 4. Modal filters
      if (filterTitleStatus === 'clean' && s.stamp?.type !== 'clear') return false
      if (filterTitleStatus === 'maharera' && (!s.mahaRera || s.mahaRera === 'Pending')) return false

      if (filterPriceRange !== 'all') {
        const priceNum = parsePriceToNum(s.asking)
        if (filterPriceRange === 'under-1cr' && priceNum >= 10000000) return false
        if (filterPriceRange === '1cr-2.5cr' && (priceNum < 10000000 || priceNum > 25000000)) return false
        if (filterPriceRange === '2.5cr-5cr' && (priceNum <= 25000000 || priceNum > 50000000)) return false
        if (filterPriceRange === 'above-5cr' && priceNum <= 50000000) return false
      }

      if (filterMinYield > 0) {
        const yieldNum = parseYieldToNum(s.avgRentalYield)
        if (yieldNum < filterMinYield) return false
      }

      if (filterBedrooms !== 'all') {
        if (filterBedrooms === '1-2' && (s.beds !== 1 && s.beds !== 2)) return false
        if (filterBedrooms === '3' && s.beds !== 3) return false
        if (filterBedrooms === '4plus' && (!s.beds || s.beds < 4) && s.floorPlan?.type !== 'warehouse' && s.floorPlan?.type !== 'plot') return false
      }

      return true
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'yield-desc') {
        return parseYieldToNum(b.avgRentalYield) - parseYieldToNum(a.avgRentalYield)
      }
      if (sortBy === 'price-asc') {
        return parsePriceToNum(a.asking) - parsePriceToNum(b.asking)
      }
      if (sortBy === 'price-desc') {
        return parsePriceToNum(b.asking) - parsePriceToNum(a.asking)
      }
      if (sortBy === 'title-health') {
        const score = (s: Scenario) => (s.stamp?.type === 'clear' ? 3 : s.stamp?.type === 'warning' ? 2 : 1)
        return score(b) - score(a)
      }
      if (sortBy === 'investors-desc') {
        return (b.investorCount || 0) - (a.investorCount || 0)
      }
      if (a.stamp?.type === 'clear' && b.stamp?.type !== 'clear') return -1
      if (a.stamp?.type !== 'clear' && b.stamp?.type === 'clear') return 1
      return 0
    })
  }, [
    scenarios,
    searchQuery,
    selectedMarket,
    selectedCategory,
    favorites,
    filterTitleStatus,
    filterPriceRange,
    filterMinYield,
    filterBedrooms,
    sortBy,
  ])

  return (
    <div className="lofty-marketplace-root">
      {/* 1. Distilled Single-Row Filter Command Strip */}
      <div className="lofty-filter-header">
        <div className="lofty-filter-container">
          <div className="lofty-filter-top-row">
            {/* Markets Selector */}
            <div className="lofty-dropdown-wrap">
              <select
                className="lofty-pill-select"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                aria-label="Filter by market location"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Horizontal Category Icons List */}
            <div className="lofty-category-scroller" role="tablist" aria-label="Property categories">
              {categoryFilters.map((cat) => {
                const IconComponent = cat.icon
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`lofty-cat-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <IconComponent size={18} className="cat-icon" aria-hidden="true" />
                    <span className="cat-text">{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Controls: Filters, Sort, View Switch */}
            <div className="lofty-filter-actions">
              <button
                type="button"
                className={`lofty-action-pill-btn ${activeAdvancedFilterCount > 0 ? 'active-filter' : ''}`}
                onClick={() => setIsFilterModalOpen(true)}
                aria-label={`Open filters dialog (${activeAdvancedFilterCount} active)`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeAdvancedFilterCount > 0 && (
                  <span className="filters-count-badge">{activeAdvancedFilterCount}</span>
                )}
              </button>

              <div className="lofty-sort-wrap" ref={sortRef}>
                <button
                  type="button"
                  className={`lofty-action-pill-btn ${sortBy !== 'default' ? 'active-sort' : ''}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-haspopup="true"
                  aria-expanded={isSortOpen}
                  aria-label="Sort properties"
                >
                  <ArrowUpDown size={14} />
                  <span>
                    {sortOptions.find((o) => o.id === sortBy)?.label.split(':')[0] || 'Sort'}
                  </span>
                </button>

                {isSortOpen && (
                  <div className="lofty-sort-popover" role="menu">
                    <div className="sort-popover-title">Sort By</div>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`sort-popover-item ${sortBy === opt.id ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy(opt.id)
                          setIsSortOpen(false)
                        }}
                        role="menuitem"
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check size={14} className="sort-check-icon" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="lofty-view-toggle" role="group" aria-label="View layout switch">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Switch to grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <LayoutGrid size={15} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Switch to list view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List size={15} />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Strip (Shows only when filters are active) */}
          {totalActiveFilterCount > 0 && (
            <div className="lofty-active-chips-strip">
              <span className="active-chips-label">Filters:</span>
              <div className="active-chips-list">
                {searchQuery && (
                  <span className="filter-chip">
                    Search: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => onSearchQueryChange && onSearchQueryChange('')}
                      aria-label="Clear search"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedMarket !== 'all' && (
                  <span className="filter-chip">
                    {markets.find((m) => m.id === selectedMarket)?.label}
                    <button type="button" onClick={() => setSelectedMarket('all')} aria-label="Remove market filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="filter-chip">
                    {categoryFilters.find((c) => c.id === selectedCategory)?.label}
                    <button type="button" onClick={() => setSelectedCategory('all')} aria-label="Remove category filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterTitleStatus !== 'all' && (
                  <span className="filter-chip">
                    {filterTitleStatus === 'clean' ? 'Clean Title Only' : 'MahaRERA Sanctioned'}
                    <button type="button" onClick={() => setFilterTitleStatus('all')} aria-label="Remove title filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterPriceRange !== 'all' && (
                  <span className="filter-chip">
                    {
                      filterPriceRange === 'under-1cr' ? 'Under ₹1 Cr' :
                      filterPriceRange === '1cr-2.5cr' ? '₹1 Cr – ₹2.5 Cr' :
                      filterPriceRange === '2.5cr-5cr' ? '₹2.5 Cr – ₹5 Cr' : '₹5 Cr+'
                    }
                    <button type="button" onClick={() => setFilterPriceRange('all')} aria-label="Remove price filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterMinYield > 0 && (
                  <span className="filter-chip">
                    Yield: &gt;{filterMinYield}%
                    <button type="button" onClick={() => setFilterMinYield(0)} aria-label="Remove yield filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterBedrooms !== 'all' && (
                  <span className="filter-chip">
                    {filterBedrooms === '1-2' ? '1–2 BHK' : filterBedrooms === '3' ? '3 BHK' : '4+ BHK'}
                    <button type="button" onClick={() => setFilterBedrooms('all')} aria-label="Remove bedroom filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="clear-all-chips-btn"
                  onClick={resetAllFilters}
                >
                  <RotateCcw size={12} />
                  <span>Clear all</span>
                </button>
              </div>
              <span className="results-counter n">
                {filteredProperties.length} of {scenarios.length} properties
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Quiet Social Proof Ticker */}
      <div className="lofty-social-proof-bar">
        <div className="social-proof-item">
          <strong className="n">₹240Cr+</strong>
          <span>Assets Indexed</span>
        </div>
        <span className="proof-dot" aria-hidden="true">·</span>
        <div className="social-proof-item">
          <strong className="n">1,420+</strong>
          <span>Verified Units</span>
        </div>
        <span className="proof-dot" aria-hidden="true">·</span>
        <div className="social-proof-item">
          <strong className="n">100%</strong>
          <span>On-Chain KMS Proof</span>
        </div>
        <span className="proof-dot" aria-hidden="true">·</span>
        <div className="social-proof-item">
          <strong className="n">4.9★</strong>
          <span>MahaRERA Accuracy</span>
        </div>
      </div>

      {/* 3. Property Cards: Distilled Grid or List */}
      <div className="lofty-grid-container">
        {filteredProperties.length === 0 ? (
          <div className="lofty-empty-state">
            <h3>No Properties Found</h3>
            <p>No verified properties match your current filters. Reset filters to view all properties.</p>
            <button
              type="button"
              className="lofty-btn-primary"
              onClick={resetAllFilters}
            >
              <RotateCcw size={14} />
              <span>Reset All Filters</span>
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
              const tokenPrice = formatTokenPrice(s)
              const yieldVal = s.avgRentalYield || '5.1%'
              const hasValuationVariance = s.valuationDelta && (s.valuationDelta.includes('Under') || s.valuationDelta.includes('Over'))
              const investors = s.investorCount || 271
              const specsSummary = getPropertySpecsSummary(s)
              const verdict = getTitleVerdict(s)
              const VerdictIcon = verdict.icon

              if (viewMode === 'list') {
                /* LIST VIEW MODE (DISTILLED & HIGH-DENSITY) */
                return (
                  <div
                    key={s.id}
                    className="lofty-list-card"
                    onClick={() => handleOpenProperty(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleOpenProperty(s)
                      }
                    }}
                    aria-label={`View details for ${address}, ${cityZip}`}
                  >
                    {/* Media */}
                    <div className="list-card-media">
                      <img
                        src={images[currentImgIdx]}
                        alt={address}
                        className="list-card-img"
                        loading="lazy"
                      />
                      <div className="lofty-card-tag-pills">
                        <span className={`card-badge-pill ${verdict.badgeClass}`}>
                          <VerdictIcon size={12} className="inline-icon" />
                          <span>{verdict.label}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`lofty-card-fav-btn ${isFav ? 'favorited' : ''}`}
                        onClick={(e) => toggleFavorite(s.id, e)}
                        aria-label={isFav ? 'Remove from saved' : 'Save property'}
                      >
                        <Heart size={16} fill={isFav ? '#EF4444' : 'none'} color={isFav ? '#EF4444' : '#FFFFFF'} />
                      </button>

                      {images.length > 1 && (
                        <div className="lofty-card-dots">
                          {images.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              className={`card-dot ${dotIdx === currentImgIdx ? 'active' : ''}`}
                              onClick={(e) => handleDotClick(s.id, dotIdx, e)}
                              aria-label={`Photo ${dotIdx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="list-card-content">
                      <div className="list-card-id-strip">
                        <span className="card-realdha-id n">{s.realdhaId}</span>
                        <span className="dot-divider">·</span>
                        <span className="card-project-name">{s.project}</span>
                      </div>

                      <h3 className="list-card-title">{address}</h3>
                      <p className="list-card-location">
                        <MapPin size={13} className="loc-icon" />
                        <span>{cityZip}</span>
                      </p>

                      <p className="list-card-specs-line n">{specsSummary}</p>

                      <div className="list-card-verdict-summary">
                        <VerdictIcon size={13} className={`verdict-summary-icon ${verdict.type}`} />
                        <span>{verdict.detail}</span>
                      </div>
                    </div>

                    {/* Financials & Action */}
                    <div className="list-card-pricing-col">
                      <div className="pricing-primary-group">
                        <strong className="pricing-headline n">{s.asking}</strong>
                        <span className="token-fraction n">{tokenPrice}</span>
                      </div>

                      <div className="list-yield-tag n">
                        <Sparkles size={12} />
                        <span>{yieldVal} avg yield</span>
                      </div>

                      <div className="list-investors-tag n">
                        <Users size={12} />
                        <span>{investors} interested</span>
                      </div>

                      <button
                        type="button"
                        className="list-inspect-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenProperty(s)
                        }}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              }

              /* GRID VIEW MODE (DISTILLED TO ESSENCE) */
              return (
                <div
                  key={s.id}
                  className="lofty-card"
                  onClick={() => handleOpenProperty(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleOpenProperty(s)
                    }
                  }}
                  aria-label={`View details for ${address}, ${cityZip}`}
                >
                  {/* Photo Carousel */}
                  <div className="lofty-card-image-wrap">
                    <img
                      src={images[currentImgIdx]}
                      alt={address}
                      className="lofty-card-img"
                      loading="lazy"
                    />

                    {/* Single Authoritative Verdict Badge (Top Left) */}
                    <div className="lofty-card-tag-pills">
                      <span className={`card-badge-pill ${verdict.badgeClass}`}>
                        <VerdictIcon size={11} className="inline-icon" />
                        <span>{verdict.label}</span>
                      </span>
                    </div>

                    {/* Favorite Heart (Top Right) */}
                    <button
                      type="button"
                      className={`lofty-card-fav-btn ${isFav ? 'favorited' : ''}`}
                      onClick={(e) => toggleFavorite(s.id, e)}
                      aria-label={isFav ? 'Remove from saved' : 'Save property'}
                    >
                      <Heart size={16} fill={isFav ? '#EF4444' : 'none'} color={isFav ? '#EF4444' : '#FFFFFF'} />
                    </button>

                    {/* Nav Arrows */}
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

                    {/* Dots */}
                    {images.length > 1 && (
                      <div className="lofty-card-dots" role="tablist">
                        {images.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            className={`card-dot ${dotIdx === currentImgIdx ? 'active' : ''}`}
                            onClick={(e) => handleDotClick(s.id, dotIdx, e)}
                            aria-label={`Photo ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="lofty-card-info">
                    {/* ID */}
                    <div className="lofty-card-id-row">
                      <span className="card-realdha-id n">{s.realdhaId}</span>
                    </div>

                    {/* Title & Locality */}
                    <h3 className="lofty-card-title">{address}</h3>
                    <p className="lofty-card-location">
                      <MapPin size={12} className="inline-loc" />
                      <span>{cityZip}</span>
                    </p>

                    {/* Clean Typographic Specs Line */}
                    <p className="lofty-card-specs-line n">{specsSummary}</p>

                    {/* Financials Row */}
                    <div className="lofty-card-pricing-block">
                      <div className="pricing-primary">
                        <strong className="lofty-asking-price n">{s.asking}</strong>
                        <span className="lofty-token-sub n">({tokenPrice})</span>
                      </div>
                      <div className="pricing-yield-wrap">
                        <span className="lofty-yield-pill n">{yieldVal} yield</span>
                        {hasValuationVariance && (
                          <span
                            className={`lofty-valuation-pill ${
                              s.valuationDelta?.includes('Undervalued')
                                ? 'val-undervalued'
                                : 'val-overvalued'
                            }`}
                          >
                            {s.valuationDelta}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="lofty-card-footer">
                      <div className="lofty-card-investors">
                        <Users size={13} className="investors-icon" />
                        <span className="n">{investors} interested</span>
                      </div>
                      <span className="lofty-card-cta">
                        <span>Inspect</span>
                        <ArrowRight size={13} className="cta-arrow" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="lofty-modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
          <div
            className="lofty-filter-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-dialog-title"
          >
            <div className="modal-header">
              <div>
                <h3 id="filter-dialog-title" className="modal-title">
                  Filter Properties
                </h3>
                <p className="modal-subtitle">
                  Refine by title verification, budget, and rental returns.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="filter-section">
                <label className="filter-section-title">Title Health</label>
                <div className="filter-options-grid">
                  <button
                    type="button"
                    className={`filter-option-btn ${filterTitleStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterTitleStatus('all')}
                  >
                    <span>All Assets</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterTitleStatus === 'clean' ? 'active' : ''}`}
                    onClick={() => setFilterTitleStatus('clean')}
                  >
                    <CheckCircle2 size={14} className="opt-icon emerald" />
                    <span>Clean 30-Yr Title Only</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterTitleStatus === 'maharera' ? 'active' : ''}`}
                    onClick={() => setFilterTitleStatus('maharera')}
                  >
                    <span>MahaRERA Sanctioned</span>
                  </button>
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-section-title">Budget / Asking Price</label>
                <div className="filter-options-grid">
                  <button
                    type="button"
                    className={`filter-option-btn ${filterPriceRange === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterPriceRange('all')}
                  >
                    <span>Any Price</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterPriceRange === 'under-1cr' ? 'active' : ''}`}
                    onClick={() => setFilterPriceRange('under-1cr')}
                  >
                    <span>Under ₹1.00 Cr</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterPriceRange === '1cr-2.5cr' ? 'active' : ''}`}
                    onClick={() => setFilterPriceRange('1cr-2.5cr')}
                  >
                    <span>₹1.00 Cr – ₹2.50 Cr</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterPriceRange === '2.5cr-5cr' ? 'active' : ''}`}
                    onClick={() => setFilterPriceRange('2.5cr-5cr')}
                  >
                    <span>₹2.50 Cr – ₹5.00 Cr</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterPriceRange === 'above-5cr' ? 'active' : ''}`}
                    onClick={() => setFilterPriceRange('above-5cr')}
                  >
                    <span>₹5.00 Cr+</span>
                  </button>
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-section-title">Minimum Target Yield</label>
                <div className="filter-options-grid">
                  <button
                    type="button"
                    className={`filter-option-btn ${filterMinYield === 0 ? 'active' : ''}`}
                    onClick={() => setFilterMinYield(0)}
                  >
                    <span>Any Yield</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterMinYield === 4 ? 'active' : ''}`}
                    onClick={() => setFilterMinYield(4)}
                  >
                    <span>4.0%+</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterMinYield === 6 ? 'active' : ''}`}
                    onClick={() => setFilterMinYield(6)}
                  >
                    <span>6.0%+</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterMinYield === 8 ? 'active' : ''}`}
                    onClick={() => setFilterMinYield(8)}
                  >
                    <span>8.0%+</span>
                  </button>
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-section-title">Configuration</label>
                <div className="filter-options-grid">
                  <button
                    type="button"
                    className={`filter-option-btn ${filterBedrooms === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterBedrooms('all')}
                  >
                    <span>All Configurations</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterBedrooms === '1-2' ? 'active' : ''}`}
                    onClick={() => setFilterBedrooms('1-2')}
                  >
                    <span>1 &amp; 2 BHK</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterBedrooms === '3' ? 'active' : ''}`}
                    onClick={() => setFilterBedrooms('3')}
                  >
                    <span>3 BHK</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${filterBedrooms === '4plus' ? 'active' : ''}`}
                    onClick={() => setFilterBedrooms('4plus')}
                  >
                    <span>4+ BHK / Industrial</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-reset-btn"
                onClick={resetAllFilters}
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>
              <button
                type="button"
                className="modal-apply-btn"
                onClick={() => setIsFilterModalOpen(false)}
              >
                <span>Show {filteredProperties.length} Properties</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
