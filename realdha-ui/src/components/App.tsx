import { useState } from 'react'
import { scenarios } from '../data/scenarios'
import { Header } from './Header'
import { PropertyDetails } from './PropertyDetails'
import { GeminiDrawer } from './GeminiDrawer'
import { DocumentDossierModal } from './DocumentDossierModal'
import { UploadVerifyModal } from './UploadVerifyModal'
import { ShareModal } from './ShareModal'
import { TourModal } from './TourModal'
import { LandingPage } from './LandingPage'
import { PropertySearch } from './PropertySearch'
import { SocietyDetail } from './SocietyDetail'
import { UploadVerifyFlow } from './UploadVerifyFlow'
import type { Scenario, DocumentRecord } from '../data/scenarios'
import '../App.css'

export type AppView = 'landing' | 'search' | 'passport' | 'upload' | 'society'

export function App() {
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('society')
  })
  const [searchQuery, setSearchQuery] = useState('')

  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window === 'undefined') return 'search'
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam === 'society' && params.get('society')) return 'society'
    if (viewParam === 'passport' || viewParam === 'search' || viewParam === 'upload' || viewParam === 'landing') {
      return viewParam as AppView
    }
    return 'search' // Default to the Marketplace view
  })

  const [activeScenario, setActiveScenario] = useState<Scenario>(() => {
    if (typeof window === 'undefined') return scenarios[0]
    const params = new URLSearchParams(window.location.search)
    const scenarioId = params.get('scenario')
    if (scenarioId) {
      const found = scenarios.find((s) => s.id === scenarioId)
      if (found) return found
    }
    return scenarios[0]
  })

  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('tour') === 'on'
  })

  // Sync view & scenario to URL history for seamless linkability
  const handleNavigate = (view: AppView) => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', view)
      if (view !== 'society') url.searchParams.delete('society')
      window.history.replaceState({}, '', url.toString())
    }
  }

  const handleOpenSociety = (id: string) => {
    setSelectedSocietyId(id)
    setCurrentView('society')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', 'society')
      url.searchParams.set('society', id)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const handleSwitchScenario = (s: Scenario) => {
    setActiveScenario(s)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('scenario', s.id)
      window.history.replaceState({}, '', url.toString())
    }
  }

  return (
    <div className={`realdha-app-wrapper lofty-theme view-${currentView}`}>
      {/* Universal Lofty Header */}
      <Header
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* VIEW 1: Marketplace, backed by the Flat Finder API */}
      {currentView === 'search' && (
        <main className="view-container view-search-container">
          <PropertySearch
            searchQuery={searchQuery}
            onOpenSociety={handleOpenSociety}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        </main>
      )}

      {/* VIEW 1b: Society detail from the API */}
      {currentView === 'society' && selectedSocietyId && (
        <main className="view-container view-society-container">
          <SocietyDetail societyId={selectedSocietyId} onBack={() => handleNavigate('search')} />
        </main>
      )}

      {/* VIEW 2: Property Details & Digital Passport (Screenshot 1 Reference) */}
      {currentView === 'passport' && (
        <main className="view-container view-details-container">
          <PropertyDetails
            scenario={activeScenario}
            scenarios={scenarios}
            onSwitchScenario={handleSwitchScenario}
            onBackToMarketplace={() => handleNavigate('search')}
            onOpenDocument={setSelectedDoc}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        </main>
      )}

      {/* VIEW 3: Dedicated Upload & Verify Studio Flow */}
      {currentView === 'upload' && (
        <main className="view-container view-upload-container">
          <UploadVerifyFlow
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSwitchScenario}
            onNavigate={handleNavigate}
          />
        </main>
      )}

      {/* VIEW 4: Institutional Public Landing Page */}
      {currentView === 'landing' && (
        <main className="view-container view-landing-container">
          <LandingPage
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSwitchScenario}
            onNavigate={handleNavigate}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onOpenTourModal={() => setIsTourOpen(true)}
          />
        </main>
      )}

      {/* Bottom Grounded Vertex AI Assistant Drawer */}
      <GeminiDrawer
        key={activeScenario.id}
        scenario={activeScenario}
        onOpenDocument={setSelectedDoc}
        forceOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Interactive Global Modals */}
      <DocumentDossierModal
        document={selectedDoc}
        scenario={activeScenario}
        onClose={() => setSelectedDoc(null)}
      />

      <UploadVerifyModal
        scenario={activeScenario}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <ShareModal
        scenario={activeScenario}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  )
}
