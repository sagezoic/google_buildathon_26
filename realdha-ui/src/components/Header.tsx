import { Search, Upload } from 'lucide-react'
import type { AppView } from './App'

interface HeaderProps {
  currentView: AppView
  searchQuery: string
  onSearchChange: (q: string) => void
  onNavigate: (view: AppView) => void
  onOpenUpload: () => void
}

export function Header({
  currentView,
  searchQuery,
  onSearchChange,
  onNavigate,
  onOpenUpload,
}: HeaderProps) {
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
              className={`lofty-nav-link ${currentView === 'search' || currentView === 'passport' || currentView === 'society' ? 'active' : ''}`}
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

        {/* CENTER: search drives the marketplace query */}
        <div className="lofty-header-center">
          <div className="lofty-header-search-wrap">
            <Search size={16} className="lofty-search-icon" />
            <input
              type="text"
              className="lofty-header-search-input"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value)
                if (currentView !== 'search') onNavigate('search')
              }}
              placeholder="Search society, developer or locality"
              aria-label="Search society, developer or locality"
            />
          </div>
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
