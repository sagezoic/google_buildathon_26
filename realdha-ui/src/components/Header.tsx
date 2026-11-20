import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Check,
  Upload,
} from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface HeaderProps {
  currentView: 'landing' | 'search' | 'passport' | 'upload'
  scenario: Scenario
  scenarios: Scenario[]
  onNavigate: (view: 'landing' | 'search' | 'passport' | 'upload') => void
  onSwitch: (s: Scenario) => void
  onOpenUpload: () => void
  onOpenShare: () => void
  onOpenTour: () => void
}

export function Header({
  currentView,
  scenario,
  scenarios,
  onNavigate,
  onSwitch,
  onOpenUpload,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.realdhaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.streetAddress && s.streetAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.unit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectScenarioFromSearch = (s: Scenario) => {
    onSwitch(s)
    onNavigate('passport')
    setSearchOpen(false)
    setSearchTerm('')
  }

  return (
    <header className="lofty-header">
      <div className="lofty-header-inner">
        {/* LEFT: Logo & Navigation */}
        <div className="lofty-header-left">
          <div
            className="lofty-logo-wrap"
            onClick={() => onNavigate('search')}
            style={{ cursor: 'pointer' }}
            title="REALDHA Property Marketplace"
          >
            <div className="lofty-logo-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 9.5V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9.5L12 2Z" fill="#5252EE"/>
                <path d="M12 6L5 11.25V19.5H19V11.25L12 6Z" fill="#7879F1"/>
                <path d="M10 14H14V19.5H10V14Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <div className="lofty-logo-text">
              REALDHA
            </div>
          </div>

          <nav className="lofty-nav-links">
            <button
              type="button"
              className={`lofty-nav-link ${currentView === 'search' || currentView === 'passport' ? 'active' : ''}`}
              onClick={() => onNavigate('search')}
            >
              Marketplace
            </button>
            <button
              type="button"
              className={`lofty-nav-link ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => onNavigate('upload')}
            >
              Upload &amp; Verify
            </button>
            <button
              type="button"
              className={`lofty-nav-link ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => onNavigate('landing')}
            >
              About
            </button>
          </nav>
        </div>

        {/* CENTER: Rounded Search Bar (Screenshot 2 Reference) */}
        <div className="lofty-header-center" ref={searchRef}>
          <div
            className="lofty-header-search-wrap"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} className="lofty-search-icon" />
            <input
              type="text"
              className="lofty-header-search-input"
              value={searchOpen ? searchTerm : ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search address or city"
              aria-label="Search address or city"
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate('search')
                  setSearchOpen(false)
                }
              }}
            />
          </div>

          {searchOpen && (
            <div className="lofty-search-dropdown">
              <div className="search-dropdown-heading">
                <span>Verified Properties in Maharashtra ({scenarios.length})</span>
              </div>
              <div className="search-dropdown-results">
                {filteredScenarios.map((s) => (
                  <div
                    key={s.id}
                    className={`dropdown-row ${s.id === scenario.id ? 'active' : ''}`}
                    onClick={() => handleSelectScenarioFromSearch(s)}
                  >
                    <div className="row-info">
                      <strong className="row-address">{s.streetAddress || s.unit}</strong>
                      <span className="row-sub">{s.cityStateZip || `${s.project}, ${s.location}`}</span>
                      <small className="row-id n">{s.realdhaId}</small>
                    </div>
                    <div className="row-meta">
                      <span className={`status-pill ${s.stamp.type}`}>
                        {s.stamp.title.split('·')[0]}
                      </span>
                      {s.id === scenario.id && <Check size={14} className="text-indigo" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Log In & Sign Up (Screenshot 2 Reference) */}
        <div className="lofty-header-right">
          <button
            type="button"
            className="lofty-upload-quick-btn"
            onClick={onOpenUpload}
            title="Upload property document for instant verification"
          >
            <Upload size={14} />
            <span>Verify Deed</span>
          </button>

          <button
            type="button"
            className="lofty-login-btn"
            onClick={() => onNavigate('search')}
          >
            Log In
          </button>

          <button
            type="button"
            className="lofty-signup-btn"
            onClick={() => onNavigate('search')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  )
}
